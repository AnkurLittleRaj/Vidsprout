import { createSandbox, addBundleToSandbox } from '@remotion/vercel';
import { Sandbox } from '@vercel/sandbox';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { jobs } from './db';
import { configuration } from './config';
import { outputUploadUrl, inspectObject, mediaObject } from './storage';
import { validateOutput, type RenderJob } from './domain';
export async function startRender(job: RenderJob) {
  if(!configuration().renderReady) throw new Error('Rendering disabled');
  const bundleDir=path.join(process.cwd(),'render-bundle');
  await access(path.join(bundleDir,'index.html'));
  const claimed=await jobs().findOneAndUpdate({_id:job._id,state:'queued'},{$set:{state:'starting',updatedAt:new Date()}},{returnDocument:'after'});
  if(!claimed) {
    const current=await jobs().findOne({_id:job._id});
    if(current?.sandboxId && current.commandId) return {sandboxId:current.sandboxId,commandId:current.commandId};
    throw new Error('Render submission outcome requires reconciliation');
  }
  // Mark submission before the external call. Never blindly recreate on an ambiguous response.
  const sandbox=await createSandbox({timeoutInMilliseconds:20*60_000,resources:{vcpus:2}});
  try {
    await jobs().updateOne({_id:job._id,state:'starting'},{$set:{sandboxId:sandbox.name,updatedAt:new Date()}});
    await addBundleToSandbox({sandbox,bundleDir});
    await sandbox.writeFiles([
      {path:'render-worker.cjs',content:await readFile(path.join(process.cwd(),'scripts','sandbox-render.cjs'))},
      {path:'render-config.json',content:Buffer.from(JSON.stringify({compositionId:job.orientation==='vertical'?'SeedVertical':'SeedLandscape',uploadUrl:await outputUploadUrl(job.objectKey)})),mode:0o600},
    ]);
    const command=await sandbox.runCommand({cmd:'node',args:['render-worker.cjs'],detached:true});
    await jobs().updateOne({_id:job._id,state:'starting'},{$set:{commandId:command.cmdId,state:'rendering',updatedAt:new Date()}});
    return {sandboxId:sandbox.name,commandId:command.cmdId};
  } catch(error) {await sandbox.stop().catch(()=>{});throw error;}
}
export async function pollRender(sandboxId:string,commandId:string) {
  const sandbox=await Sandbox.get({name:sandboxId});
  const command=await sandbox.getCommand(commandId);
  if(command.exitCode===null) return {done:false as const};
  if(command.exitCode!==0) throw new Error('Render worker failed');
  const buffer=await sandbox.readFileToBuffer({path:'render-report.json'});
  if(!buffer) throw new Error('Render report missing');
  return {done:true as const,report:validateOutput(JSON.parse(buffer.toString('utf8')))};
}
export async function finalizeRender(job:RenderJob,report:ReturnType<typeof validateOutput>) {
  const object=await inspectObject(job.objectKey);
  if(object.ContentLength!==report.bytes || object.ContentType!=='video/mp4') throw new Error('Output validation failed');
  const stored=await mediaObject(job.objectKey);
  if(!stored.Body) throw new Error('Output missing');
  const hash=createHash('sha256');
  for await (const chunk of stored.Body as AsyncIterable<Uint8Array>) hash.update(chunk);
  if(hash.digest('hex')!==report.checksum) throw new Error('Output checksum mismatch');
  const result=await jobs().updateOne({_id:job._id,state:{$in:['rendering','verifying']}},{$set:{state:'ready',updatedAt:new Date(),outputBytes:report.bytes,checksum:report.checksum,durationSeconds:report.duration}});
  if(!result.matchedCount) {
    const current=await jobs().findOne({_id:job._id});
    if(current?.state!=='ready') throw new Error('Job cannot be finalized');
  }
}
export async function stopRender(sandboxId?:string) {
  if(!sandboxId)return;
  const sandbox=await Sandbox.get({name:sandboxId});
  await sandbox.stop();
}
