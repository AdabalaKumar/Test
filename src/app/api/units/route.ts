import { HttpError, ok, route } from '@/lib/http';
import { listUnits } from '@/lib/repo';

export const dynamic = 'force-dynamic';
export const GET = route(async (req: Request) => {
  const project = new URL(req.url).searchParams.get('project');
  if (!project) throw new HttpError(400, 'The "project" query parameter is required.');
  return ok({ items: listUnits(project) });
});
