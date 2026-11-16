import { getSessionUser } from '@/lib/auth';
import { HttpError, isEmail, num, ok, oneOf, rateLimit, readJson, requireUser, route, str } from '@/lib/http';
import { createEnquiry, getProperty, listEnquiries } from '@/lib/repo';

export const dynamic = 'force-dynamic';

/** Admins see every lead; customers see only their own. */
export const GET = route(async () => {
  const user = await requireUser();
  return ok({ items: listEnquiries(user.role === 'admin' ? undefined : user.id) });
});

export const POST = route(async (req: Request) => {
  rateLimit(req, 'enquiry', 8, 10 * 60_000);
  const b = await readJson(req);
  if (str(b.company)) return ok({ id: 0 }, 201); // honeypot field: silently drop bot submissions
  const name = str(b.name, 120);
  const email = str(b.email, 254).toLowerCase();
  if (name.length < 2) throw new HttpError(422, 'Please enter your name.');
  if (!isEmail(email)) throw new HttpError(422, 'Please enter a valid email address.');
  const propertyId = b.propertyId != null && getProperty(num(b.propertyId)) ? num(b.propertyId) : null;
  const preferredDate = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(str(b.preferredDate, 20)) ? str(b.preferredDate, 20) : null;
  const user = await getSessionUser();
  const id = createEnquiry({
    type: oneOf(b.type, ['enquiry', 'viewing', 'contact', 'callback'] as const, 'enquiry'), name, email, phone: str(b.phone, 40),
    message: str(b.message, 2000), propertyId, userId: user?.id ?? null, preferredDate,
  });
  return ok({ id }, 201);
});
