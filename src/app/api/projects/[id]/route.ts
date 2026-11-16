import { HttpError, ok, readJson, requireAdmin, route } from '@/lib/http';
import { deleteProject, getProject, saveProject } from '@/lib/repo';
import { parseProject } from '@/lib/validate';

type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_req: Request, { params }: Ctx) => {
  const item = getProject((await params).id);
  if (!item) throw new HttpError(404, 'Project not found.');
  return ok(item);
});
export const PUT = route(async (req: Request, { params }: Ctx) => {
  await requireAdmin();
  const existing = getProject((await params).id);
  if (!existing) throw new HttpError(404, 'Project not found.');
  // The slug is the foreign key for units and properties, so it stays fixed after creation.
  return ok(saveProject({ ...parseProject({ ...existing, ...(await readJson(req)) }), slug: existing.slug }, existing.id));
});
export const DELETE = route(async (_req: Request, { params }: Ctx) => {
  await requireAdmin();
  const existing = getProject((await params).id);
  if (!existing || !deleteProject(existing.id)) throw new HttpError(404, 'Project not found.');
  return ok({ deleted: true });
});
