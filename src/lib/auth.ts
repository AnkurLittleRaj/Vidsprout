import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { client, db } from './db';
import { required } from './config';

function createAuth() {
  return betterAuth({
    database: mongodbAdapter(db(), {client: client()}),
    baseURL: required('BETTER_AUTH_URL'), secret: required('BETTER_AUTH_SECRET'),
    emailAndPassword: {enabled: true, minPasswordLength: 12, maxPasswordLength: 128, requireEmailVerification: false},
    rateLimit: {enabled: true, storage: 'database', window: 60, max: 30},
    trustedOrigins: [required('BETTER_AUTH_URL')],
  });
}
let instance: ReturnType<typeof createAuth> | undefined;
export function auth() {return instance ??= createAuth();}
