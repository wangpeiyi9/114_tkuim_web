const mongoose = require('mongoose');

// 定義訂單資料模型
const orderSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: [true, '顧客姓名為必填欄位']
    },
    tableNumber: {
        type: Number,
        required: [true, '桌號為必填欄位'],
        min: [1, '桌號必須大於0']
    },
    items: [{
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, '數量必須大於0']
        },
        price: {
            type: Number,
            required: true,
            min: [0, '價格不能為負數']
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: [0, '總金額不能為負數']
    },
    status: {
        type: String,
        enum: ['pending', 'preparing', 'ready', 'served', 'paid'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// 更新時間戳記
orderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// 建立 Order 模型
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;