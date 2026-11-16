import { ok, readJson, requireAdmin, route } from '@/lib/http';
import { createProperty, listProperties } from '@/lib/repo';
import { parseProperty } from '@/lib/validate';

export const dynamic = 'force-dynamic';

/** GET /api/properties?q=&type=&status=&location=&community=&project=&minPrice=&maxPrice=&minBeds=&featured=1&sort=&limit= */
export const GET = route(async (req: Request) => {
  const p = new URL(req.url).searchParams;
  const n = (k: string) => (p.get(k) ? Number(p.get(k)) : undefined);
  const items = listProperties({
    q: p.get('q') || undefined, type: p.get('type') || undefined, status: p.get('status') || undefined, location: p.get('location') || undefined,
    community: p.get('community') || undefined, project: p.get('project') || undefined, minPrice: n('minPrice'), maxPrice: n('maxPrice'),
    minBeds: n('minBeds'), featured: p.get('featured') === '1', sort: p.get('sort') || undefined, limit: n('limit'),
  });
  return ok({ items, total: items.length });
});

export const POST = route(async (req: Request) => {
  await requireAdmin();
  return ok(createProperty(parseProperty(await readJson(req))), 201);
});
