import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

if (existsSync('.env.local')) loadEnvFile('.env.local');
const groups = {
  'Authentication': ['BETTER_AUTH_URL', 'BETTER_AUTH_SECRET', 'MONGODB_URI', 'MONGODB_DB'],
  'Private storage': ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET'],
  'Sandbox access': ['VERCEL_OIDC_TOKEN'],
};
let failures = 0;
function check(label, ok, detail) {
  console.log(`${ok ? 'PASS' : 'MISSING'} ${label}${detail ? ': ' + detail : ''}`);
  if (!ok) failures++;
}
for (const [label, keys] of Object.entries(groups)) {
  const missing = keys.filter(key => !process.env[key]?.trim());
  check(label, !missing.length, missing.join(', '));
}
check('Authentication secret length', (process.env.BETTER_AUTH_SECRET?.length ?? 0) >= 32);
const localWorkflow = process.env.INNGEST_DEV === '1';
check('Workflow configuration', localWorkflow || !!(process.env.INNGEST_EVENT_KEY && process.env.INNGEST_SIGNING_KEY), localWorkflow ? 'local Inngest server must be running' : 'cloud keys required');
check('Animation bundle', existsSync('render-bundle/index.html'));
console.log(`Live rendering: ${process.env.ENABLE_LIVE_RENDER === 'true' ? 'enabled' : 'disabled'}`);
console.log('Local checks only. No credentials printed, network calls made, or provider connectivity verified.');
process.exitCode = failures ? 1 : 0;
