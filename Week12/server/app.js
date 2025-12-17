// Week12/server/app.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './db.js';
import authRouter from './routes/auth.js';
import signupRouter from './routes/signup.js';
import { authRequired } from './middleware/auth.js';
import { createIndexes } from './repositories/participants.js';

// 取得當前檔案的目錄路徑
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 建立 Express 應用程式
const app = express();

// CORS 設定
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));

// JSON 解析器
app.use(express.json());

// JSON 解析錯誤處理
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      error: '無效的 JSON 格式'
    });
  }
  next();
});

// 服務前端頁面
const clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));

// API 路由
app.use('/auth', authRouter);                    // 認證 API
app.use('/api/signup', authRequired, signupRouter); // 報名資料 API（需要登入）

// 首頁路由
app.get('/', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// 404 處理
app.use((req, res) => {
  res.status(404).json({ error: '找不到請求的資源' });
});

// 全域錯誤處理
app.use((err, req, res, next) => {
  // 資料驗證錯誤
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  // MongoDB 重複鍵錯誤
  if (err.code === 11000) {
    return res.status(409).json({ error: '資料已存在' });
  }
  
  // JWT 錯誤
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: '無效的 token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'token 已過期' });
  }
  
  // 其他伺服器錯誤
  res.status(500).json({ 
    error: err.message || '伺服器內部錯誤'
  });
});

// 導出 app 供測試使用
export { app };

// 檢查是否為直接執行此檔案
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const port = process.env.PORT || 3001;
  
  // 動態導入 net 模組檢查端口
  const net = await import('net');
  
  // 檢查端口是否可用
  function checkPort(port) {
    return new Promise((resolve) => {
      const tester = net.createServer();
      tester.once('error', () => {
        tester.close();
        resolve(false);
      });
      tester.once('listening', () => {
        tester.close();
        resolve(true);
      });
      tester.listen(port);
    });
  }
  
  const portAvailable = await checkPort(port);
  
  if (!portAvailable) {
    console.error(`錯誤：端口 ${port} 已被佔用！`);
    process.exit(1);
  }
  
  // 連接資料庫並啟動伺服器
  connectDB()
    .then(async () => {
      await createIndexes();
      
      app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
      });
    })
    .catch((error) => {
      console.error('Failed to connect MongoDB', error);
      process.exit(1);
    });
}