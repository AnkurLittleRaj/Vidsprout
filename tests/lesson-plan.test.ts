import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLesson, lessonInput, silentTimeline, speechTimeline } from '../src/lib/lesson-plan';
import { browserOwner, localRequest } from '../src/lib/local-lesson-http';
import { lessonPath, publicLesson, type LocalLesson } from '../src/lib/local-lessons';

const input={requestKey:'a01a0000-1234-4321-8234-000000000001',topic:'gravity' as const,title:'',notes:'',orientation:'vertical' as const,narration:'silent' as const};
test('lesson inputs cannot inject paths, identities, or execution code fields',()=>{
  assert.equal(lessonInput.safeParse({...input,owner:'someone-else'}).success,false);
  assert.equal(lessonInput.safeParse({...input,topic:'../../secret'}).success,false);
});
test('custom notes require bounded meaningful scene input',()=>{
  assert.throws(()=>buildLesson({...input,topic:'custom',title:'Example',notes:'One line'}));
  assert.throws(()=>buildLesson({...input,topic:'custom',title:'Example',notes:['a'.repeat(241),'b','c'].join('\n')}));
  const plan=buildLesson({...input,topic:'custom',title:'My lesson',notes:'First idea.\nSecond idea.\nThird idea.'});
  assert.equal(plan.source,'notes');assert.equal(plan.scenes[1].text,'Second idea.');
});
test('prepared lessons have distinct content and bounded calculated durations',()=>{
  const plans=(['evaporation','photosynthesis','gravity'] as const).map(topic=>buildLesson({...input,topic}));
  assert.equal(new Set(plans.map(p=>JSON.stringify(p))).size,3);
  for(const plan of plans){const t=silentTimeline(plan);assert.ok(t.duration>0&&t.duration<=90);assert.equal(t.starts[0],0);assert.equal(t.starts.length,plan.scenes.length);}
});
test('speech timestamps must match text and keep the video within 90 seconds',()=>{
  const plan=buildLesson(input);const text=plan.scenes.map(s=>s.text).join(' ');
  const alignment={characters:[...text],character_start_times_seconds:[...text].map((_,i)=>i*.05),character_end_times_seconds:[...text].map((_,i)=>(i+1)*.05)};
  assert.equal(speechTimeline(plan,alignment).starts[1],(plan.scenes[0].text.length+1)*.05);
  assert.throws(()=>speechTimeline(plan,{...alignment,characters:['wrong']}));
  assert.throws(()=>speechTimeline(plan,{...alignment,character_end_times_seconds:[...text].map(()=>95)}));
});
test('local API rejects foreign origins and non-loopback hosts',()=>{
  const previous=process.env.LOCAL_PREVIEW;process.env.LOCAL_PREVIEW='true';
  try{assert.throws(()=>localRequest(new Request('http://localhost:3000/api/local-lessons',{method:'POST',headers:{origin:'https://evil.example','content-type':'application/json'}}),true));assert.throws(()=>localRequest(new Request('http://example.com/api/local-lessons')));}
  finally{if(previous===undefined)delete process.env.LOCAL_PREVIEW;else process.env.LOCAL_PREVIEW=previous;}
});
test('browser capability and media paths reject malformed identifiers',()=>{
  assert.equal(browserOwner(new Request('http://localhost',{headers:{cookie:'vidsprout-local=../../etc'}})),null);
  assert.throws(()=>lessonPath('../owner',input.requestKey));
});
test('public local job never exposes owner, notes, or raw provider data',()=>{
  const job:LocalLesson={id:input.requestKey,owner:'private',input,plan:buildLesson(input),state:'ready',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
  const result=publicLesson(job);assert.equal('owner' in result,false);assert.equal('input' in result,false);assert.equal('plan' in result,false);
});
import { randomUUID } from 'node:crypto';
import { rm } from 'node:fs/promises';
import { readLesson, saveLesson, recoverInterruptedLesson } from '../src/lib/local-lessons';

test('queue age and recent progress never invent a terminal API state',()=>{
  for(const state of ['queued','narrating','rendering'] as const){
    const job:LocalLesson={id:input.requestKey,owner:randomUUID(),input,plan:buildLesson(input),state,createdAt:'2020-01-01T00:00:00.000Z',updatedAt:new Date().toISOString()};
    assert.equal(publicLesson(job).state,state);
    assert.equal(publicLesson(job).error,undefined);
  }
});

test('exclusive worker restart recovery persists interrupted states and preserves other states',async()=>{
  for(const state of ['queued','narrating','rendering','ready','failed'] as const){
    const job:LocalLesson={id:randomUUID(),owner:randomUUID(),input,plan:buildLesson(input),state,createdAt:'2020-01-01T00:00:00.000Z',updatedAt:'2020-01-01T00:00:00.000Z'};
    // Non-active states do not need a disk write to test the no-op recovery path.
    const interrupted=state==='narrating'||state==='rendering';
    try{
      if(interrupted)await saveLesson(job);
      await recoverInterruptedLesson(job);
      const stored=await readLesson(job.owner,job.id);
      if(interrupted){assert.equal(stored?.state,'failed');assert.notEqual(stored?.updatedAt,job.updatedAt);assert.match(stored!.error!,/interrupted/);assert.equal(publicLesson(stored!).state,'failed');}
      else assert.equal(stored,null);
    }finally{if(interrupted)await rm(lessonPath(job.owner,job.id),{recursive:true,force:true});}
  }
});

test('evaporation ends with water and heat rather than a photosynthesis sun scene',()=>{
  assert.equal(buildLesson({...input,topic:'evaporation'}).scenes.at(-1)?.symbol,'evaporation-heat');
  assert.equal(buildLesson({...input,topic:'photosynthesis'}).scenes[2].symbol,'sun');
});
