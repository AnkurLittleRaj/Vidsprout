import { lessonOwner, lessonResponse as localResponse } from '@/lib/lesson-access';
import { errorResponse } from '@/lib/http';
import { readFile, mkdir, open, unlink } from 'node:fs/promises';
import path from 'node:path';
import { buildLesson, lessonInput } from '@/lib/lesson-plan';
import { lessonRoot, listLessons, publicLesson, readLesson, saveLesson } from '@/lib/local-lessons';
import { localRequest } from '@/lib/local-lesson-http';
export const runtime='nodejs';
export async function GET(request:Request) {
  try {localRequest(request);const owner=(await lessonOwner(request,true))!;return localResponse({jobs:await listLessons(owner)},owner);}
  catch(e) {return errorResponse(e);}
}
export async function POST(request:Request) {
  try {localRequest(request,true);}catch{return Response.json({error:'Request not allowed.'},{status:403});}
  let owner;try {owner=await lessonOwner(request);}catch(e){return errorResponse(e);}
  if(!owner)return Response.json({error:'Refresh this page before creating a video.'},{status:409});
  let admission:Awaited<ReturnType<typeof open>>|undefined;
  const admissionPath=path.join(lessonRoot,owner,'admission.lock');
  try {
    await mkdir(path.join(lessonRoot,owner),{recursive:true});
    try{admission=await open(admissionPath,'wx');}catch{return Response.json({error:'Another request is being saved. Please try again shortly.'},{status:409});}
    const raw=await request.text();if(raw.length>6000)return Response.json({error:'Please shorten the lesson notes.'},{status:413});
    let body;try{body=JSON.parse(raw);}catch{return Response.json({error:'Invalid request.'},{status:400});}
    const parsed=lessonInput.safeParse(body);
    if(!parsed.success)return Response.json({error:'Check your topic, notes and video options.'},{status:400});
    const input=parsed.data;let plan;
    try {plan=buildLesson(input);}catch(e){return Response.json({error:(e as Error).message},{status:400});}
    const existing=await readLesson(owner,input.requestKey);
    if(existing)return localResponse({job:publicLesson(existing)},owner,200);
    const previous=await listLessons(owner);
    if(previous.some(j=>!['ready','failed'].includes(j.state)))return Response.json({error:'Wait for your current video to finish.'},{status:409});
    if(previous.length>=20)return Response.json({error:'This local preview has reached its 20-video limit.'},{status:429});
    const heartbeat=JSON.parse(await readFile(path.join(lessonRoot,'heartbeat.json'),'utf8').catch(()=>'{}'));
    if(!heartbeat.at||Date.now()-heartbeat.at>15000)return Response.json({error:'Video creation is temporarily unavailable. Please try again shortly.'},{status:503});
    if(input.narration==='male'&&!process.env.ELEVENLABS_API_KEY)return Response.json({error:'Narration is unavailable. Choose silent video to continue.'},{status:503});
    const now=new Date().toISOString();
    const job={id:input.requestKey,owner,input,plan,state:'queued' as const,createdAt:now,updatedAt:now};
    await saveLesson(job);
    return localResponse({job:publicLesson(job)},owner,202);
  }catch{return Response.json({error:'Could not start this video. Please try again.'},{status:503});}
  finally{if(admission){await admission.close();await unlink(admissionPath).catch(()=>{});}}
}
