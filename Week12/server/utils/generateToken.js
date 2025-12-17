// Week12/server/utils/generateToken.js
import jwt from 'jsonwebtoken';

const EXPIRES_IN = '2h';

/**
 * 將使用者資料簽發成 JWT
 */
export function generateToken(user) {
  const payload = {
    sub: user._id?.toString() ?? user.userId, // 使用 userId
    email: user.email,
    role: user.role
  };

  const options = {
    expiresIn: EXPIRES_IN
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
}