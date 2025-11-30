// server/repositories/participants.js
import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';

const collection = () => getDB().collection('participants');

export async function createParticipant(data) {
  try {
    const result = await collection().insertOne({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return result.insertedId;
  } catch (err) {
    // 捕捉重複 email
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      throw new Error('此 email 已經報名過');
    }
    throw err;
  }
}

export async function listParticipants(page = 1, limit = 10) {
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const skip = (page - 1) * limit;

  const items = await collection()
    .find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const total = await collection().countDocuments();
  return { items, total };
}

export async function updateParticipant(id, patch) {
  const allowedFields = ['phone', 'status'];
  const updateData = {};
  allowedFields.forEach((f) => {
    if (patch[f] !== undefined) updateData[f] = patch[f];
  });
  if (Object.keys(updateData).length === 0) return { matchedCount: 0, modifiedCount: 0 };

  return collection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updateData, updatedAt: new Date() } }
  );
}

export function deleteParticipant(id) {
  return collection().deleteOne({ _id: new ObjectId(id) });
}

// 初始化唯一索引
export async function createIndexes() {
  await collection().createIndex({ email: 1 }, { unique: true });
}
