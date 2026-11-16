import { ok, requireAdmin, route } from '@/lib/http';
import { getStats } from '@/lib/repo';

export const dynamic = 'force-dynamic';
export const GET = route(async () => {
  await requireAdmin();
  return ok(getStats());
});
