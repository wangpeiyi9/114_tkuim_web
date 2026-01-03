# 網路程式設計期末專題

**學生：** 王培怡  
**學號：** 411630485

## 專案名稱
餐廳點餐管理系統

### 功能
- **完整 CRUD**：新增、讀取、更新、刪除訂單
- **即時金額計算**：自動計算訂單總金額與小計
- **訂單狀態管理**：pending → preparing → ready → served → paid
- **響應式設計**：適應桌面、平板、手機各種裝置
- **資料持久化**：MongoDB 資料庫儲存
- **容器化部署**：Docker 一鍵環境部署

### 前端技術
- **框架**：React 18 + Create React App
- **狀態管理**：React Hooks (useState, useEffect)
- **HTTP 客戶端**：Axios
- **樣式框架**：Tailwind CSS + 自定義 CSS
- **開發伺服器**：React Scripts

### 後端技術
- **運行環境**：Node.js 18+
- **框架**：Express.js 4.x
- **資料庫**：MongoDB 7.0 + Mongoose 7.x
- **中間件**：CORS, Express JSON Parser
- **開發工具**：Nodemon, dotenv

### 開發與部署
- **容器化**：Docker + Docker Compose
- **版本控制**：Git + GitHub
- **API 測試**：Postman / cURL / 瀏覽器
- **資料庫管理**：MongoDB Compass

### 環境需求
- **Node.js** v16 或以上
- **npm** v8 或以上 或 **yarn**
- **Docker Desktop**
- **MongoDB**

### 安裝方式

1. 下載專案  
git clone https://github.com/您的帳號/114_tkuim_web.git  
cd 114_tkuim_web/project-final

2. 啟動資料庫 (Docker Compose)  
cd docker  
docker-compose up -d

3. 安裝後端依賴  
cd ../backend  
npm install

4. 安裝前端依賴  
cd ../frontend  
npm install

5. 啟動服務  
- 終端機1 - 後端：  
cd backend && npm run dev

- 終端機2 - 前端：  
cd frontend && npm start

### 使用指引

- 訪問系統
1. 打開瀏覽器  
2. 輸入網址：http://localhost:3000  
3. 您會看到餐廳點餐系統主畫面

- 新增訂單  
1. 輸入顧客姓名、桌號 (1-50)、餐點名稱、數量及單價  
2. 點擊「建立訂單」按鈕  
3. 系統會顯示成功訊息  
4. 訂單自動出現在右側列表

- 查看訂單
1. 訂單列表：右側顯示所有訂單  
2. 訂單資訊：  
顧客姓名、桌號、點餐項目與數量、總金額（自動計算）、訂單狀態

- 刪除訂單
1. 點擊刪除按鈕 
2. 系統會彈出確認視窗
3. 完成刪除：訂單從列表中消失