// Week12/server/db.js
import { MongoClient } from 'mongodb';

let client = null;
let db = null;
let isConnecting = false;

/**
 * 啟動伺服器時建立連線（確保只連一次）
 */
export async function connectDB() {
  // 如果已經有連線，直接返回
  if (db) {
    return db;
  }
  
  // 如果正在連線中，等待
  if (isConnecting) {
    console.log('[DB] 等待資料庫連線中...');
    // 等待最多 10 秒
    for (let i = 0; i < 100; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (db) return db;
    }
    throw new Error('資料庫連線超時');
  }
  
  // 開始連線
  isConnecting = true;
  console.log('[DB] 正在連接到 MongoDB...');
  
  try {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db();
    console.log('[DB]Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('[DB]Failed to connect MongoDB:', error.message);
    client = null;
    db = null;
    isConnecting = false;
    throw error;
  } finally {
    isConnecting = false;
  }
}

/**
 * 取得資料庫物件
 */
export function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
}

/**
 * 統一取得 collection
 */
export function getCollection(name) {
  return getDB().collection(name);
}

/**
 * 結束連線
 */
export async function closeDB() {
  if (client) {
    await client.close();
    console.log('[DB] Connection closed');
    client = null;
    db = null;
  }
}

/**
 * 清理函數
 */
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});