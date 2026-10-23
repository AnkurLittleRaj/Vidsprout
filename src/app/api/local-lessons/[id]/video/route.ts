import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { localRequest } from '@/lib/local-lesson-http';
import { lessonPath, readLesson, validId } from '@/lib/local-lessons';
import { lessonOwner } from '@/lib/lesson-access';
export const runtime='nodejs';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}) {
  try {
    localRequest(request);const owner=await lessonOwner(request);const {id}=await params;
    if(!owner||!validId(id))return new Response(null,{status:404});
    const job=await readLesson(owner,id);if(job?.state!=='ready')return new Response(null,{status:404});
    const data=await readFile(path.join(lessonPath(owner,id),'final.mp4'));
    let start=0;let end=data.length-1;const range=request.headers.get('range');
    const headers=new Headers({'Content-Type':'video/mp4','Cache-Control':'private, no-store','Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff'});
    if(range){const m=/^bytes=(\d*)-(\d*)$/.exec(range);if(!m||(!m[1]&&!m[2]))return new Response(null,{status:416});start=m[1]?Number(m[1]):Math.max(0,data.length-Number(m[2]));end=m[1]&&m[2]?Math.min(end,Number(m[2])):end;if(!Number.isSafeInteger(start)||start>end||start>=data.length)return new Response(null,{status:416});headers.set('Content-Range',`bytes ${start}-${end}/${data.length}`);}
    if(new URL(request.url).searchParams.has('download'))headers.set('Content-Disposition',`attachment; filename="vidsprout${job.input.narration==='male'?'-elevenlabs.io':''}.mp4"`);
    headers.set('Content-Length',String(end-start+1));return new Response(new Uint8Array(data.subarray(start,end+1)),{status:range?206:200,headers});
  }catch{return new Response(null,{status:404});}
}
