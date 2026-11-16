import 'server-only';
import { NextResponse } from 'next/server';
import { getSessionUser } from './auth';
import type { User } from './types';

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export const ok = <T>(data: T, status = 200) => NextResponse.json(data, { status });
export const fail = (status: number, message: string) => NextResponse.json({ error: message }, { status });

export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) throw new HttpError(401, 'Please sign in to continue.');
  return user;
}
export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== 'admin') throw new HttpError(403, 'Administrator access required.');
  return user;
}
export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    if (body && typeof body === 'object' && !Array.isArray(body)) return body as Record<string, unknown>;
  } catch { /* fallthrough */ }
  throw new HttpError(400, 'Request body must be a JSON object.');
}
/** Wraps a route handler with uniform JSON error handling. */
export function route<A extends unknown[]>(handler: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (e) {
      if (e instanceof HttpError) return fail(e.status, e.message);
      if (e instanceof Error && /UNIQUE constraint/.test(e.message)) return fail(409, 'A record with that identifier already exists.');
      console.error(e);
      return fail(500, 'Something went wrong. Please try again.');
    }
  };
}

export const str = (v: unknown, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
export const num = (v: unknown, fallback = 0) => { const n = Number(v); return Number.isFinite(n) ? n : fallback; };
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= 254;
export const oneOf = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T => (allowed.includes(v as T) ? (v as T) : fallback);
export const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

const buckets = new Map<string, { n: number; reset: number }>();
/** Small in-memory fixed-window limiter; swap for a shared store when running multiple instances. */
export function rateLimit(req: Request, key: string, max: number, windowMs: number) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const id = `${key}:${ip}`;
  const now = Date.now();
  const b = buckets.get(id);
  if (!b || b.reset < now) { buckets.set(id, { n: 1, reset: now + windowMs }); return; }
  if (++b.n > max) throw new HttpError(429, 'Too many attempts. Please wait a moment and try again.');
}
