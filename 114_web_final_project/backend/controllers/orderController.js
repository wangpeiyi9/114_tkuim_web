const Order = require('../models/Order');

// 計算總金額的輔助函數
const calculateTotalAmount = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    
    return items.reduce((total, item) => {
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        return total + (quantity * price);
    }, 0);
};

// 建立新訂單 (Create)
exports.createOrder = async (req, res) => {
    try {
        const { customerName, tableNumber, items } = req.body;
        
        // 驗證 items
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: '請提供至少一項餐點'
            });
        }
        
        // 計算總金額
        const totalAmount = calculateTotalAmount(items);
        
        console.log('建立訂單 - 計算總金額:', {
            items: items,
            totalAmount: totalAmount
        });
        
        // 建立新訂單
        const order = new Order({
            customerName,
            tableNumber,
            items,
            totalAmount,
            status: 'pending'
        });
        
        // 儲存到資料庫
        const savedOrder = await order.save();
        
        res.status(201).json({
            success: true,
            message: '訂單建立成功',
            data: savedOrder
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: '訂單建立失敗',
            error: error.message
        });
    }
};

// 取得所有訂單 (Read All)
exports.getAllOrders = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        
        // 如果有狀態篩選條件
        if (status) {
            query.status = status;
        }
        
        const orders = await Order.find(query).sort({ createdAt: -1 });
        
        // 驗證每個訂單的總金額
        orders.forEach(order => {
            const calculatedTotal = calculateTotalAmount(order.items);
            if (order.totalAmount !== calculatedTotal) {
                console.warn(`訂單 ${order._id} 總金額不匹配:`, {
                    儲存: order.totalAmount,
                    計算: calculatedTotal
                });
            }
        });
        
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '取得訂單失敗',
            error: error.message
        });
    }
};

// 取得單一訂單 (Read Single)
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: '找不到訂單'
            });
        }
        
        // 驗證總金額
        const calculatedTotal = calculateTotalAmount(order.items);
        if (order.totalAmount !== calculatedTotal) {
            console.warn(`單一訂單總金額不匹配:`, {
                訂單ID: order._id,
                儲存: order.totalAmount,
                計算: calculatedTotal
            });
        }
        
        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '取得訂單失敗',
            error: error.message
        });
    }
};

// 更新訂單 (Update)
exports.updateOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        
        console.log('=== 開始更新訂單 ===');
        console.log('訂單ID:', orderId);
        console.log('請求原始資料:', JSON.stringify(req.body, null, 2));
        console.log('請求體類型:', typeof req.body);
        console.log('請求體 keys:', Object.keys(req.body));
        
        // 檢查請求資料
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: '請提供更新資料'
            });
        }
        
        // 取得原始訂單
        const originalOrder = await Order.findById(orderId);
        if (!originalOrder) {
            return res.status(404).json({
                success: false,
                message: '找不到訂單'
            });
        }
        
        console.log('原始訂單資料:', {
            items: originalOrder.items,
            totalAmount: originalOrder.totalAmount
        });
        
        // 準備更新物件
        const updateData = {};
        
        // 處理每個欄位
        if (req.body.customerName !== undefined) {
            updateData.customerName = String(req.body.customerName);
        }
        
        if (req.body.tableNumber !== undefined) {
            const tableNum = parseInt(req.body.tableNumber);
            if (isNaN(tableNum)) {
                return res.status(400).json({
                    success: false,
                    message: '桌號必須是數字'
                });
            }
            updateData.tableNumber = tableNum;
        }
        
        if (req.body.status !== undefined) {
            updateData.status = req.body.status;
        }
        
        // 處理 items
        if (req.body.items !== undefined) {
            console.log('處理 items 資料:', req.body.items);
            
            if (!Array.isArray(req.body.items)) {
                return res.status(400).json({
                    success: false,
                    message: 'items 必須是陣列'
                });
            }
            
            if (req.body.items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: '請提供至少一項餐點'
                });
            }
            
            // 轉換並驗證每個項目
            const processedItems = [];
            let totalAmount = 0;
            
            for (let i = 0; i < req.body.items.length; i++) {
                const item = req.body.items[i];
                console.log(`處理項目 ${i + 1}:`, item);
                
                // 檢查必要欄位
                if (!item.name || item.name.trim() === '') {
                    return res.status(400).json({
                        success: false,
                        message: `第 ${i + 1} 個項目缺少名稱`
                    });
                }
                
                // 轉換數量和價格
                const quantity = parseInt(item.quantity);
                const price = parseFloat(item.price);
                
                console.log(`轉換結果: quantity=${quantity}, price=${price}`);
                
                if (isNaN(quantity) || quantity < 1) {
                    return res.status(400).json({
                        success: false,
                        message: `第 ${i + 1} 個項目的數量無效`
                    });
                }
                
                if (isNaN(price) || price < 0) {
                    return res.status(400).json({
                        success: false,
                        message: `第 ${i + 1} 個項目的價格無效`
                    });
                }
                
                // 計算小計
                const subtotal = quantity * price;
                totalAmount += subtotal;
                
                console.log(`計算小計: ${quantity} × ${price} = ${subtotal}`);
                console.log(`累計總額: ${totalAmount}`);
                
                processedItems.push({
                    name: String(item.name).trim(),
                    quantity: quantity,
                    price: price,
                    _id: item._id || new mongoose.Types.ObjectId()
                });
            }
            
            updateData.items = processedItems;
            updateData.totalAmount = totalAmount;
            
            console.log('處理完成:', {
                items: processedItems,
                totalAmount: totalAmount
            });
        }
        
        // 更新時間戳記
        updateData.updatedAt = Date.now();
        
        console.log('最終更新資料:', JSON.stringify(updateData, null, 2));
        
        // 執行更新
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            updateData,
            { 
                new: true,
                runValidators: true
            }
        );
        
        if (!updatedOrder) {
            return res.status(404).json({
                success: false,
                message: '更新失敗，找不到訂單'
            });
        }
        
        console.log('更新成功！回傳資料:', {
            totalAmount: updatedOrder.totalAmount,
            items: updatedOrder.items
        });
        
        // 驗證：從資料庫重新取得資料
        const verifiedOrder = await Order.findById(orderId);
        const verifiedTotal = verifiedOrder.items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
        );
        
        console.log('驗證結果:', {
            storedTotal: verifiedOrder.totalAmount,
            calculatedTotal: verifiedTotal,
            match: verifiedOrder.totalAmount === verifiedTotal
        });
        
        res.status(200).json({
            success: true,
            message: '訂單更新成功',
            data: verifiedOrder
        });
        
    } catch (error) {
        console.error('更新訂單錯誤:', error);
        res.status(400).json({
            success: false,
            message: '訂單更新失敗',
            error: error.message
        });
    }
};

// 更新訂單狀態 (專用端點)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const order = await Order.findByIdAndUpdate(
            id,
            { 
                status: status,
                updatedAt: Date.now()
            },
            { new: true }
        );
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: '找不到訂單'
            });
        }
        
        res.status(200).json({
            success: true,
            message: '訂單狀態更新成功',
            data: order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: '更新狀態失敗',
            error: error.message
        });
    }
};

// 刪除訂單 (Delete)
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: '找不到訂單'
            });
        }
        
        res.status(200).json({
            success: true,
            message: '訂單刪除成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '訂單刪除失敗',
            error: error.message
        });
    }
};

