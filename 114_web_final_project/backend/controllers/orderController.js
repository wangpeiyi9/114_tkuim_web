const Order = require('../models/Order');

// 建立新訂單 (Create)
exports.createOrder = async (req, res) => {
    try {
        const { customerName, tableNumber, items } = req.body;
        
        // 計算總金額
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
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
        const { status, items } = req.body;
        
        // 如果更新項目，重新計算總金額
        if (items && items.length > 0) {
            req.body.totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }
        
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: '找不到訂單'
            });
        }
        
        res.status(200).json({
            success: true,
            message: '訂單更新成功',
            data: order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: '訂單更新失敗',
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