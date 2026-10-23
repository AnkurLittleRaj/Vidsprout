import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

// Explicit local integration check: creates two QA accounts and one silent video.
// Credentials stay in memory; test records remain for inspection, not auto-deletion.
if (process.env.LOCAL_ACCOUNT_AUTH !== 'true' || process.env.NODE_ENV === 'production') throw new Error('Local account mode required');
const base = process.env.BETTER_AUTH_URL;
if (!base || new URL(base).hostname !== 'localhost') throw new Error('Use localhost for this test');
async function request(route, {cookie='', body, method=body?'POST':'GET', range}={}) {
  const headers = {Origin:base, ...(cookie?{Cookie:cookie}:{}), ...(body?{'Content-Type':'application/json'}:{}), ...(range?{Range:range}:{})};
  return fetch(new URL(route,base), {method,headers,body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(60000)});
}
function cookieOf(response) { return response.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '); }
async function signUp(label) {
  const credentials={name:`QA ${label}`,email:`qa-${randomUUID()}@example.com`,password:randomUUID()+randomUUID()};
  const response=await request('/api/auth/sign-up/email',{body:credentials});
  assert.equal(response.status,200,`Signup ${label}: HTTP ${response.status}`);
  const cookie=cookieOf(response);assert.ok(cookie);return {credentials,cookie};
}
try {
  assert.equal((await request('/api/local-lessons')).status,401);
  assert.equal((await request('/api/local-lessons',{cookie:`vidsprout-local=${randomUUID()}`})).status,401);
  console.log('PASS: unsigned and legacy browser-cookie access denied');
  const a=await signUp('A');const b=await signUp('B');
  console.log('PASS: two real accounts created through Better Auth');
  const input={requestKey:randomUUID(),topic:'custom',title:'Account isolation verification',notes:'Water can change into vapor.\nHeat helps molecules move faster.\nVapor mixes with the air.',orientation:'vertical',narration:'silent'};
  const submitted=await request('/api/local-lessons',{cookie:a.cookie,body:input});assert.equal(submitted.status,202,`Admission: HTTP ${submitted.status}`);
  const {job}=await submitted.json();
  assert.equal((await request('/api/local-lessons',{cookie:a.cookie,body:input})).status,200);
  const bList=await (await request('/api/local-lessons',{cookie:b.cookie})).json();assert.ok(!bList.jobs.some(j=>j.id===job.id));
  const media=`/api/local-lessons/${job.id}/video`;
  assert.equal((await request(media,{cookie:b.cookie})).status,404);
  console.log('PASS: job creation, idempotency and cross-account list isolation');
  let ready=false;
  for(let i=0;i<120;i++) {
    const data=await (await request('/api/local-lessons',{cookie:a.cookie})).json();const current=data.jobs.find(j=>j.id===job.id);
    assert.notEqual(current?.state,'failed','Silent verification render failed');
    if(current?.state==='ready'){ready=true;break;}
    await new Promise(r=>setTimeout(r,2000));
  }
  assert.ok(ready,'Render did not finish in time');
  assert.equal((await request(media,{cookie:a.cookie,range:'bytes=0-99'})).status,206);
  assert.equal((await request(media,{cookie:b.cookie})).status,404);
  assert.equal((await request(media+'?download=1',{cookie:b.cookie})).status,404);
  assert.equal((await request(media)).status,404);
  const download=await request(media+'?download=1',{cookie:a.cookie});assert.equal(download.status,200);await download.arrayBuffer();
  console.log('PASS: owner playback/download and cross-account/anonymous denial on completed MP4');
  assert.equal((await request('/api/auth/sign-out',{cookie:a.cookie,body:{}})).status,200);
  assert.equal((await request('/api/local-lessons',{cookie:a.cookie})).status,401);
  assert.equal((await request(media,{cookie:a.cookie})).status,404);
  const login=await request('/api/auth/sign-in/email',{body:{email:a.credentials.email,password:a.credentials.password}});assert.equal(login.status,200);
  const freshCookie=cookieOf(login);const restored=await (await request('/api/local-lessons',{cookie:freshCookie})).json();assert.ok(restored.jobs.some(j=>j.id===job.id));
  assert.equal((await request(media,{cookie:freshCookie,range:'bytes=0-99'})).status,206);
  await request('/api/auth/sign-out',{cookie:freshCookie,body:{}});await request('/api/auth/sign-out',{cookie:b.cookie,body:{}});
  console.log('PASS: logout revocation and library restoration after fresh login without demo cookie');
} catch(error) { console.error(error instanceof assert.AssertionError?error.message:'Account verification failed; inspect server diagnostics.');process.exitCode=1; }
