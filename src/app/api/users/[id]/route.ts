import { HttpError, ok, oneOf, readJson, requireAdmin, route } from '@/lib/http';
import { deleteUser, updateUser } from '@/lib/repo';

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route(async (req: Request, { params }: Ctx) => {
  const admin = await requireAdmin();
  const id = Number((await params).id);
  const b = await readJson(req);
  if (id === admin.id && b.role && b.role !== 'admin') throw new HttpError(400, 'You cannot remove your own administrator role.');
  const user = updateUser(id, { role: b.role != null ? oneOf(b.role, ['customer', 'admin'] as const, 'customer') : undefined });
  if (!user) throw new HttpError(404, 'User not found.');
  return ok(user);
});
export const DELETE = route(async (_req: Request, { params }: Ctx) => {
  const admin = await requireAdmin();
  const id = Number((await params).id);
  if (id === admin.id) throw new HttpError(400, 'You cannot delete your own account.');
  if (!deleteUser(id)) throw new HttpError(404, 'User not found.');
  return ok({ deleted: true });
});
