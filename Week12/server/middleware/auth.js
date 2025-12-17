// Week12/server/middleware/auth.js
import jwt from 'jsonwebtoken';

// 驗證 JWT 的中介軟體
export function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;

  // 檢查是否有 Authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '缺少授權資訊' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 驗證 JWT token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 將使用者資訊存入 req.user
    req.user = {
      userId: payload.sub, // 使用者 ID 從 sub 取得
      email: payload.email,
      role: payload.role
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: '無效的 token' });
  }
}