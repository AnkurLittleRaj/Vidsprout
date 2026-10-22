import { mkdir, readFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { selectComposition, renderMedia, getVideoMetadata } from '@remotion/renderer';
import { client, db, jobs, ensureIndexes } from '../src/lib/db';
import { localRendering } from '../src/lib/config';
import { localVideoPath } from '../src/lib/local-media';
import { validateOutput } from '../src/lib/domain';

async function main() {
  if (!localRendering()) throw new Error('Set LOCAL_RENDER=true in local development.');
  await ensureIndexes();
  console.log('Local render worker ready. No cloud services are used.');
  while (true) {
    // Expired jobs need explicit review; never silently render them twice.
    const expired = await jobs().find({backend:'local',state:{$in:['queued','rendering']},leaseUntil:{$lt:new Date()}}).toArray();
    for (const job of expired) {
      await jobs().updateOne({_id:job._id,state:{$in:['queued','rendering']}},{$set:{state:'needs_action',error:'Local worker was interrupted or timed out. Review this test before retrying.',updatedAt:new Date()}});
      await db().collection('generationSlots').deleteOne({jobId:job._id});
    }
    const job = await jobs().findOneAndUpdate({backend:'local',state:'queued'},{$set:{state:'rendering',updatedAt:new Date()}},{returnDocument:'after',sort:{createdAt:1}});
    if (!job) {await new Promise(resolve=>setTimeout(resolve,1500));continue;}
    try {
      console.log(`Rendering ${job._id} (${job.orientation})`);
      const output = localVideoPath(job);
      await mkdir(path.dirname(output),{recursive:true});
      const serveUrl = path.resolve('render-bundle');
      const composition = await selectComposition({serveUrl,id:job.orientation==='vertical'?'SeedVertical':'SeedLandscape'});
      const temporary = output + '.partial.mp4';
      await renderMedia({serveUrl,composition,codec:'h264',outputLocation:temporary,concurrency:2,pixelFormat:'yuv420p',logLevel:'error'});
      const metadata = await getVideoMetadata(temporary);
      const data = await readFile(temporary);
      const report = validateOutput({bytes:data.length,checksum:createHash('sha256').update(data).digest('hex'),duration:metadata.durationInSeconds});
      if (metadata.width!==composition.width || metadata.height!==composition.height) throw new Error('Unexpected dimensions');
      await rename(temporary,output);
      await jobs().updateOne({_id:job._id,state:'rendering'},{$set:{state:'ready',updatedAt:new Date(),outputBytes:report.bytes,checksum:report.checksum,durationSeconds:report.duration}});
      console.log(`Ready: ${job._id}, ${report.duration}s, ${report.bytes} bytes`);
    } catch {
      await jobs().updateOne({_id:job._id,state:'rendering'},{$set:{state:'failed',updatedAt:new Date(),error:'Local render failed. Check the animation bundle and local browser installation.'}});
      console.error(`Local render failed: ${job._id}`);
    } finally {
      await db().collection('generationSlots').deleteOne({jobId:job._id});
    }
  }
}
main().catch(async()=>{console.error('Local worker could not start. Check MongoDB and LOCAL_RENDER.');await client().close().catch(()=>{});process.exitCode=1;});
