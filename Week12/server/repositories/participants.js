// Week12/server/repositories/participants.js
import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';

const collection = () => getDB().collection('participants');

// 建立資料
export async function createParticipant(data, ownerId) {
  const doc = {
    ...data,
    ownerId: ownerId, // 保持原樣，不轉換
    createdAt: new Date(),
    updatedAt: new Date()
  };

  try {
    const result = await collection().insertOne(doc);
    // 返回插入的 ID（ObjectId 轉字串）
    return result.insertedId;
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.email) {
      throw new Error('此 email 已經報名過');
    }
    throw err;
  }
}

// 查詢資料
export async function listParticipants({ role, userId, page = 1, limit = 10 }) {
  const filter =
    role === 'admin'
      ? {}
      : { ownerId: userId };

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    collection()
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection().countDocuments(filter)
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

// 刪除資料 - 修正版本
export async function deleteParticipant(id, reqUser) {
  try {
    // 嘗試將 ID 轉換為 ObjectId
    const objectId = new ObjectId(id);
    
    // 查找資料
    const target = await collection().findOne({ _id: objectId });
    
    // 如果資料不存在
    if (!target) {
      return { 
        deletedCount: 0, 
        error: 'NOT_FOUND'
      };
    }

    // 檢查權限 - 直接比較，不轉換類型
    const isOwner = String(target.ownerId) === String(reqUser.userId);
    const isAdmin = reqUser.role === 'admin';

    // 權限不足
    if (!isOwner && !isAdmin) {
      return { 
        deletedCount: 0, 
        error: 'NO_PERMISSION'
      };
    }

    // 執行刪除
    const result = await collection().deleteOne({ _id: objectId });
    
    return { 
      deletedCount: result.deletedCount, 
      error: null 
    };
    
  } catch (error) {
    // 如果 ID 格式錯誤
    if (error.message.includes('ObjectId')) {
      return { 
        deletedCount: 0, 
        error: 'INVALID_ID'
      };
    }
    throw error;
  }
}

// 建立索引
export async function createIndexes() {
  await collection().createIndex({ email: 1 }, { unique: true });
  await collection().createIndex({ ownerId: 1 });
}