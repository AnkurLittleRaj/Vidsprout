import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

const staged=process.argv.includes('--staged');
const args=staged?['diff','--cached','--name-only','--diff-filter=ACMR','-z']:['ls-files','--cached','--others','--exclude-standard','-z'];
const files=[...new Set(execFileSync('git',args,{encoding:'utf8'}).split('\0').filter(Boolean))];
const local=existsSync('.env.local')?parseEnv(readFileSync('.env.local','utf8')):{};
const secrets=Object.entries(local).filter(([name,value])=>/KEY|SECRET|TOKEN|PASSWORD|MONGODB_URI/.test(name)&&value.length>=8).map(([,value])=>value);
let failures=0;
for(const file of files) {
  const blocked=/(^|\/)(\.env(?:\..*)?|node_modules|\.next|\.local-media|\.local-tools|\.vercel|render-bundle)(\/|$)/.test(file)&&file!=='.env.example';
  const content=staged?execFileSync('git',['show',`:${file}`],{encoding:'utf8',maxBuffer:20*1024*1024}):readFileSync(file,'utf8');
  const known=secrets.some(value=>content.includes(value));
  const pattern=/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:ghp_|github_pat_|sk_live_|sk_test_)[A-Za-z0-9_]{20,}|mongodb(?:\+srv)?:\/\/[^\s/]+:[^\s@]+@/.test(content);
  if(blocked||known||pattern) {console.error(`REVIEW REQUIRED: ${file} (${blocked?'excluded file':known?'local credential match':'credential pattern'})`);failures++;}
}
if(staged?files.includes('.env.example'):existsSync('.env.example')) {
  const example=parseEnv(staged?execFileSync('git',['show',':.env.example'],{encoding:'utf8'}):readFileSync('.env.example','utf8'));
  if(Object.entries(example).some(([key,value])=>/KEY|SECRET|TOKEN|PASSWORD|MONGODB_URI/.test(key)&&value)) {console.error('REVIEW REQUIRED: populated credential in .env.example');failures++;}
}
console.log(`Reviewed ${files.length} ${staged?'staged':'candidate'} files; ${failures} findings. Secret values are never printed.`);
process.exitCode=failures?1:0;
