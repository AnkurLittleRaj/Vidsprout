import { auth } from './auth';
import { required } from './config';
export class HttpError extends Error { constructor(public status: number, message: string) {super(message);} }
export async function owner(request: Request) {
  const session = await auth().api.getSession({headers: request.headers});
  if (!session) throw new HttpError(401, 'Please sign in to continue.');
  return session.user.id;
}
export function mutationOrigin(request: Request) {
  if (request.headers.get('origin') !== new URL(required('BETTER_AUTH_URL')).origin) throw new HttpError(403, 'Request origin is not allowed.');
}
export function errorResponse(error: unknown) {
  if (error instanceof HttpError) return Response.json({error: error.message}, {status: error.status});
  console.error('Request failed', error instanceof Error ? error.name : 'UnknownError',
    error && typeof error === 'object' && 'code' in error ? String(error.code) : 'no-code');
  return Response.json({error: 'This service is unavailable. Please try again later.'}, {status: 503});
}
