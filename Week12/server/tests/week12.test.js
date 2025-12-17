// Week12/server/tests/week12.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcrypt';

// 設定測試環境變數
// 必須在導入 app 之前設定好環境變數
process.env.JWT_SECRET = 'test-jwt-secret-for-week12-assignment';
process.env.NODE_ENV = 'test';

// 全域變數宣告
let app;
let mongoServer;
let db; // 資料庫實例

describe('Week12 作業驗證測試', () => {
  beforeAll(async () => {
    console.log('開始執行測試前初始化...');
    
    // 啟動記憶體 MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;
    console.log('MongoDB 記憶體伺服器已啟動:', mongoUri);
    
    // 動態導入 app 和資料庫模組
    // 注意：必須在設定環境變數後才導入
    const appModule = await import('../app.js');
    const dbModule = await import('../db.js');
    
    // 初始化資料庫連線
    await dbModule.connectDB();
    db = dbModule.getDB();
    app = appModule.app;
    
    // 確認連線成功
    console.log('資料庫連線已建立');
    
    // 等待連線完全建立
    await new Promise(resolve => setTimeout(resolve, 1000));
  });
  
  afterAll(async () => {
    console.log('測試完成，清理資源...');
    if (mongoServer) {
      await mongoServer.stop();
      console.log('MongoDB 記憶體伺服器已停止');
    }
  });
  
  beforeEach(async () => {
    // 每次測試前清空資料庫
    if (db) {
      await db.collection('users').deleteMany({});
      await db.collection('participants').deleteMany({});
    }
  });
  
  afterEach(async () => {
    // 可選：每次測試後清理
  });
  
  describe('需求 1: 未登入被拒', () => {
    it('未登入訪問 GET /api/signup 應返回 401', async () => {
      const res = await request(app).get('/api/signup');
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });
    
    it('未登入訪問 POST /api/signup 應返回 401', async () => {
      const res = await request(app)
        .post('/api/signup')
        .send({ name: '測試', email: 'test@test.com', phone: '0912345678' });
      expect(res.status).toBe(401);
    });
    
    it('未登入訪問 DELETE /api/signup/:id 應返回 401', async () => {
      const res = await request(app).delete('/api/signup/123');
      expect(res.status).toBe(401);
    });
  });
  
  describe('需求 2: 登入成功與 JWT', () => {
    beforeEach(async () => {
      // 建立測試使用者
      const hash = await bcrypt.hash('test123', 10);
      await db.collection('users').insertOne({
        email: 'user@test.com',
        passwordHash: hash,
        role: 'student',
        createdAt: new Date()
      });
    });
    
    it('正確帳密應登入成功並返回 JWT token', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'user@test.com', password: 'test123' });
      
      console.log('登入回應:', res.status, res.body);
      
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.token).toMatch(/^eyJ/); // JWT 格式
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('user@test.com');
    });
    
    it('錯誤密碼應登入失敗', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'user@test.com', password: 'wrong' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });
  
  describe('需求 3: 權限控制 - 不同角色能看到不同資料', () => {
    let adminToken, studentToken, adminId, studentId;
    
    beforeEach(async () => {
      // 建立 admin 和 student 使用者
      const adminHash = await bcrypt.hash('admin123', 10);
      const studentHash = await bcrypt.hash('student123', 10);
      
      const adminUser = await db.collection('users').insertOne({
        email: 'admin@week12.com',
        passwordHash: adminHash,
        role: 'admin',
        createdAt: new Date()
      });
      
      const studentUser = await db.collection('users').insertOne({
        email: 'student@week12.com',
        passwordHash: studentHash,
        role: 'student',
        createdAt: new Date()
      });
      
      adminId = adminUser.insertedId.toString();
      studentId = studentUser.insertedId.toString();
      
      // 登入獲取 tokens
      const adminRes = await request(app)
        .post('/auth/login')
        .send({ email: 'admin@week12.com', password: 'admin123' });
      adminToken = adminRes.body.token;
      
      const studentRes = await request(app)
        .post('/auth/login')
        .send({ email: 'student@week12.com', password: 'student123' });
      studentToken = studentRes.body.token;
      
      // 建立測試報名資料
      await db.collection('participants').insertMany([
        {
          name: '學員 A (學生)',
          email: 'a@test.com',
          phone: '0911111111',
          ownerId: studentId,
          createdAt: new Date()
        },
        {
          name: '學員 B (管理員)',
          email: 'b@test.com',
          phone: '0922222222',
          ownerId: adminId,
          createdAt: new Date()
        }
      ]);
    });
    
    it('admin 應能看到所有報名資料', async () => {
      const res = await request(app)
        .get('/api/signup')
        .set('Authorization', `Bearer ${adminToken}`);
      
      console.log('Admin 查看資料回應:', res.body);
      
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBe(2);
    });
    
    it('student 應只能看到自己的資料', async () => {
      const res = await request(app)
        .get('/api/signup')
        .set('Authorization', `Bearer ${studentToken}`);
      
      console.log('Student 查看資料回應:', res.body);
      
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].ownerId).toBe(studentId);
    });
  });
  
  describe('需求 4: 權限控制 - 刪除權限', () => {
    let adminToken, studentToken, adminId, studentId;
    let studentDataId, adminDataId;
    
    beforeEach(async () => {
      // 建立使用者
      const adminHash = await bcrypt.hash('admin123', 10);
      const studentHash = await bcrypt.hash('student123', 10);
      
      const adminUser = await db.collection('users').insertOne({
        email: 'admin2@week12.com',
        passwordHash: adminHash,
        role: 'admin',
        createdAt: new Date()
      });
      
      const studentUser = await db.collection('users').insertOne({
        email: 'student2@week12.com',
        passwordHash: studentHash,
        role: 'student',
        createdAt: new Date()
      });
      
      adminId = adminUser.insertedId.toString();
      studentId = studentUser.insertedId.toString();
      
      // 登入獲取 tokens
      const adminRes = await request(app)
        .post('/auth/login')
        .send({ email: 'admin2@week12.com', password: 'admin123' });
      adminToken = adminRes.body.token;
      
      const studentRes = await request(app)
        .post('/auth/login')
        .send({ email: 'student2@week12.com', password: 'student123' });
      studentToken = studentRes.body.token;
      
      // 建立測試資料
      const studentData = await db.collection('participants').insertOne({
        name: '學生資料',
        email: 'student-data@test.com',
        phone: '0933333333',
        ownerId: studentId,
        createdAt: new Date()
      });
      
      const adminData = await db.collection('participants').insertOne({
        name: '管理員資料',
        email: 'admin-data@test.com',
        phone: '0944444444',
        ownerId: adminId,
        createdAt: new Date()
      });
      
      studentDataId = studentData.insertedId.toString();
      adminDataId = adminData.insertedId.toString();
    });
    
    it('student 不能刪除別人的資料 (應返回 403)', async () => {
      const res = await request(app)
        .delete(`/api/signup/${adminDataId}`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      console.log('Student 刪除別人資料回應:', res.status, res.body);
      
      expect([403, 401]).toContain(res.status);
    });
    
    it('student 可以刪除自己的資料', async () => {
      const res = await request(app)
        .delete(`/api/signup/${studentDataId}`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      console.log('Student 刪除自己資料回應:', res.status, res.body);
      
      expect(res.status).toBe(200);
      expect(res.body.deleted).toBe(1);
    });
    
    it('admin 可以刪除任何資料', async () => {
      const res = await request(app)
        .delete(`/api/signup/${studentDataId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      console.log('Admin 刪除資料回應:', res.status, res.body);
      
      expect(res.status).toBe(200);
      expect(res.body.deleted).toBe(1);
    });
  });
  
  describe('需求 5: 完整流程測試', () => {
    it('註冊 → 登入 → 建立資料 → 讀取 → 刪除', async () => {
      // 1. 檢查註冊端點是否存在
      // 如果沒有註冊端點，先建立一個測試使用者
      let token;
      
      try {
        const signupRes = await request(app)
          .post('/auth/signup')
          .send({
            email: 'newuser@week12.com',
            password: 'password123',
            role: 'student'
          });
        
        console.log('註冊回應:', signupRes.status, signupRes.body);
        
        if (signupRes.status === 404 || signupRes.status === 500) {
          // 如果沒有註冊功能，建立一個使用者並登入
          const hash = await bcrypt.hash('password123', 10);
          await db.collection('users').insertOne({
            email: 'newuser@week12.com',
            passwordHash: hash,
            role: 'student',
            createdAt: new Date()
          });
          
          const loginRes = await request(app)
            .post('/auth/login')
            .send({ email: 'newuser@week12.com', password: 'password123' });
          
          token = loginRes.body.token;
        } else {
          expect(signupRes.status).toBe(200);
          token = signupRes.body.token;
        }
      } catch (error) {
        // 處理錯誤，直接建立使用者
        console.log('註冊失敗，改為手動建立使用者:', error.message);
        const hash = await bcrypt.hash('password123', 10);
        await db.collection('users').insertOne({
          email: 'newuser@week12.com',
          passwordHash: hash,
          role: 'student',
          createdAt: new Date()
        });
        
        const loginRes = await request(app)
          .post('/auth/login')
          .send({ email: 'newuser@week12.com', password: 'password123' });
        
        token = loginRes.body.token;
      }
      
      expect(token).toBeDefined();
      
      // 2. 使用 token 建立報名資料
      const createRes = await request(app)
        .post('/api/signup')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '完整測試學員',
          email: 'fulltest@week12.com',
          phone: '0955555555'
        });
      
      console.log('建立資料回應:', createRes.status, createRes.body);
      
      expect(createRes.status).toBe(201);
      const dataId = createRes.body.id || createRes.body._id;
      expect(dataId).toBeDefined();
      
      // 3. 讀取資料
      const readRes = await request(app)
        .get('/api/signup')
        .set('Authorization', `Bearer ${token}`);
      
      console.log('讀取資料回應:', readRes.status, readRes.body);
      
      expect(readRes.status).toBe(200);
      expect(readRes.body.data).toBeDefined();
      expect(readRes.body.data.length).toBeGreaterThan(0);
      
      // 4. 刪除資料
      const deleteRes = await request(app)
        .delete(`/api/signup/${dataId}`)
        .set('Authorization', `Bearer ${token}`);
      
      console.log('刪除資料回應:', deleteRes.status, deleteRes.body);
      
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.deleted).toBe(1);
    });
  });
});