import { HttpError, ok, oneOf, readJson, requireAdmin, route, str } from '@/lib/http';
import { deleteEnquiry, updateEnquiry } from '@/lib/repo';

type Ctx = { params: Promise<{ id: string }> };
const STATUSES = ['new', 'contacted', 'qualified', 'viewing', 'won', 'lost'] as const;

export const PATCH = route(async (req: Request, { params }: Ctx) => {
  await requireAdmin();
  const b = await readJson(req);
  updateEnquiry(Number((await params).id), {
    status: b.status != null ? oneOf(b.status, STATUSES, 'new') : undefined,
    notes: b.notes != null ? str(b.notes, 2000) : undefined,
  });
  return ok({ updated: true });
});
export const DELETE = route(async (_req: Request, { params }: Ctx) => {
  await requireAdmin();
  if (!deleteEnquiry(Number((await params).id))) throw new HttpError(404, 'Lead not found.');
  return ok({ deleted: true });
});
