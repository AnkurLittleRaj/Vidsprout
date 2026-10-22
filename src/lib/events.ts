import { Inngest } from 'inngest';
import { jobs } from './db';
import type { RenderJob } from './domain';
export const inngest=new Inngest({id:'vidsprout'});
export async function dispatchJob(job:RenderJob) {
  if(job.state!=='queued' || job.backend==='local') return;
  await inngest.send({id:`render-${job._id}`,name:'vidsprout/render.requested',data:{jobId:job._id}});
  await jobs().updateOne({_id:job._id},{$set:{dispatchedAt:new Date()}});
}
