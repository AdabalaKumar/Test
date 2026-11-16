import { HttpError, ok, readJson, requireAdmin, route } from '@/lib/http';
import { deleteProperty, getProperty, updateProperty } from '@/lib/repo';
import { parseProperty } from '@/lib/validate';

type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_req: Request, { params }: Ctx) => {
  const item = getProperty((await params).id);
  if (!item) throw new HttpError(404, 'Property not found.');
  return ok(item);
});

export const PUT = route(async (req: Request, { params }: Ctx) => {
  await requireAdmin();
  const existing = getProperty((await params).id);
  if (!existing) throw new HttpError(404, 'Property not found.');
  return ok(updateProperty(existing.id, parseProperty({ ...existing, ...(await readJson(req)) })));
});

export const DELETE = route(async (_req: Request, { params }: Ctx) => {
  await requireAdmin();
  const existing = getProperty((await params).id);
  if (!existing || !deleteProperty(existing.id)) throw new HttpError(404, 'Property not found.');
  return ok({ deleted: true });
});
