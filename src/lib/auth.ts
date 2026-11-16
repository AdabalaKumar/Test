import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getAuthSecret } from './db';
import { getUserById } from './repo';
import type { User } from './types';

export const SESSION_COOKIE = 'aurelia_session';
const MAX_AGE = 60 * 60 * 24 * 7;

export async function createSession(userId: number) {
  const token = await new SignJWT({ uid: userId }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime(`${MAX_AGE}s`).sign(getAuthSecret());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' && process.env.INSECURE_COOKIES !== '1', path: '/', maxAge: MAX_AGE,
  });
}
export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}
/** Returns the signed-in user, re-read from the database on every call so role changes and deletions apply immediately. */
export async function getSessionUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getAuthSecret(), { algorithms: ['HS256'] });
    return typeof payload.uid === 'number' ? getUserById(payload.uid) : null;
  } catch {
    return null;
  }
}
