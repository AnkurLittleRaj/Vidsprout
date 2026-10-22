import { randomUUID } from 'node:crypto';
import { client, db, jobs } from './db';
import { mediaKey, type Orientation, type RenderJob } from './domain';
import { HttpError } from './http';
import { localRendering } from './config';

export async function createJob(ownerId: string, requestKey: string, orientation: Orientation) {
  const existing = await jobs().findOne({ownerId, requestKey});
  if (existing) return existing;
  const now = new Date(); const id = randomUUID();
  const job: RenderJob = {_id: id, ownerId, requestKey, orientation, title: 'How a small idea grows', state: 'queued',
    backend: localRendering() ? 'local' : 'cloud', createdAt: now, updatedAt: now, leaseUntil: new Date(Date.now() + 45 * 60_000), objectKey: mediaKey(ownerId, id)};
  const session = client().startSession();
  try {
    await session.withTransaction(async () => {
      const slot = await db().collection<{_id: string; jobId: string}>('generationSlots').findOne({_id: ownerId}, {session});
      if (slot) throw new HttpError(409, 'You already have an active render. Wait for it to finish.');
      await db().collection<{_id: string; jobId: string}>('generationSlots').insertOne({_id: ownerId, jobId: id}, {session});
      await jobs().insertOne(job, {session});
      // The queued job is the transactional outbox; undispatched records are reconciled by Inngest.
    });
    return job;
  } catch (error) {
    const replay = await jobs().findOne({ownerId, requestKey});
    if (replay) return replay;
    throw error;
  } finally { await session.endSession(); }
}
export async function releaseSlot(job: RenderJob) {
  await db().collection<{_id: string; jobId: string}>('generationSlots').deleteOne({_id: job.ownerId, jobId: job._id});
}
