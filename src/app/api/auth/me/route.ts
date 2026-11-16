import { getSessionUser } from '@/lib/auth';
import { ok, readJson, requireUser, route, str } from '@/lib/http';
import { updateUser } from '@/lib/repo';

export const dynamic = 'force-dynamic';
export const GET = route(async () => ok({ user: await getSessionUser() }));
export const PATCH = route(async (req: Request) => {
  const user = await requireUser();
  const b = await readJson(req);
  return ok({ user: updateUser(user.id, { name: str(b.name, 120) || undefined, phone: b.phone != null ? str(b.phone, 40) : undefined }) });
});
