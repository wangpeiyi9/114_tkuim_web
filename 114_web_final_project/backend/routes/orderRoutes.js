const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// CRUD 路由
router.post('/', orderController.createOrder); // 建立訂單
router.get('/', orderController.getAllOrders); // 取得所有訂單
router.get('/:id', orderController.getOrderById); // 取得單一訂單
router.put('/:id', orderController.updateOrder); // 更新訂單
router.delete('/:id', orderController.deleteOrder); // 刪除訂單

module.exports = router;