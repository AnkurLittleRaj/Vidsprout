import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { mediaKey, type RenderJob } from './domain';
import { localRendering } from './config';
import { HttpError } from './http';

export function localVideoPath(job: RenderJob) {
  return path.join(process.cwd(), '.local-media', mediaKey(job.ownerId, job._id));
}
export async function localVideoResponse(job: RenderJob, request: Request) {
  if (!localRendering()) throw new HttpError(404, 'Video not found.');
  const data = await readFile(localVideoPath(job));
  const headers = new Headers({'Content-Type':'video/mp4','Cache-Control':'private, no-store','Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff'});
  if (new URL(request.url).searchParams.get('download') === '1') headers.set('Content-Disposition','attachment; filename="vidsprout-local-test.mp4"');
  const range = request.headers.get('range');
  let start = 0; let end = data.length - 1;
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (!match[1] && !match[2])) throw new HttpError(416,'Invalid range.');
    start = match[1] ? Number(match[1]) : Math.max(0, data.length - Number(match[2]));
    end = match[1] && match[2] ? Math.min(Number(match[2]),end) : end;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= data.length) throw new HttpError(416,'Invalid range.');
    headers.set('Content-Range',`bytes ${start}-${end}/${data.length}`);
  }
  headers.set('Content-Length',String(end-start+1));
  return new Response(new Uint8Array(data.subarray(start,end+1)),{status:range?206:200,headers});
}
