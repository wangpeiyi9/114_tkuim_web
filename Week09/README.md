## 如何啟動後端（npm install、npm run dev）
1. 安裝npm
cd server
npm install
2. 設定環境變數 .env
PORT=3001
ALLOWED_ORIGIN=http://localhost:5173
3. 啟動後端伺服器
npm run dev

## 如何啟動前端（Live Server / Vite）
- 使用 VS Code Live Server
1. 在 VS Code 打開 client/
2. 右鍵 signup_form.html
3. 選擇 Open with Live Server
- 使用 Vite
1. 初始化（若你未建構 Vite）
npm create vite@latest client -- --template vanilla
2. 執行
cd client
npm install
npm run dev

## API 端點文件
- GET /api/signup 取得目前報名清單
  {
  "total": 2,
  "data": [
    {
      "id": "a1b2c3d4",
      "name": "小明",
      "email": "ming@test.com",
      "phone": "0912345678",
      "interests": ["後端入門"],
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
- POST /api/signup 新增報名資料(失敗會回傳錯誤訊息)
  {
  "name": "小明",
  "email": "ming@test.com",
  "phone": "0912345678",
  "password": "xxxx",
  "confirmPassword": "xxxx",
  "interests": ["後端入門"]
}

## 測試方式
- 使用Postman
1. 打開 Postman
2. File → Import
3. 匯入 tests/signup_collection.json
4. 點選：
- GET /api/signup
- POST /api/signup
- 按 Send 測試

- 使用 VS Code REST Client
1. 安裝 REST Client Extension
2. 在 VS Code 打開 tests/api.http
3. 全選後按 Send Request

- 使用 curl
1. 成功範例
curl -X POST http://localhost:3001/api/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"小明","email":"a@test.com","phone":"0912345678","password":"demoPass88","confirmPassword":"demoPass88","interests":["後端入門"]}'
2. 取得清單
curl http://localhost:3001/api/signup
3. 錯誤測試（手機格式錯誤）
curl -X POST http://localhost:3001/api/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"錯誤","email":"a@test.com","phone":"123","password":"demoPass88","confirmPassword":"demoPass88","interests":["後端入門"]}'

