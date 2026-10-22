import type { NextConfig } from 'next';
const config: NextConfig = {
  serverExternalPackages: ['@remotion/vercel', '@remotion/renderer', '@vercel/sandbox'],
  outputFileTracingIncludes: { '/api/inngest': ['./render-bundle/**/*', './scripts/sandbox-render.cjs'] },
};
export default config;
