import { owner, mutationOrigin, errorResponse, HttpError } from '@/lib/http';
import { renderInput, publicJob } from '@/lib/domain';
import { jobs } from '@/lib/db';
import { createJob } from '@/lib/job-service';
import { configuration } from '@/lib/config';
import { dispatchJob } from '@/lib/events';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  try { const ownerId = await owner(request);
    return Response.json({jobs: (await jobs().find({ownerId}).sort({createdAt: -1}).limit(30).toArray()).map(publicJob)}, {headers:{'Cache-Control':'private, no-store'}});
  } catch(e) {return errorResponse(e);}
}
export async function POST(request: Request) {
  try {
    mutationOrigin(request); const ownerId = await owner(request);
    if (!configuration().renderReady) throw new HttpError(503, 'Video creation is temporarily unavailable. Please try again later.');
    const parsed = renderInput.safeParse(await request.json());
    if (!parsed.success) throw new HttpError(400, 'Choose a valid orientation and request ID.');
    const job = await createJob(ownerId, parsed.data.requestKey, parsed.data.orientation);
    try { await dispatchJob(job); } catch { /* persisted outbox will retry; do not lose accepted job */ }
    return Response.json({job: publicJob(job)}, {status: 202});
  } catch(e) {return errorResponse(e);}
}
