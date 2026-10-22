import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/lib/auth';
import { errorResponse } from '@/lib/http';
export const runtime = 'nodejs';
export async function GET(request: Request) { try {return await toNextJsHandler(auth()).GET(request);} catch(e) {return errorResponse(e);} }
export async function POST(request: Request) { try {return await toNextJsHandler(auth()).POST(request);} catch(e) {return errorResponse(e);} }
