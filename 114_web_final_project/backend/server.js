const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 中間件
app.use(cors());
app.use(express.json());

// 請求日誌中間件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    if (Object.keys(req.body).length > 0) {
        console.log('請求主體:', req.body);
    }
    next();
});

// MongoDB 連接設定
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant';

const connectWithRetry = () => {
    console.log(`嘗試連接到 MongoDB: ${MONGODB_URI}`);
    
    mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,  // 5秒超時
        socketTimeoutMS: 45000,
        family: 4, 
    })
    .then(() => {
        console.log('MongoDB 連接成功');
        console.log(`資料庫: ${mongoose.connection.name}`);
        console.log(`連接狀態: ${mongoose.connection.readyState === 1 ? '已連接' : '未連接'}`);
    })
    .catch(err => {
        console.error('MongoDB 連接失敗:', err.message);
        console.log('5秒後重試連接...');
        setTimeout(connectWithRetry, 5000);
    });
};

// 監聽連接事件
mongoose.connection.on('error', (err) => {
    console.error('MongoDB 連接錯誤:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB 斷開連接');
    console.log('嘗試重新連接...');
    setTimeout(connectWithRetry, 5000);
});

// 初始連接
connectWithRetry();

// 訂單 Schema
const orderSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: [true, '顧客姓名為必填欄位'],
        trim: true
    },
    tableNumber: {
        type: Number,
        required: [true, '桌號為必填欄位'],
        min: [1, '桌號必須大於0']
    },
    items: [{
        name: {
            type: String,
            required: [true, '餐點名稱為必填'],
            trim: true
        },
        quantity: {
            type: Number,
            required: [true, '數量為必填'],
            min: [1, '數量必須大於0']
        },
        price: {
            type: Number,
            required: [true, '價格為必填'],
            min: [0, '價格不能為負數']
        }
    }],
    totalAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'preparing', 'ready', 'served', 'paid'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// middleware - 只計算總金額
orderSchema.pre('save', function(next) {
    if (this.items && this.items.length > 0) {
        this.totalAmount = this.items.reduce((sum, item) => {
            const quantity = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            return sum + (quantity * price);
        }, 0);
        console.log(`計算總金額: ${this.totalAmount}`);
    }
    next();
});

// 添加 findOneAndUpdate 的 middleware
orderSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate();
    
    // 如果更新了 items，計算總金額
    if (update.$set && update.$set.items) {
        const items = update.$set.items;
        const totalAmount = items.reduce((sum, item) => {
            const quantity = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            return sum + (quantity * price);
        }, 0);
        
        update.$set.totalAmount = totalAmount;
        console.log(`findOneAndUpdate 計算總金額: ${totalAmount}`);
    }
    
    next();
});

const Order = mongoose.model('Order', orderSchema);

// 健康檢查
app.get('/', (req, res) => {
    const mongoStatus = mongoose.connection.readyState;
    const statusMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    
    res.json({
        message: '餐廳點餐系統 API',
        version: '1.0.0',
        database: {
            status: statusMap[mongoStatus] || 'unknown',
            readyState: mongoStatus
        },
        endpoints: {
            getAllOrders: 'GET /api/orders',
            createOrder: 'POST /api/orders',
            updateOrder: 'PUT /api/orders/:id',
            deleteOrder: 'DELETE /api/orders/:id'
        }
    });
});

// 取得所有訂單
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        
        // 驗證每個訂單的總金額
        orders.forEach(order => {
            const calculatedTotal = order.items.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);
            
            if (order.totalAmount !== calculatedTotal) {
                console.warn(`⚠️ 訂單 ${order._id} 總金額不匹配:`, {
                    儲存: order.totalAmount,
                    計算: calculatedTotal
                });
            }
        });
        
        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('取得訂單錯誤:', error);
        res.status(500).json({
            success: false,
            message: '取得訂單失敗',
            error: error.message
        });
    }
});

// 取得單一訂單
app.get('/api/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: '找不到訂單'
            });
        }
        
        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('取得單一訂單錯誤:', error);
        res.status(500).json({
            success: false,
            message: '取得訂單失敗',
            error: error.message
        });
    }
});

