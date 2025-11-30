## 環境需求
- Node.js v18+
- npm v9+
- MongoDB 7 (可透過 Docker 容器運行)
- VS Code (建議安裝 REST Client extension)
- 前端瀏覽器（Chrome/Edge/Firefox 等）

## 啟動指令
1. Docker 啟動 MongoDB  
cd docker
docker-compose up -d

2. 安裝 Node.js 套件  
cd ../server
npm install

3. 啟動後端 Server  
npm run dev

4. 前端表單測試  
開啟 Week09/client/signup_form.html 然後開啟 Live Server 測試

## 測試方式
- 使用 VS Code REST Client
1. 先執行 POST /api/signup，MongoDB 會回傳 JSON，例如：{ "id": "654abc123def4567890" }
2. 將所有 {{last_id}} 替換成回傳的 id。
3. 全選後按 Send Request

- 使用 Postman
1. 打開 Postman → 點擊左上角 Import。
2. 選擇 Raw Text，貼上上面 JSON，然後 Import。
3. 執行 建立報名（POST），回傳 JSON 會包含 _id。
4. 手動將 Postman 變數 last_id 設為這個 _id，之後所有 PATCH / DELETE 會自動套用。
5. GET 可以檢查分頁，確認 CRUD 是否成功。
6. (以下為腳本)  
  {  
  "info": {  
    "_postman_id": "week11-crud-demo",  
    "name": "Week11 Signup API",  
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"  
  },  
  "item": [  
    {  
      "name": "建立報名",  
      "request": {  
        "method": "POST",  
        "header": [  
          { "key": "Content-Type", "value": "application/json" }  
        ],  
        "body": {  
          "mode": "raw",  
          "raw": "{\n  \"name\": \"測試同學\",\n  \"email\": \"test@example.com\",\n  \"phone\": \"0911222333\"\n}"  
        },  
        "url": { "raw": "http://localhost:3001/api/signup", "protocol": "http", "host": ["localhost"], "port": "3001", "path": ["api", "signup"] }  
      },  
      "response": []  
    },  
    {  
      "name": "取得報名清單",  
      "request": {  
        "method": "GET",  
        "header": [],  
        "url": { "raw": "http://localhost:3001/api/signup?page=1&limit=5", "protocol": "http", "host": ["localhost"], "port": "3001", "path": ["api", "signup"], "query": [{"key":"page","value":"1"},{"key":"limit","value":"5"}] }  
      },  
      "response": []  
    },  
    {  
      "name": "更新報名電話",  
      "request": {  
        "method": "PATCH",  
        "header": [  
          { "key": "Content-Type", "value": "application/json" }  
        ],  
        "body": {  
          "mode": "raw",  
          "raw": "{\n  \"phone\": \"0911000111\"\n}"  
        },  
        "url": { "raw": "http://localhost:3001/api/signup/{{last_id}}", "protocol": "http",   "host": ["localhost"], "port": "3001", "path": ["api", "signup", "{{last_id}}"] }  
      },  
      "response": []  
    },  
    {  
      "name": "更新報名狀態",  
      "request": {  
        "method": "PATCH",  
        "header": [  
          { "key": "Content-Type", "value": "application/json" }  
        ],  
        "body": {  
          "mode": "raw",  
          "raw": "{\n  \"status\": \"confirmed\"\n}"  
        },  
        "url": { "raw": "http://localhost:3001/api/signup/{{last_id}}", "protocol": "http",   "host": ["localhost"], "port": "3001", "path": ["api", "signup", "{{last_id}}"] }  
      },  
      "response": []  
    },  
    {  
      "name": "刪除報名",  
      "request": {   
        "method": "DELETE",  
        "header": [],  
        "url": { "raw": "http://localhost:3001/api/signup/{{last_id}}", "protocol": "http",   "host": ["localhost"], "port": "3001", "path": ["api", "signup", "{{last_id}}"] }  
      },  
      "response": []  
    }  
  ]  
}  

- Mongo Shell 指令範例
確保 MongoDB 已經啟動，然後在終端機輸入：  

// 連線到 week11 資料庫
mongosh -u week11-user -p week11-pass --authenticationDatabase week11  

// 切換資料庫
use week11

// 查看 participants collection 所有資料
db.participants.find().pretty()

// 建立唯一索引（email 唯一）
db.participants.createIndex({ email: 1 }, { unique: true })

// 新增一筆測試資料
db.participants.insertOne({
  name: "測試同學",
  email: "test2@example.com",
  phone: "0911999888",
  status: "pending",
  createdAt: new Date(),
  updatedAt: new Date()
})

// 更新資料
db.participants.updateOne(
  { email: "test2@example.com" },
  { $set: { phone: "0911000333", updatedAt: new Date() } }
)

// 刪除資料
db.participants.deleteOne({ email: "test2@example.com" })

## 常見問題 (FAQ)
- Q1：前端表單送出後沒看到 MongoDB 資料？  
確認 Server 是否已啟動且連線成功
確認 .env 中 MONGODB_URI、帳號、密碼正確
若使用 Live Server，API URL 必須指向後端 http://localhost:3001/api/signup
若前後端不同 port，需開啟 CORS 或使用 dev server proxy

- Q2：REST Client / Postman {{last_id}} 變數報錯？  
請先執行 POST /api/signup，取得回傳的 _id，手動替換 {{last_id}}
部分舊版 REST Client 不支援自動變數

- Q3：MongoDB 無法啟動？  
確認 Docker 已啟動並開放 27017 port
若 port 被佔用，可修改 docker-compose.yml 的 ports

- Q4：重複 email 新增失敗？  
系統已建立唯一索引，遇到重複 email 會回傳錯誤訊息

![MongoDB Compass 截圖](./screenshots/MongoDB%20Compass%20截圖.png)