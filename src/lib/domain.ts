import { z } from 'zod';

export const renderInput = z.object({
  orientation: z.enum(['vertical', 'landscape']).default('vertical'),
  requestKey: z.string().uuid(),
}).strict();
export type Orientation = 'vertical' | 'landscape';
export type JobState = 'queued' | 'starting' | 'rendering' | 'verifying' | 'ready' | 'failed' | 'needs_action';
export const FINAL_STATES = new Set<JobState>(['ready', 'failed', 'needs_action']);
export interface RenderJob {
  backend?: 'local' | 'cloud';
  _id: string; ownerId: string; requestKey: string; orientation: Orientation;
  title: string; state: JobState; createdAt: Date; updatedAt: Date;
  sandboxId?: string; commandId?: string; objectKey: string;
  outputBytes?: number; checksum?: string; durationSeconds?: number;
  error?: string; leaseUntil: Date; dispatchedAt?: Date;
}
export function ownedFilter(ownerId: string, id: string) {
  if (!ownerId || !id) throw new Error('An authenticated owner and resource ID are required.');
  return { _id: id, ownerId };
}
export function mediaKey(ownerId: string, jobId: string) {
  if (![ownerId, jobId].every(v => /^[a-zA-Z0-9_-]+$/.test(v))) throw new Error('Invalid identifier.');
  return `owners/${ownerId}/jobs/${jobId}/final.mp4`;
}
export function validateOutput(report: unknown): { bytes: number; checksum: string; duration: number } {
  const parsed = z.object({bytes: z.number().int().positive().max(100_000_000), checksum: z.string().regex(/^[a-f0-9]{64}$/), duration: z.number().positive().max(90)}).parse(report);
  return parsed;
}
export function frameCount(seconds: number, fps = 30) {
  if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 90) throw new Error('Duration must be between zero and 90 seconds.');
  return Math.ceil(seconds * fps);
}
export function publicJob(job: RenderJob) {
  return {id: job._id, title: job.title, state: job.state, orientation: job.orientation,
    createdAt: job.createdAt, error: job.error, durationSeconds: job.durationSeconds,
    playable: job.state === 'ready'};
}
