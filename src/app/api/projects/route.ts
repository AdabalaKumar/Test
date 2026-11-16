import { ok, readJson, requireAdmin, route } from '@/lib/http';
import { listProjects, saveProject } from '@/lib/repo';
import { parseProject } from '@/lib/validate';

export const dynamic = 'force-dynamic';
export const GET = route(async () => ok({ items: listProjects() }));
export const POST = route(async (req: Request) => {
  await requireAdmin();
  return ok(saveProject(parseProject(await readJson(req))), 201);
});
