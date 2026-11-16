import { HttpError, num, ok, oneOf, readJson, requireAdmin, route } from '@/lib/http';
import { updateUnit } from '@/lib/repo';

export const PATCH = route(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const body = await readJson(req);
  const status = body.status != null ? oneOf(body.status, ['available', 'reserved', 'sold'] as const, 'available') : undefined;
  const price = body.price != null && num(body.price) > 0 ? Math.round(num(body.price)) : undefined;
  const unit = updateUnit(Number((await params).id), { status, price });
  if (!unit) throw new HttpError(404, 'Unit not found.');
  return ok(unit);
});
