import { mkdir, open, readFile, readdir, rename, unlink, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { getVideoMetadata, makeCancelSignal, renderMedia, selectComposition } from '@remotion/renderer';
import { lessonPath, lessonRoot, readLesson, saveLesson, validId, type LocalLesson } from '../src/lib/local-lessons';
import { silentTimeline, speechTimeline } from '../src/lib/lesson-plan';

const voice='JBFqnCBsd6RMkjVDRZzb'; // George, premade male voice verified for this POC.
async function speech(job:LocalLesson) {
  const text=job.plan.scenes.map(s=>s.text).join(' ');
  const cache=path.join(lessonRoot,'audio-cache');await mkdir(cache,{recursive:true});
  const key=createHash('sha256').update(voice+'eleven_multilingual_v2'+text).digest('hex');
  const responseFile=path.join(cache,key+'.json');
  let result;
  try {result=JSON.parse(await readFile(responseFile,'utf8'));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
  if(!result) {
    const apiKey=process.env.ELEVENLABS_API_KEY;if(!apiKey)throw new Error('Narration is unavailable. Choose silent video.');
    const headers={'xi-api-key':apiKey,'Content-Type':'application/json'};
    const response=await fetch('https://api.elevenlabs.io/v1/user/subscription',{headers,signal:AbortSignal.timeout(20000)});
    if(!response.ok)throw new Error('Could not verify the free narration allowance. No speech was requested.');
    const quota=await response.json();
    if(quota.tier!=='free'||!Number.isFinite(quota.character_limit)||!Number.isFinite(quota.character_count)||quota.character_limit-quota.character_count<text.length)throw new Error('Not enough verified free narration credits. Choose silent video.');
    // A request marker prevents automatic resubmission after an uncertain API outcome.
    let marker;try {marker=await open(path.join(cache,key+'.requested'),'wx');}catch{throw new Error('An earlier narration request needs review. Choose silent video for now.');}
    await marker.close();
    const generated=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`,{method:'POST',headers,signal:AbortSignal.timeout(120000),body:JSON.stringify({text,model_id:'eleven_multilingual_v2'})});
    if(!generated.ok)throw new Error('Narration could not be generated. No automatic retry was made.');
    result=await generated.json();await writeFile(responseFile,JSON.stringify(result));
  }
  const timeline=speechTimeline(job.plan,result.alignment);
  if(typeof result.audio_base64!=='string'||result.audio_base64.length<100)throw new Error('The narration audio was incomplete.');
  return {...timeline,audioSrc:`data:audio/mpeg;base64,${result.audio_base64}`};
}
async function render(job:LocalLesson) {
  try {
    job.state=job.input.narration==='male'?'narrating':'rendering';job.updatedAt=new Date().toISOString();await saveLesson(job);
    const timing=job.input.narration==='male'?await speech(job):{...silentTimeline(job.plan),audioSrc:undefined};
    job.state='rendering';job.updatedAt=new Date().toISOString();await saveLesson(job);
    const inputProps={plan:job.plan,sceneStarts:timing.starts,audioSrc:timing.audioSrc};
    const serveUrl=path.resolve('render-bundle');
    const composition=await selectComposition({serveUrl,port:3107,id:job.input.orientation==='vertical'?'LessonVertical':'LessonLandscape',inputProps});
    composition.durationInFrames=Math.ceil(timing.duration*30);
    const output=path.join(lessonPath(job.owner,job.id),'partial.mp4');
    const {cancelSignal,cancel}=makeCancelSignal();const timeout=setTimeout(cancel,8*60_000);
    try {await renderMedia({serveUrl,port:3107,composition,inputProps,codec:'h264',pixelFormat:'yuv420p',outputLocation:output,concurrency:2,logLevel:'error',cancelSignal});}finally{clearTimeout(timeout);}
    const metadata=await getVideoMetadata(output);
    if(!metadata.durationInSeconds||metadata.durationInSeconds>90||metadata.width!==composition.width||metadata.height!==composition.height||(job.input.narration==='male'&&!metadata.audioCodec))throw new Error('The video could not be verified.');
    await rename(output,path.join(lessonPath(job.owner,job.id),'final.mp4'));
    job.state='ready';job.duration=metadata.durationInSeconds;console.log(`Ready: ${job.id} (${job.duration}s)`);
  }catch(error){job.state='failed';const message=(error as Error).message;job.error=/^(Narration|Not enough|Could not verify|An earlier|The narration|The video)/.test(message)?message:'Video creation failed. Your lesson was saved; no automatic narration retry was made.';console.error(`Failed: ${job.id}`);}
  job.updatedAt=new Date().toISOString();await saveLesson(job);
}
async function main() {
  if(process.env.LOCAL_PREVIEW!=='true'||process.env.NODE_ENV==='production'||process.env.VERCEL)throw new Error('Local preview mode required');
  await mkdir(lessonRoot,{recursive:true});
  const lockPath=path.join(lessonRoot,'worker.lock');const lock=await open(lockPath,'wx');await lock.writeFile(String(process.pid));await lock.close();
  const beat=()=>writeFile(path.join(lessonRoot,'heartbeat.json'),JSON.stringify({at:Date.now()}));
  await beat();const heartbeat=setInterval(()=>{void beat().catch(()=>{});},4000);
  let stop=false;process.on('SIGINT',()=>{stop=true;});process.on('SIGTERM',()=>{stop=true;});
  console.log('Local lesson worker ready. No database or cloud rendering required.');
  try {
    // Never automatically retry jobs interrupted after speech submission.
    for(const owner of (await readdir(lessonRoot)).filter(validId))for(const id of (await readdir(path.join(lessonRoot,owner))).filter(validId)){const j=await readLesson(owner,id);if(j&&['narrating','rendering'].includes(j.state)){j.state='failed';j.error='The local render was interrupted. No automatic retry was made.';await saveLesson(j);}}
    while(!stop){let worked=false;
      for(const owner of (await readdir(lessonRoot)).filter(validId))for(const id of (await readdir(path.join(lessonRoot,owner))).filter(validId)){
        const job=await readLesson(owner,id);if(job?.state==='queued'){worked=true;await render(job);if(stop)break;}
      }
      if(!worked)await new Promise(r=>setTimeout(r,1000));
    }
  }finally{clearInterval(heartbeat);await unlink(path.join(lessonRoot,'heartbeat.json')).catch(()=>{});await unlink(lockPath);}
}
main().catch(()=>{console.error('Worker unavailable. Check local configuration and whether another worker is running.');process.exitCode=1;});
