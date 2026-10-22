import { S3Client, GetObjectCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { required } from './config';
let instance: S3Client | undefined;
export function r2() {
  return instance ??= new S3Client({region: 'auto', endpoint: `https://${required('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    credentials: {accessKeyId: required('R2_ACCESS_KEY_ID'), secretAccessKey: required('R2_SECRET_ACCESS_KEY')}});
}
export async function outputUploadUrl(key: string) {
  return getSignedUrl(r2(), new PutObjectCommand({Bucket: required('R2_BUCKET'), Key: key, ContentType: 'video/mp4'}), {expiresIn: 1800});
}
export async function inspectObject(key: string) { return r2().send(new HeadObjectCommand({Bucket: required('R2_BUCKET'), Key: key})); }
export async function mediaObject(key: string, range?: string) {
  return r2().send(new GetObjectCommand({Bucket: required('R2_BUCKET'), Key: key, Range: range}));
}