// 建立新訂單
app.post('/api/orders', async (req, res) => {
    try {
        console.log('建立訂單請求:', req.body);
        
        const { customerName, tableNumber, items } = req.body;
        
        // 基本驗證
        if (!customerName || !tableNumber) {
            return res.status(400).json({
                success: false,
                message: '請提供顧客姓名和桌號'
            });
        }
        
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: '請提供至少一項餐點'
            });
        }
        
        // 驗證每個項目
        const validatedItems = items.map((item, index) => {
            const quantity = Number(item.quantity);
            const price = Number(item.price);
            
            if (isNaN(quantity) || quantity < 1) {
                throw new Error(`第 ${index + 1} 項餐點數量無效`);
            }
            
            if (isNaN(price) || price < 0) {
                throw new Error(`第 ${index + 1} 項餐點價格無效`);
            }
            
            return {
                name: String(item.name).trim(),
                quantity: quantity,
                price: price
            };
        });
        
        const order = new Order({
            customerName: String(customerName).trim(),
            tableNumber: Number(tableNumber),
            items: validatedItems,
            status: req.body.status || 'pending'
        });
        
        console.log('準備儲存訂單:', {
            customerName: order.customerName,
            tableNumber: order.tableNumber,
            items: order.items
        });
        
        const savedOrder = await order.save();
        
        console.log('訂單建立成功:', {
            id: savedOrder._id,
            totalAmount: savedOrder.totalAmount
        });
        
        res.status(201).json({
            success: true,
            message: '訂單建立成功',
            data: savedOrder
        });
    } catch (error) {
        console.error('建立訂單錯誤:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: '資料驗證失敗',
                errors
            });
        }
        
        res.status(400).json({
            success: false,
            message: error.message || '建立訂單失敗',
            error: error.message
        });
    }
});

// 更新訂單
app.put('/api/orders/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        
        console.log('更新訂單請求:', {
            id: orderId,
            data: req.body
        });
        
        // 先取得原始訂單以確保存在
        const existingOrder = await Order.findById(orderId);
        if (!existingOrder) {
            return res.status(404).json({
                success: false,
                message: '找不到訂單'
            });
        }
        
        console.log('原始訂單:', {
            totalAmount: existingOrder.totalAmount,
            items: existingOrder.items
        });
        
        // 準備更新資料
        const updateData = {};
        
        // 更新基本資訊
        if (req.body.customerName !== undefined) {
            updateData.customerName = String(req.body.customerName).trim();
        }
        
        if (req.body.tableNumber !== undefined) {
            updateData.tableNumber = Number(req.body.tableNumber);
        }
        
        if (req.body.status !== undefined) {
            updateData.status = req.body.status;
        }
        
        // 處理 items 更新
        if (req.body.items !== undefined) {
            if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: '請提供有效的餐點項目陣列'
                });
            }
            
            // 驗證並轉換 items
            const validatedItems = req.body.items.map((item, index) => {
                const quantity = Number(item.quantity);
                const price = Number(item.price);
                
                if (isNaN(quantity) || quantity < 1) {
                    throw new Error(`第 ${index + 1} 項餐點數量無效`);
                }
                
                if (isNaN(price) || price < 0) {
                    throw new Error(`第 ${index + 1} 項餐點價格無效`);
                }
                
                return {
                    name: String(item.name).trim(),
                    quantity: quantity,
                    price: price,
                    _id: item._id || undefined
                };
            });
            
            updateData.items = validatedItems;
            
            // 手動計算總金額以驗證
            const calculatedTotal = validatedItems.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);
            
            console.log('手動計算總金額:', calculatedTotal);
            updateData.totalAmount = calculatedTotal;
        }
        
        console.log('準備更新的資料:', updateData);
        
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { $set: updateData },
            { 
                new: true,
                runValidators: true,
                context: 'query'
            }
        );
        
        if (!updatedOrder) {
            return res.status(404).json({
                success: false,
                message: '更新失敗，找不到訂單'
            });
        }
        
        console.log('更新成功:', {
            totalAmount: updatedOrder.totalAmount,
            items: updatedOrder.items
        });
        
        // 驗證更新結果
        const verifiedOrder = await Order.findById(orderId);
        const expectedTotal = verifiedOrder.items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
        );
        
        console.log('驗證結果:', {
            資料庫總金額: verifiedOrder.totalAmount,
            計算總金額: expectedTotal,
            是否一致: verifiedOrder.totalAmount === expectedTotal
        });
        
        res.json({
            success: true,
            message: '訂單更新成功',
            data: verifiedOrder
        });
    } catch (error) {
        console.error('更新訂單錯誤:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: '資料驗證失敗',
                errors
            });
        }
        
        res.status(400).json({
            success: false,
            message: error.message || '更新訂單失敗',
            error: error.message
        });
    }
});

// 刪除訂單
app.delete('/api/orders/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: '找不到訂單'
            });
        }
        
        console.log('刪除訂單:', order._id);
        
        res.json({
            success: true,
            message: '訂單刪除成功',
            data: order
        });
    } catch (error) {
        console.error('刪除訂單錯誤:', error);
        res.status(500).json({
            success: false,
            message: '刪除訂單失敗',
            error: error.message
        });
    }
});

// 啟動伺服器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`伺服器運行在 http://localhost:${PORT}`);
    console.log(`API 端點: http://localhost:${PORT}/api/orders`);
    console.log(`健康檢查: http://localhost:${PORT}/`);
});