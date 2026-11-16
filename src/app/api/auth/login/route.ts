import { createSession } from '@/lib/auth';
import { verifyPassword } from '@/lib/db';
import { HttpError, ok, rateLimit, readJson, route, str } from '@/lib/http';
import { getUserAuth, getUserById } from '@/lib/repo';

export const POST = route(async (req: Request) => {
  rateLimit(req, 'login', 10, 10 * 60_000);
  const b = await readJson(req);
  const row = getUserAuth(str(b.email, 254).toLowerCase());
  // Same message for unknown email and wrong password, so accounts cannot be enumerated.
  if (!row || !verifyPassword(typeof b.password === 'string' ? b.password : '', row.password)) throw new HttpError(401, 'Incorrect email or password.');
  await createSession(row.id);
  return ok({ user: getUserById(row.id) });
});
