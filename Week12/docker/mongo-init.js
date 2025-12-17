// Week12/docker/mongo-init.js
db = db.getSiblingDB('week12');

db.createUser({
  user: 'week12-admin',
  pwd: 'week12-pass',
  roles: [{ role: 'readWrite', db: 'week12' }]
});

// 1. participants 集合加入索引，準備 ownerId 欄位
db.createCollection('participants');
db.participants.createIndex({ ownerId: 1 });
db.participants.createIndex({ email: 1 }, { unique: true });

// 2. users 集合 + email 唯一索引
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });

// 預先建立管理員帳號（使用您生成的 bcrypt 雜湊）
db.users.insertOne({
  email: 'admin@example.com',
  passwordHash: '$2b$10$cZatvz7PwUHCQIGZYEw0BerRFl46gMeRjv/hy4Oh81Wo6Mo0v621K', // ← 使用您的雜湊
  role: 'admin',
  createdAt: new Date()
});

// 預先建立學生帳號（使用相同的雜湊，因為密碼相同）
db.users.insertOne({
  email: 'student@example.com',
  passwordHash: '$2b$10$cZatvz7PwUHCQIGZYEw0BerRFl46gMeRjv/hy4Oh81Wo6Mo0v621K', // ← 相同的雜湊
  role: 'student',
  createdAt: new Date()
});