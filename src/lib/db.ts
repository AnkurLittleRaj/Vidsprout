import { MongoClient } from 'mongodb';
import { required } from './config';
import type { RenderJob } from './domain';

const globalDb = globalThis as unknown as {mongoClient?: MongoClient};
export function client() {
  return globalDb.mongoClient ??= new MongoClient(required('MONGODB_URI'), {maxPoolSize: 10, serverSelectionTimeoutMS: 5000});
}
export function db() { return client().db(process.env.MONGODB_DB || 'vidsprout'); }
export function jobs() { return db().collection<RenderJob>('renderJobs'); }
export async function ensureIndexes() {
  await jobs().createIndex({ownerId: 1, requestKey: 1}, {unique: true});
  await jobs().createIndex({ownerId: 1, createdAt: -1});
  await jobs().createIndex({state: 1, dispatchedAt: 1});
  await db().collection('user').createIndex({email: 1}, {unique: true});
}
