import { createSession } from '@/lib/auth';
import { hashPassword } from '@/lib/db';
import { HttpError, isEmail, ok, rateLimit, readJson, route, str } from '@/lib/http';
import { createUser, getUserAuth } from '@/lib/repo';

export const POST = route(async (req: Request) => {
  rateLimit(req, 'register', 6, 30 * 60_000);
  const b = await readJson(req);
  const name = str(b.name, 120);
  const email = str(b.email, 254).toLowerCase();
  const password = typeof b.password === 'string' ? b.password : '';
  if (name.length < 2) throw new HttpError(422, 'Please enter your full name.');
  if (!isEmail(email)) throw new HttpError(422, 'Please enter a valid email address.');
  if (password.length < 8 || password.length > 200) throw new HttpError(422, 'Password must be at least 8 characters.');
  if (getUserAuth(email)) throw new HttpError(409, 'An account with this email already exists.');
  const user = createUser({ name, email, phone: str(b.phone, 40), password: hashPassword(password) });
  await createSession(user.id);
  return ok({ user }, 201);
});
