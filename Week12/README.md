## 啟動方式
- 啟動 Docker  
cd Week12/docker  
docker compose up -d
- 啟動伺服器  
cd Week12/server  
npm run dev

## 測試方式
- 使用 VS Code REST Client
1. 開啟 tests/api.http 檔案 
2. 點擊每個請求上方的 "Send Request" 測試

- 自動化測試  
運行所有測試：npm test

- 使用終端機 curl
1. 登入獲取 token  

    登入管理員並儲存 token  
    ADMIN_TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@example.com", "password": "admin123"}' \
    | grep -o '"token":"[^"]*"' | cut -d'"' -f4)  
    echo "管理員 Token: $ADMIN_TOKEN" 

    登入學生並儲存 token  
    STUDENT_TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "student@example.com", "password": "admin123"}' \
    | grep -o '"token":"[^"]*"' | cut -d'"' -f4)  
    echo "學生 Token: $STUDENT_TOKEN"

 2. 建立測試資料

    echo "學生建立資料..."  
    STUDENT_DATA=$(curl -s -X POST http://localhost:3001/api/signup \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $STUDENT_TOKEN" \
    -d '{"name": "測試學生", "email": "student-test-data@example.com", "phone": "0912345678"}')

    STUDENT_ID=$(echo $STUDENT_DATA | grep -o '"id":"[^"]*"' | cut -d'"' -f4)  
    echo "學生資料 ID: $STUDENT_ID"

    echo "管理員建立資料..."  
    ADMIN_DATA=$(curl -s -X POST http://localhost:3001/api/signup \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{"name": "測試管理員", "email": "admin-test-data@example.com", "phone": "0987654321"}')

    ADMIN_ID=$(echo $ADMIN_DATA | grep -o '"id":"[^"]*"' | cut -d'"' -f4)  
    echo "管理員資料 ID: $ADMIN_ID"

3. 權限測試

    echo "測試 1: 學生嘗試刪除管理員資料..."  
    curl -X DELETE http://localhost:3001/api/signup/$ADMIN_ID \
    -H "Authorization: Bearer $STUDENT_TOKEN" \
    -w "\n狀態碼: %{http_code}\n"

    echo "\n測試 2: 學生刪除自己資料..."  
    curl -X DELETE http://localhost:3001/api/signup/$STUDENT_ID \
    -H "Authorization: Bearer $STUDENT_TOKEN" \
    -w "\n狀態碼: %{http_code}\n"

    echo "\n測試 3: 管理員刪除自己資料..."  
    curl -X DELETE http://localhost:3001/api/signup/$ADMIN_ID \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -w "\n狀態碼: %{http_code}\n"

## 測試帳號列表（登入用）
| 角色 | 電子郵件 | 密碼 | 權限說明 |
| :-----| :----- | :----- | :----- |
| Admin | admin@example.com | admin123 | 可管理所有使用者的報名資料 |
| Student | student@example.com | admin123 | 只能管理自己的報名資料 |