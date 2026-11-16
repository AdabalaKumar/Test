import { ok, readJson, requireAdmin, route, str } from '@/lib/http';
import { getContent, setContent } from '@/lib/repo';

export const dynamic = 'force-dynamic';
export const GET = route(async () => ok(getContent()));
export const PUT = route(async (req: Request) => {
  await requireAdmin();
  const body = await readJson(req);
  const entries: Record<string, string> = {};
  for (const [k, v] of Object.entries(body)) if (/^[a-z0-9.]{1,60}$/.test(k)) entries[k] = str(v, 2000);
  setContent(entries);
  return ok(getContent());
});
