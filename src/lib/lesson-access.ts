import { randomUUID } from 'node:crypto';
import { owner } from './http';
import { browserOwner } from './local-lesson-http';
import { accountLessonOwner } from './lesson-identity';

export function accountLessonsEnabled() { return process.env.LOCAL_ACCOUNT_AUTH === 'true'; }
export async function lessonOwner(request: Request, createDemoIdentity = false) {
  // Fail closed when account mode is enabled, even if database configuration fails.
  if (accountLessonsEnabled()) return accountLessonOwner(await owner(request));
  return browserOwner(request) || (createDemoIdentity ? randomUUID() : null);
}
export function lessonResponse(data: unknown, identity: string, status = 200) {
  const headers: Record<string,string> = {'Cache-Control':'private, no-store'};
  if (!accountLessonsEnabled()) headers['Set-Cookie'] = `vidsprout-local=${identity}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000`;
  return Response.json(data, {status, headers});
}
