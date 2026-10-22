// Trusted worker script. R2 URL is in a private config file, not process arguments/logs.
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const { selectComposition, renderMedia, getVideoMetadata } = require('@remotion/renderer');
const reportPath = 'render-report.json';
async function main() {
  const config = JSON.parse(fs.readFileSync('render-config.json','utf8'));
  const serveUrl = path.resolve('remotion-bundle');
  const composition = await selectComposition({serveUrl,id:config.compositionId});
  if(composition.durationInFrames/composition.fps>90) throw new Error('Duration limit exceeded');
  const outputLocation = path.resolve('output.mp4');
  await renderMedia({serveUrl,composition,codec:'h264',outputLocation,concurrency:2,pixelFormat:'yuv420p',logLevel:'error'});
  const metadata = await getVideoMetadata(outputLocation);
  if(!Number.isFinite(metadata.durationInSeconds) || metadata.durationInSeconds>90 || metadata.durationInSeconds<=0) throw new Error('Invalid output duration');
  if(metadata.width!==composition.width || metadata.height!==composition.height) throw new Error('Invalid dimensions');
  const bytes = fs.statSync(outputLocation).size;
  if(bytes<=0 || bytes>100_000_000) throw new Error('Invalid output size');
  const data=fs.readFileSync(outputLocation);
  const checksum=crypto.createHash('sha256').update(data).digest('hex');
  const result=await fetch(config.uploadUrl,{method:'PUT',headers:{'Content-Type':'video/mp4'},body:data,signal:AbortSignal.timeout(120_000)});
  if(!result.ok) throw new Error('Output upload failed');
  fs.writeFileSync(reportPath,JSON.stringify({bytes,checksum,duration:metadata.durationInSeconds}));
  fs.unlinkSync('render-config.json');
}
main().catch(()=>{fs.writeFileSync(reportPath,JSON.stringify({error:'Render or output persistence failed.'}));process.exitCode=1;});
