import { HttpError, num, ok, readJson, requireUser, route } from '@/lib/http';
import { addWishlist, getProperty, getWishlist, removeWishlist } from '@/lib/repo';

export const dynamic = 'force-dynamic';
export const GET = route(async () => ok({ ids: getWishlist((await requireUser()).id) }));
export const POST = route(async (req: Request) => {
  const user = await requireUser();
  const id = num((await readJson(req)).propertyId);
  if (!getProperty(id)) throw new HttpError(404, 'Property not found.');
  addWishlist(user.id, id);
  return ok({ ids: getWishlist(user.id) });
});
export const DELETE = route(async (req: Request) => {
  const user = await requireUser();
  removeWishlist(user.id, num(new URL(req.url).searchParams.get('propertyId')));
  return ok({ ids: getWishlist(user.id) });
});
