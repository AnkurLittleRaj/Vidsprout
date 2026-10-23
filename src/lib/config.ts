const GROUPS = {
  authentication: ['MONGODB_URI', 'BETTER_AUTH_SECRET', 'BETTER_AUTH_URL'],
  storage: ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET'],
  sandbox: ['VERCEL_OIDC_TOKEN'],
} as const;
export function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Configuration missing: ${name}`);
  return value;
}
export function configuration() {
  const configured = Object.fromEntries(Object.entries(GROUPS).map(([key, names]) => [key, names.every(n => !!process.env[n])])) as Record<keyof typeof GROUPS, boolean>;
  const workflow = process.env.INNGEST_DEV === '1' || !!(process.env.INNGEST_EVENT_KEY && process.env.INNGEST_SIGNING_KEY);
  const local = localRendering();
  const preview = process.env.LOCAL_PREVIEW === 'true' && process.env.NODE_ENV !== 'production' && !process.env.VERCEL;
  return {...configured, workflow, local, preview, accountLessons: preview && process.env.LOCAL_ACCOUNT_AUTH === 'true', liveEnabled: process.env.ENABLE_LIVE_RENDER === 'true',
    renderReady: local ? configured.authentication : Object.values(configured).every(Boolean) && workflow && process.env.ENABLE_LIVE_RENDER === 'true'};
}
export function localRendering() {
  return process.env.LOCAL_RENDER === 'true' && process.env.NODE_ENV !== 'production' && !process.env.VERCEL;
}
