// Week12/server/repositories/users.js
import { getCollection } from '../db.js';

export async function findUserByEmail(email) {
  return getCollection('users').findOne({ email });
}

export async function createUser({ email, passwordHash, role = 'student' }) {
  const user = {
    email,
    passwordHash,
    role,
    createdAt: new Date()
  };

  const result = await getCollection('users').insertOne(user);
  return { ...user, _id: result.insertedId };
}

/**
 * 建立 users 索引（Week12 mongo-init.js 已建）
 */
export async function createUserIndexes() {
  await getCollection('users').createIndex({ email: 1 }, { unique: true });
}
