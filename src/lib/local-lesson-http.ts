import { randomUUID } from 'node:crypto';
import { validId } from './local-lessons';

export function localRequest(request:Request,mutation=false) {
  const url=new URL(request.url);
  if(process.env.LOCAL_PREVIEW!=='true'||process.env.NODE_ENV==='production'||process.env.VERCEL||!['localhost','127.0.0.1','[::1]'].includes(url.hostname))throw new Error('LOCAL_ONLY');
  if(mutation&&(request.headers.get('origin')!==url.origin || request.headers.get('content-type')?.split(';')[0]!=='application/json'))throw new Error('ORIGIN');
}
export function browserOwner(request:Request) {
  const value=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith('vidsprout-local='))?.slice('vidsprout-local='.length);
  return value&&validId(value)?value:null;
}
export function localResponse(data:unknown,owner:string= randomUUID(),status=200) {
  return Response.json(data,{status,headers:{'Cache-Control':'private, no-store','Set-Cookie':`vidsprout-local=${owner}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000`}});
}
