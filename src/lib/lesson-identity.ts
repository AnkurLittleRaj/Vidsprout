import { createHash } from 'node:crypto';

// Stable filesystem namespace derived only from a server-verified account ID.
// Never accept this identifier from a request body or browser cookie.
export function accountLessonOwner(userId: string) {
  if (!userId) throw new Error('Account identity required');
  const hash = createHash('sha256').update('vidsprout-account-lessons-v1\0' + userId).digest('hex').slice(0, 32);
  return `${hash.slice(0,8)}-${hash.slice(8,12)}-${hash.slice(12,16)}-${hash.slice(16,20)}-${hash.slice(20)}`;
}
