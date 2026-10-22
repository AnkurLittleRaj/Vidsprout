import { mkdir, rename, readFile } from 'node:fs/promises';
import path from 'node:path';
import { selectComposition, renderMedia, getVideoMetadata } from '@remotion/renderer';

await mkdir('.local-media/previews',{recursive:true});
const evaporation=process.argv.includes('--evaporation');
const narrated=process.argv.includes('--narrated');
if(narrated && !evaporation) throw new Error('Narration is currently supported only for evaporation.');
let inputProps={};let narrationDuration;
if(narrated) {
  const timing=JSON.parse(await readFile('.local-media/narration/evaporation-timing.json','utf8'));
  if(!Number.isFinite(timing.duration) || timing.duration<=0 || timing.duration>90 || timing.starts.length!==4 || !timing.starts.every((v,i)=>Number.isFinite(v)&&v>=0&&v<timing.duration&&(i===0||v>timing.starts[i-1]))) throw new Error('Invalid narration timing');
  inputProps={audioSrc:`data:audio/mpeg;base64,${(await readFile('.local-media/narration/evaporation.mp3')).toString('base64')}`,sceneStarts:timing.starts};
  narrationDuration=timing.duration;
}
for (const orientation of ['vertical','landscape']) {
  const serveUrl=path.resolve('render-bundle');
  const composition=await selectComposition({serveUrl,port:3105,inputProps,id:(evaporation?'Evaporation':'Seed')+(orientation==='vertical'?'Vertical':'Landscape')});
  if(narrated) composition.durationInFrames=Math.ceil(narrationDuration*composition.fps);
  const output=path.resolve('.local-media/previews',`${evaporation?'evaporation-':''}${narrated?'narrated-':''}${orientation}.mp4`);
  console.log(`Rendering ${orientation} preview...`);
  await renderMedia({serveUrl,port:3105,composition,inputProps,codec:'h264',outputLocation:output+'.partial.mp4',concurrency:2,pixelFormat:'yuv420p',logLevel:'error'});
  const metadata=await getVideoMetadata(output+'.partial.mp4');
  if(metadata.durationInSeconds<=0 || metadata.durationInSeconds>90 || metadata.width!==composition.width || metadata.height!==composition.height) throw new Error('Invalid video output');
  await rename(output+'.partial.mp4',output);
  console.log(`Ready: ${orientation}, ${metadata.width}x${metadata.height}, ${metadata.durationInSeconds}s`);
}
