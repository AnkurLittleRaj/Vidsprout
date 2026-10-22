import { NonRetriableError } from 'inngest';
import { jobs } from './db';
import { FINAL_STATES, type RenderJob } from './domain';
import { startRender, pollRender, finalizeRender, stopRender } from './render';
import { releaseSlot } from './job-service';
import { configuration } from './config';
import { inngest, dispatchJob } from './events';
export const renderWorkflow=inngest.createFunction({
  id:'render-test-v1',triggers:[{event:'vidsprout/render.requested'}],retries:0,concurrency:{limit:1},
  onFailure:async({event})=>{
    const id=event.data.event.data.jobId as string;
    const job=await jobs().findOne({_id:id}); if(!job)return;
    if(job.state!=='ready') await jobs().updateOne({_id:id,state:{$ne:'ready'}},{$set:{state:'needs_action',error:'Your video could not be completed. Please contact support before trying again.',updatedAt:new Date()}});
    await stopRender(job.sandboxId).catch(()=>{});await releaseSlot(job);
  },
},async({event,step})=>{
  const job=await step.run('load-job',async()=>{
    const value=await jobs().findOne({_id:String(event.data.jobId)});
    if(!value || value.backend==='local')throw new NonRetriableError('Cloud job not found');
    return value;
  });
  if(FINAL_STATES.has(job.state))return {state:job.state};
  const persistentJob={...job,createdAt:new Date(job.createdAt),updatedAt:new Date(job.updatedAt),leaseUntil:new Date(job.leaseUntil)} as RenderJob;
  const started=await step.run('start-render',()=>startRender(persistentJob));
  for(let attempt=0;attempt<120;attempt++) {
    await step.sleep(`wait-${attempt}`,'10s');
    const result=await step.run(`poll-${attempt}`,()=>pollRender(started.sandboxId,started.commandId));
    if(result.done) {
      await step.run('persist-result',()=>finalizeRender(persistentJob,result.report));
      await step.run('stop-sandbox',()=>stopRender(started.sandboxId));
      await step.run('release-slot',()=>releaseSlot(persistentJob));
      return {state:'ready'};
    }
  }
  throw new NonRetriableError('Render exceeded its time limit');
});
export const reconcileWorkflow=inngest.createFunction({id:'reconcile-render-outbox',triggers:[{cron:'*/2 * * * *'}],retries:1},async({step})=>{
  if(!configuration().renderReady)return {disabled:true};
  return step.run('reconcile',async()=>{
    const pending=await jobs().find({backend:{$ne:'local'},state:'queued',dispatchedAt:{$exists:false}}).limit(20).toArray();
    for(const job of pending) await dispatchJob(job);
    const expired=await jobs().find({backend:{$ne:'local'},state:{$in:['queued','starting','rendering','verifying']},leaseUntil:{$lt:new Date()}}).limit(20).toArray();
    for(const job of expired) {
      // Do not start another external call for an expired/ambiguous attempt.
      await stopRender(job.sandboxId).catch(()=>{});
      await jobs().updateOne({_id:job._id,state:{$in:['queued','starting','rendering','verifying']}},{$set:{state:'needs_action',error:'This render needs an operator review before retrying.',updatedAt:new Date()}});
      await releaseSlot(job);
    }
    return {dispatched:pending.length,expired:expired.length};
  });
});
