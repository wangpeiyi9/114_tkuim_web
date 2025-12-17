// Week12/server/routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import { findUserByEmail, createUser } from '../repositories/users.js';
import { generateToken } from '../utils/generateToken.js';

const router = express.Router();

/**
 * POST /auth/signup
 * 註冊並回傳 JWT
 */
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, role = 'student' } = req.body;

    const existed = await findUserByEmail(email);
    if (existed) return res.status(400).json({ error: 'Email 已存在' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ email, passwordHash, role });

    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email
    });

    res.json({ 
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /auth/login
 * 登入並回傳 JWT
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ error: '帳號或密碼錯誤' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: '帳號或密碼錯誤' });

    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email
    });

    res.json({ 
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;