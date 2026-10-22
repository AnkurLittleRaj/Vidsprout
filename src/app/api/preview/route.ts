import { readFile } from 'node:fs/promises';
import path from 'node:path';
export const runtime='nodejs';
export async function GET(request:Request) {
  if(process.env.LOCAL_PREVIEW!=='true' || process.env.NODE_ENV==='production' || process.env.VERCEL) return new Response(null,{status:404});
  const url=new URL(request.url);
  const orientation=url.searchParams.get('orientation');
  const evaporation=url.searchParams.get('topic')==='evaporation';
  const narrated=evaporation && url.searchParams.get('narrated')==='1';
  if(orientation!=='vertical' && orientation!=='landscape') return new Response(null,{status:400});
  let data:Buffer;
  try {data=await readFile(path.join(process.cwd(),'.local-media','previews',`${evaporation?'evaporation-':''}${narrated?'narrated-':''}${orientation}.mp4`));}
  catch {return Response.json({error:'This preview is not available yet.'},{status:404});}
  const headers=new Headers({'Content-Type':'video/mp4','Cache-Control':'no-store','Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff'});
  if(url.searchParams.get('download')==='1') headers.set('Content-Disposition',`attachment; filename="vidsprout-${narrated?'evaporation-elevenlabs.io-':''}${orientation}-sample.mp4"`);
  let start=0;let end=data.length-1;
  const range=request.headers.get('range');
  if(range) {
    const match=/^bytes=(\d*)-(\d*)$/.exec(range);
    if(!match || (!match[1]&&!match[2])) return new Response(null,{status:416});
    start=match[1]?Number(match[1]):Math.max(0,data.length-Number(match[2]));
    end=match[1]&&match[2]?Math.min(end,Number(match[2])):end;
    if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=data.length) return new Response(null,{status:416});
    headers.set('Content-Range',`bytes ${start}-${end}/${data.length}`);
  }
  headers.set('Content-Length',String(end-start+1));
  return new Response(new Uint8Array(data.subarray(start,end+1)),{status:range?206:200,headers});
}
