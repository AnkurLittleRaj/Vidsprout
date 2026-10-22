import { owner, errorResponse, HttpError } from '@/lib/http';
import { jobs } from '@/lib/db';
import { ownedFilter } from '@/lib/domain';
import { mediaObject } from '@/lib/storage';
import { localVideoResponse } from '@/lib/local-media';
export const runtime = 'nodejs';
export async function GET(request: Request, context: {params: Promise<{id:string}>}) {
  try {
    const ownerId = await owner(request); const {id} = await context.params;
    const job = await jobs().findOne(ownedFilter(ownerId, id));
    if (!job || job.state !== 'ready') throw new HttpError(404, 'Video not found.');
    if (job.backend === 'local') return await localVideoResponse(job, request);
    const range = request.headers.get('range') || undefined;
    if (range && !/^bytes=\d*-\d*$/.test(range)) throw new HttpError(416, 'Unsupported byte range.');
    const output = await mediaObject(job.objectKey, range);
    if (!output.Body) throw new HttpError(404, 'Video not found.');
    const headers = new Headers({'Content-Type':'video/mp4','Cache-Control':'private, no-store','Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff'});
    if (output.ContentLength !== undefined) headers.set('Content-Length', String(output.ContentLength));
    if (output.ContentRange) headers.set('Content-Range', output.ContentRange);
    if (new URL(request.url).searchParams.get('download') === '1') headers.set('Content-Disposition', 'attachment; filename="vidsprout-render-test.mp4"');
    return new Response(output.Body.transformToWebStream() as ReadableStream, {status: output.ContentRange ? 206 : 200, headers});
  } catch(e) {return errorResponse(e);}
}
