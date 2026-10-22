import test from 'node:test';
import assert from 'node:assert/strict';
import { frameCount, mediaKey, ownedFilter, publicJob, renderInput, validateOutput, type RenderJob } from '../src/lib/domain';
test('output duration boundary never accepts a value beyond 90 seconds',()=>{
  assert.equal(frameCount(90),2700);assert.equal(frameCount(89.9),2697);
  for(const seconds of [0,-1,90.001,Infinity,NaN]) assert.throws(()=>frameCount(seconds));
});
test('owner filters cannot omit the session owner',()=>{
  assert.deepEqual(ownedFilter('owner-a','known-id'),{_id:'known-id',ownerId:'owner-a'});
  assert.notDeepEqual(ownedFilter('owner-a','known-id'),ownedFilter('owner-b','known-id'));
  assert.throws(()=>ownedFilter('','known-id'));
});
test('asset keys cannot escape owner namespaces',()=>{
  assert.equal(mediaKey('owner-a','job-1'),'owners/owner-a/jobs/job-1/final.mp4');
  assert.throws(()=>mediaKey('../owner-b','job-1'));
  assert.throws(()=>mediaKey('owner-a','../../secret'));
});
test('client cannot inject an owner or asset path into a render request',()=>{
  const valid={requestKey:'01594ef1-73cd-4ff3-a4d1-fc6125c9f3b9',orientation:'vertical'};
  assert.equal(renderInput.safeParse(valid).success,true);
  assert.equal(renderInput.safeParse({...valid,ownerId:'victim'}).success,false);
  assert.equal(renderInput.safeParse({...valid,orientation:'square'}).success,false);
});
test('finalization report requires actual bounded bytes, checksum and duration',()=>{
  const report={bytes:5000,checksum:'a'.repeat(64),duration:12};
  assert.deepEqual(validateOutput(report),report);
  for(const bad of [{...report,bytes:0},{...report,duration:90.1},{...report,checksum:'wrong'}])assert.throws(()=>validateOutput(bad));
});
test('public job strips internal media paths, provider IDs and owner IDs',()=>{
  const job={_id:'j',ownerId:'private',objectKey:'secret',sandboxId:'provider-secret',state:'ready',title:'test',orientation:'vertical',createdAt:new Date()} as RenderJob;
  const exposed=publicJob(job);
  assert.equal(exposed.playable,true);
  assert.equal('ownerId' in exposed,false);assert.equal('objectKey' in exposed,false);assert.equal('sandboxId' in exposed,false);
});
