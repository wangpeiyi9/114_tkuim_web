// Week12/server/routes/signup.js
import express from 'express';
import { authRequired } from '../middleware/auth.js';
import {
  createParticipant,
  listParticipants,
  deleteParticipant
} from '../repositories/participants.js';

const router = express.Router();

router.use(authRequired);

// 新增資料
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    
    // 建立資料，傳入使用者 ID
    const insertedId = await createParticipant({
      name,
      email,
      phone
    }, req.user.userId);

    // 確保返回字串格式的 ID
    res.status(201).json({ id: insertedId.toString() });
  } catch (err) {
    next(err);
  }
});

// 查詢資料
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await listParticipants({
      role: req.user.role,
      userId: req.user.userId,
      page: Number(page),
      limit: Number(limit)
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 刪除資料
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await deleteParticipant(req.params.id, req.user);

    // 處理各種錯誤
    if (result.error === 'NO_PERMISSION') {
      return res.status(403).json({ 
        error: '無權刪除此資料'
      });
    }

    if (result.error === 'NOT_FOUND') {
      return res.status(404).json({ 
        error: '資料不存在'
      });
    }

    if (result.error === 'INVALID_ID') {
      return res.status(400).json({ 
        error: '無效的資料 ID 格式'
      });
    }

    // 成功刪除
    res.json({ 
      deleted: result.deletedCount
    });
    
  } catch (err) {
    next(err);
  }
});

export default router;