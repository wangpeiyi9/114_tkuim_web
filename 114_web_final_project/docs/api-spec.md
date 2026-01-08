# API 規格說明文件

## 基礎資訊

- **Base URL**: `http://localhost:5000`
- **Content-Type**: `application/json`
- **回應格式**: JSON

## 狀態碼說明

| 狀態碼 | 說明 |
|--------|------|
| 200 | 成功 |
| 201 | 建立成功 |
| 400 | 請求錯誤 |
| 404 | 資源不存在 |
| 500 | 伺服器錯誤 |

## 欄位驗證

| 欄位 | 類型 | 規則 | 錯誤訊息 |
|--------|------|------|------|
| customerName | string | 長度 1-50 | 顧客姓名為必填欄位 |
| tableNumber | number | 1-100 | 桌號必須介於 1-100 |
| items | array | 至少 1 項 | 請提供至少一項餐點 |
| items[].name | string | 長度 1-100 | 餐點名稱為必填 |
| items[].quantity | number | ≥ 1 | 數量必須大於 0 |
| items[].price | number | ≥ 0 | 價格不能為負數 |

## 統一回應格式

### 成功回應
```
{
  "success": true,
  "message": "操作成功訊息",
  "data": {} 或 []
}
```

### 錯誤回應
```
{
  "success": false,
  "message": "錯誤訊息",
  "error": "詳細錯誤資訊"
}
```

## 端點列表
- GET /：檢查 API 服務狀態。  
```
GET http://localhost:5000/ 
```

- GET /api/orders：取得所有訂單  
```
GET http://localhost:5000/api/orders
```

- GET /api/orders/:id：取得單一訂單
```
GET http://localhost:5000/api/orders/65a1b2c3d4e5f6a7b8c9d0e1
```

- POST /api/orders：建立新訂單
```
POST http://localhost:5000/api/orders
```
```
{
  "customerName": "test",
  "tableNumber": 1,
  "items": [
    {
      "name": "testMeal",
      "quantity": 2,
      "price": 120
    },
    {
      "name": "testMeal2",
      "quantity": 1,
      "price": 150
    }
  ]
}
```

- PUT /api/orders/:id：更新訂單  
狀態碼：  
pending - 待處理  
preparing - 準備中  
ready - 已完成  
served - 已上菜  
paid - 已付款  
```
PUT http://localhost:5000/api/orders/65a1b2c3d4e5f6a7b8c9d0e1
```
```
{
  "customerName": "修改後的姓名",
  "tableNumber": 10,
  "items": [
    {
      "name": "修改餐點",
      "quantity": 3,
      "price": 200
    }
  ],
  "status": "ready"
}
```

- DELETE /api/orders/:id：刪除訂單
```
DELETE http://localhost:5000/api/orders/65a1b2c3d4e5f6a7b8c9d0e1
```

## 測試指令範例
### 使用 curl
```
# 取得所有訂單
curl http://localhost:5000/api/orders

# 建立新訂單
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "測試顧客",
    "tableNumber": 1,
    "items": [{
      "name": "測試餐點",
      "quantity": 1,
      "price": 100
    }]
  }'

# 更新訂單狀態
curl -X PUT http://localhost:5000/api/orders/訂單ID \
  -H "Content-Type: application/json" \
  -d '{"status": "ready"}'

# 刪除訂單
curl -X DELETE http://localhost:5000/api/orders/訂單ID
```

### 使用 Postman
```
# 匯入以下 Collection：
json
{
  "info": {
    "name": "餐廳點餐系統 API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "健康檢查",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/"
      }
    },
    {
      "name": "取得所有訂單",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/orders"
      }
    },
    {
      "name": "建立新訂單",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"customerName\": \"測試顧客\",\n  \"tableNumber\": 1,\n  \"items\": [{\n    \"name\": \"測試餐點\",\n    \"quantity\": 1,\n    \"price\": 100\n  }]\n}"
        },
        "url": "http://localhost:5000/api/orders"
      }
    }
  ]
}