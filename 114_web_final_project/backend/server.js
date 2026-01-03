const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 中間件
app.use(cors());
app.use(express.json());

// MongoDB 連接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB 連接成功');
    console.log(`資料庫: ${mongoose.connection.name}`);
  })
  .catch(err => {
    console.error('MongoDB 連接失敗:', err.message);
    process.exit(1);
  });

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
    default: 0  // 改為 default 而不是 required
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'served', 'paid'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// 加入 middleware 自動計算 totalAmount
orderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  }
  next();
});
const Order = mongoose.model('Order', orderSchema);

// 健康檢查
app.get('/', (req, res) => {
  res.json({
    message: '餐廳點餐系統 API',
    version: '1.0.0',
    database: 'MongoDB',
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
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.name || !item.quantity || !item.price) {
        return res.status(400).json({
          success: false,
          message: `第 ${i + 1} 項餐點資訊不完整`
        });
      }
    }
    
    const order = new Order({
      customerName,
      tableNumber,
      items
    });
    
    const savedOrder = await order.save();
    
    res.status(201).json({
      success: true,
      message: '訂單建立成功',
      data: savedOrder
    });
  } catch (error) {
    console.error('建立訂單錯誤:', error);
    
    // Mongoose 驗證錯誤
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: '資料驗證失敗',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: '建立訂單失敗',
      error: error.message
    });
  }
});

// 更新訂單
app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // 如果要更新項目，移除 totalAmount 讓 middleware 重新計算
    if (updateData.items) {
      delete updateData.totalAmount;
    }
    
    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,           // 返回更新後的文檔
        runValidators: true, // 運行驗證
        context: 'query'     // 確保 middleware 運行
      }
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '找不到訂單'
      });
    }
    
    res.json({
      success: true,
      message: '訂單更新成功',
      data: order
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
    
    res.status(500).json({
      success: false,
      message: '更新訂單失敗',
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

// 全局錯誤處理
app.use((err, req, res, next) => {
  console.error('未處理的錯誤:', err);
  res.status(500).json({
    success: false,
    message: '伺服器內部錯誤',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 啟動伺服器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`伺服器運行在 http://localhost:${PORT}`);
  console.log(`API 端點: http://localhost:${PORT}/api/orders`);
  console.log(`MongoDB URI: ${MONGODB_URI}`);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB 連接已關閉');
  process.exit(0);
});