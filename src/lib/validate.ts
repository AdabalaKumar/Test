import 'server-only';
import { HttpError, num, oneOf, slugify, str } from './http';
import type { FloorPlan, LayoutKey, PaymentStep, Project, Property } from './types';

const TYPES = ['apartment', 'penthouse', 'villa', 'townhouse'] as const;
const STATUSES = ['available', 'reserved', 'sold'] as const;
const LAYOUTS = ['one', 'two', 'three'] as const;
/** Only site-relative asset paths are accepted, which rules out javascript: and off-site URLs. */
const assetPath = (v: unknown) => { const s = str(v, 300); return /^\/(images|api\/files)\/[\w./-]+$/.test(s) && !s.includes('..') ? s : ''; };
const strList = (v: unknown, max = 40) => (Array.isArray(v) ? v.map((x) => str(x, 120)).filter(Boolean).slice(0, max) : []);

export function parseProperty(b: Record<string, unknown>): Omit<Property, 'id'> {
  const title = str(b.title, 140);
  if (title.length < 3) throw new HttpError(422, 'Title must be at least 3 characters.');
  const price = Math.round(num(b.price));
  if (price <= 0) throw new HttpError(422, 'Price must be greater than zero.');
  const layout = oneOf<LayoutKey>(b.layout, LAYOUTS, 'two');
  const images = (Array.isArray(b.images) ? b.images : []).map(assetPath).filter(Boolean).slice(0, 20);
  const floorPlans: FloorPlan[] = (Array.isArray(b.floorPlans) ? b.floorPlans : []).slice(0, 8).map((f: Record<string, unknown>) => ({
    name: str(f?.name, 80) || 'Floor plan', layout: oneOf<LayoutKey>(f?.layout, LAYOUTS, layout), area: Math.round(num(f?.area)), ...(assetPath(f?.image) ? { image: assetPath(f?.image) } : {}),
  }));
  const paymentPlan: PaymentStep[] = (Array.isArray(b.paymentPlan) ? b.paymentPlan : []).slice(0, 8).map((s: Record<string, unknown>) => ({
    label: str(s?.label, 80), percent: Math.max(0, Math.min(100, num(s?.percent))), note: str(s?.note, 200),
  })).filter((s) => s.label);
  const specs: Record<string, string> = {};
  if (b.specs && typeof b.specs === 'object') for (const [k, v] of Object.entries(b.specs as object).slice(0, 20)) if (str(k, 40) && str(v, 120)) specs[str(k, 40)] = str(v, 120);
  return {
    slug: slugify(str(b.slug, 80) || title), title, tagline: str(b.tagline, 200), description: str(b.description, 4000),
    type: oneOf(b.type, TYPES, 'apartment'), status: oneOf(b.status, STATUSES, 'available'), price,
    location: str(b.location, 80) || 'Dubai', community: slugify(str(b.community, 40)) || 'downtown', projectSlug: slugify(str(b.projectSlug, 80)),
    bedrooms: Math.max(0, Math.round(num(b.bedrooms))), bathrooms: Math.max(0, Math.round(num(b.bathrooms))), area: Math.max(0, Math.round(num(b.area))),
    featured: !!b.featured, images, modelUrl: assetPath(b.modelUrl) || null, layout,
    floorPlans: floorPlans.length ? floorPlans : [{ name: 'Floor plan', layout, area: Math.max(0, Math.round(num(b.area))) }],
    amenities: strList(b.amenities), specs, paymentPlan, lat: num(b.lat, 25.2048), lng: num(b.lng, 55.2708),
  };
}

export function parseProject(b: Record<string, unknown>): Omit<Project, 'id'> {
  const name = str(b.name, 120);
  if (name.length < 3) throw new HttpError(422, 'Name must be at least 3 characters.');
  const m = (b.model && typeof b.model === 'object' ? b.model : {}) as Record<string, unknown>;
  const plot = (b.plot && typeof b.plot === 'object' ? b.plot : {}) as Record<string, unknown>;
  return {
    slug: slugify(str(b.slug, 80) || name), name, tagline: str(b.tagline, 200), description: str(b.description, 4000),
    location: str(b.location, 80) || 'Dubai', community: slugify(str(b.community, 40)) || 'downtown',
    status: oneOf(b.status, ['Launching', 'Under Construction', 'Ready'] as const, 'Launching'), completion: str(b.completion, 40),
    startingPrice: Math.max(0, Math.round(num(b.startingPrice))),
    model: {
      kind: oneOf(m.kind, ['tower', 'villa'] as const, 'tower'), variant: oneOf(m.variant, ['slab', 'twist', 'stepped'] as const, 'slab'),
      floors: Math.max(6, Math.min(40, Math.round(num(m.floors, 20)))), accent: /^#[0-9a-f]{6}$/i.test(str(m.accent)) ? str(m.accent) : '#c9a96e',
    },
    images: (Array.isArray(b.images) ? b.images : []).map(assetPath).filter(Boolean).slice(0, 12), highlights: strList(b.highlights, 8),
    lat: num(b.lat, 25.2048), lng: num(b.lng, 55.2708), plot: { x: Math.max(-8, Math.min(8, num(plot.x))), z: Math.max(-8, Math.min(8, num(plot.z))) },
  };
}
