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

  // 元件載入時取得訂單
  useEffect(() => {
    fetchOrders();
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
      <h1>餐廳點餐系統</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* 新增訂單表單 */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
          <h2>新增訂單</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label>顧客姓名</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>桌號</label>
              <input
                type="number"
                name="tableNumber"
                value={formData.tableNumber}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>餐點名稱</label>
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                required
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <div>
                <label>數量</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label>價格</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              style={{
                width: '100%',
                background: '#007bff',
                color: 'white',
                padding: '10px',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              建立訂單
            </button>
          </form>
        </div>

        {/* 訂單列表 */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
          <h2>訂單列表 ({orders.length})</h2>
          {orders.length === 0 ? (
            <p>目前沒有訂單</p>
          ) : (
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {orders.map((order) => (
                <div key={order._id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{order.customerName}</h3>
                      <p style={{ margin: '5px 0', color: '#666' }}>桌號: {order.tableNumber}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(order._id)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px'
                      }}
                    >
                      刪除
                    </button>
                  </div>
                  
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>點餐項目:</p>
                    {order.items?.map((item, index) => (
                      <div key={index} style={{ fontSize: '14px', color: '#333' }}>
                        {item.name} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                    <p style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '18px' }}>
                      總計: ${order.totalAmount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;