import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api/orders';

function App() {
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    tableNumber: '',
    itemName: '',
    quantity: 1,
    price: 0
  });
  const [editingOrder, setEditingOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // 取得所有訂單
  const fetchOrders = async () => {
    try {
      const response = await axios.get(API_URL);
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('取得訂單錯誤:', error);
    }
  };

  // 新增訂單
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        customerName: formData.customerName,
        tableNumber: parseInt(formData.tableNumber),
        items: [{
          name: formData.itemName,
          quantity: parseInt(formData.quantity),
          price: parseFloat(formData.price)
        }]
      };

      await axios.post(API_URL, orderData);
      alert('訂單建立成功！');
      fetchOrders();
      
      // 清空表單
      setFormData({
        customerName: '',
        tableNumber: '',
        itemName: '',
        quantity: 1,
        price: 0
      });
    } catch (error) {
      alert('訂單建立失敗: ' + error.message);
    }
  };

  // 刪除訂單
  const handleDelete = async (id) => {
    if (window.confirm('確定要刪除這筆訂單嗎？')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        alert('訂單刪除成功！');
        fetchOrders();
      } catch (error) {
        alert('刪除失敗: ' + error.message);
      }
    }
  };

  // 設置編輯模式
  const startEditOrder = (order) => {
    setEditingOrder(order);
    setIsEditing(true);
    setFormData({
      customerName: order.customerName,
      tableNumber: order.tableNumber.toString(),
      itemName: order.items[0]?.name || '',
      quantity: order.items[0]?.quantity || 1,
      price: order.items[0]?.price || 0
    });
  };

  // 取消編輯
  const cancelEdit = () => {
    setEditingOrder(null);
    setIsEditing(false);
    setFormData({
      customerName: '',
      tableNumber: '',
      itemName: '',
      quantity: 1,
      price: 0
    });
  };

  // 更新訂單
  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    
    try {
      const orderData = {
        customerName: formData.customerName,
        tableNumber: parseInt(formData.tableNumber),
        items: [{
          name: formData.itemName,
          quantity: parseInt(formData.quantity),
          price: parseFloat(formData.price)
        }]
      };

      await axios.put(`${API_URL}/${editingOrder._id}`, orderData);
      alert('訂單更新成功！');
      
      // 重新取得所有訂單，確保金額正確更新
      await fetchOrders();
      
      // 重置表單和編輯狀態
      setFormData({
        customerName: '',
        tableNumber: '',
        itemName: '',
        quantity: 1,
        price: 0
      });
      setEditingOrder(null);
      setIsEditing(false);
    } catch (error) {
      alert('訂單更新失敗: ' + error.message);
    }
  };

  // 更新訂單狀態 - 修正版本
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      // 先更新本地狀態以獲得即時反饋
      setOrders(orders.map(order => 
        order._id === id ? { ...order, status: newStatus } : order
      ));
      
      // 發送 API 請求，只更新狀態
      await axios.put(`${API_URL}/${id}`, { 
        status: newStatus 
      });
      
      console.log('狀態更新成功:', { id, newStatus });
    } catch (error) {
      console.error('更新狀態錯誤:', error);
      
      // 如果失敗，重新取得資料恢復狀態
      fetchOrders();
      
      alert('更新狀態失敗: ' + (error.response?.data?.message || error.message));
    }
  };

  // 取得狀態的中文名稱和顏色
  const getStatusInfo = (status) => {
    const statusMap = {
      'pending': { label: '待處理', color: '#fbbf24', bgColor: '#fef3c7' },
      'preparing': { label: '準備中', color: '#3b82f6', bgColor: '#dbeafe' },
      'ready': { label: '已完成', color: '#10b981', bgColor: '#d1fae5' },
      'served': { label: '已上菜', color: '#f97316', bgColor: '#ffedd5' },
      'paid': { label: '已付款', color: '#8b5cf6', bgColor: '#ede9fe' }
    };
    return statusMap[status] || { label: '未知', color: '#6b7280', bgColor: '#f3f4f6' };
  };

  // 元件載入時取得訂單
  useEffect(() => {
    fetchOrders();
    
    // 每30秒自動刷新訂單
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  return (
    <div className="container">
      <h1>餐廳點餐管理系統</h1>
      
      <div className="main-layout">
        {/* 新增/編輯訂單表單 */}
        <div className="form-section">
          <h2>{isEditing ? '編輯訂單' : '新增訂單'}</h2>
          {isEditing && (
            <div style={{ marginBottom: '15px', color: '#666' }}>
              <p>正在編輯訂單 ID: {editingOrder?._id?.substring(0, 8)}...</p>
              <button 
                onClick={cancelEdit}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                取消編輯
              </button>
            </div>
          )}
          
          <form onSubmit={isEditing ? handleUpdateOrder : handleSubmit}>
            <div className="form-group">
              <label>顧客姓名</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                placeholder="輸入顧客姓名"
                required
              />
            </div>
            
            <div className="form-group">
              <label>桌號 (1-100)</label>
              <input
                type="number"
                name="tableNumber"
                value={formData.tableNumber}
                onChange={handleInputChange}
                placeholder="輸入桌號"
                min="1"
                max="100"
                required
              />
            </div>
            
            <div className="form-group">
              <label>餐點名稱</label>
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                placeholder="輸入餐點名稱"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>數量</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>價格 (元)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            
            <button type="submit" className="submit-btn">
              {isEditing ? '更新訂單' : '建立訂單'}
            </button>
          </form>
        </div>

        {/* 訂單列表 */}
        <div className="orders-section">
          <h2>
            訂單列表 
            <span className="order-count">({orders.length})</span>
          </h2>
          
          <div className="status-info">
            <div className="status-legend">
              <span className="status-dot" style={{backgroundColor: '#fbbf24'}}></span>待處理
              <span className="status-dot" style={{backgroundColor: '#3b82f6'}}></span>準備中
              <span className="status-dot" style={{backgroundColor: '#10b981'}}></span>已完成
              <span className="status-dot" style={{backgroundColor: '#f97316'}}></span>已上菜
              <span className="status-dot" style={{backgroundColor: '#8b5cf6'}}></span>已付款
            </div>
          </div>
          
          {orders.length === 0 ? (
            <div className="empty-orders">
              <p>目前沒有訂單</p>
              <p className="hint">請在左側建立新訂單</p>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status || 'pending');
                return (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <div>
                        <h3>{order.customerName}</h3>
                        <p className="table-number">桌號: {order.tableNumber}</p>
                        <span 
                          className="status-badge"
                          style={{
                            backgroundColor: statusInfo.bgColor,
                            color: statusInfo.color,
                            borderColor: statusInfo.color
                          }}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      
                      <div className="order-actions">
                        <select
                          value={order.status || 'pending'}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          className="status-select"
                          style={{ borderColor: statusInfo.color }}
                        >
                          <option value="pending">待處理</option>
                          <option value="preparing">準備中</option>
                          <option value="ready">已完成</option>
                          <option value="served">已上菜</option>
                          <option value="paid">已付款</option>
                        </select>
                        
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            onClick={() => startEditOrder(order)}
                            className="edit-btn"
                            style={{
                              background: '#007bff',
                              color: 'white',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            編輯
                          </button>
                          <button
                            onClick={() => handleDelete(order._id)}
                            className="delete-btn"
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            刪除
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="order-items">
                      <p className="items-title">點餐項目:</p>
                      {order.items?.map((item, index) => (
                        <div key={index} className="item-row">
                          <span>{item.name}</span>
                          <span>× {item.quantity}</span>
                          <span>${item.price.toFixed(2)}</span>
                          <span>= ${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="order-footer">
                      <div className="order-meta">
                        <span>訂單 ID: {order._id.substring(0, 8)}...</span>
                        {order.createdAt && (
                          <span>建立時間: {new Date(order.createdAt).toLocaleString()}</span>
                        )}
                      </div>
                      <p className="total-amount">
                        總計: <strong>
                          ${(order.items?.reduce((total, item) => 
                            total + (item.price * item.quantity), 0
                          ) || 0).toFixed(2)}
                        </strong>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;