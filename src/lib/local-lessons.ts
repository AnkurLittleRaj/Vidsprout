import { mkdir, readFile, writeFile, rename, readdir } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { LessonInput, LessonPlan } from './lesson-plan';

export const lessonRoot=path.join(process.cwd(),'.local-media','lessons');
export const validId=(id:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
export function lessonPath(owner:string,id:string) {
  if(!validId(owner)||!validId(id))throw new Error('Invalid local identity');
  return path.join(lessonRoot,owner,id);
}
export type LocalLesson={id:string;owner:string;input:LessonInput;plan:LessonPlan;state:'queued'|'narrating'|'rendering'|'ready'|'failed';createdAt:string;updatedAt:string;duration?:number;error?:string};
export async function saveLesson(job:LocalLesson) {
  const dir=lessonPath(job.owner,job.id);await mkdir(dir,{recursive:true});
  const temporary=path.join(dir,`state-${randomUUID()}.tmp`);
  await writeFile(temporary,JSON.stringify(job));await rename(temporary,path.join(dir,'state.json'));
}
export async function readLesson(owner:string,id:string):Promise<LocalLesson|null> {
  const file=path.join(lessonPath(owner,id),'state.json');
  try{return JSON.parse(await readFile(file,'utf8'));}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw e;}
}
export function publicLesson(job:LocalLesson) {
  const stale=!['ready','failed'].includes(job.state)&&Date.now()-Date.parse(job.createdAt)>15*60_000;
  return {id:job.id,title:job.plan.title,orientation:job.input.orientation,narration:job.input.narration,source:job.plan.source,state:stale?'failed':job.state,createdAt:job.createdAt,duration:job.duration,error:stale?'This render was interrupted. Please restart the local worker before trying again.':job.error};
}
export async function listLessons(owner:string) {
  if(!validId(owner))return [];
  const dirs=await readdir(path.join(lessonRoot,owner)).catch(()=>[]);
  const jobs=await Promise.all(dirs.filter(validId).map(id=>readLesson(owner,id)));
  return jobs.filter((j):j is LocalLesson=>!!j).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,20).map(publicLesson);
}
