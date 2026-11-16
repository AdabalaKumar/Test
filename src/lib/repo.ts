import 'server-only';
import { getDb } from './db';
import type { Enquiry, Project, Property, SiteContent, Unit, User } from './types';

type Row = Record<string, unknown>;

function toProperty(r: Row): Property {
  const data = JSON.parse(r.data as string);
  return {
    ...data, id: r.id, slug: r.slug, title: r.title, type: r.type, status: r.status, price: r.price, location: r.location,
    community: r.community, projectSlug: r.project_slug, bedrooms: r.bedrooms, bathrooms: r.bathrooms, area: r.area,
    featured: !!r.featured, createdAt: r.created_at,
  } as Property;
}
const toProject = (r: Row): Project => ({ ...JSON.parse(r.data as string), id: r.id, slug: r.slug, name: r.name }) as Project;
const toUnit = (r: Row): Unit => ({ id: r.id, projectSlug: r.project_slug, floor: r.floor, position: r.position, number: r.number, bedrooms: r.bedrooms, area: r.area, price: r.price, view: r.view, status: r.status }) as Unit;
const toUser = (r: Row): User => ({ id: r.id, name: r.name, email: r.email, phone: r.phone, role: r.role, createdAt: r.created_at }) as User;
const toEnquiry = (r: Row): Enquiry => ({
  id: r.id, type: r.type, name: r.name, email: r.email, phone: r.phone, message: r.message, propertyId: r.property_id,
  propertyTitle: (r.property_title as string) ?? null, userId: r.user_id, preferredDate: r.preferred_date, status: r.status, notes: r.notes, createdAt: r.created_at,
}) as Enquiry;

export interface PropertyQuery {
  q?: string; type?: string; status?: string; location?: string; community?: string; project?: string;
  minPrice?: number; maxPrice?: number; minBeds?: number; featured?: boolean; sort?: string; limit?: number;
}

export function listProperties(query: PropertyQuery = {}): Property[] {
  const where: string[] = [];
  const args: unknown[] = [];
  const add = (sql: string, ...v: unknown[]) => { where.push(sql); args.push(...v); };
  if (query.q) add('(title LIKE ? OR location LIKE ? OR data LIKE ?)', `%${query.q}%`, `%${query.q}%`, `%${query.q}%`);
  if (query.type) add('type = ?', query.type);
  if (query.status) add('status = ?', query.status);
  if (query.location) add('location = ?', query.location);
  if (query.community) add('community = ?', query.community);
  if (query.project) add('project_slug = ?', query.project);
  if (query.minPrice != null && Number.isFinite(query.minPrice)) add('price >= ?', query.minPrice);
  if (query.maxPrice != null && Number.isFinite(query.maxPrice)) add('price <= ?', query.maxPrice);
  if (query.minBeds != null && Number.isFinite(query.minBeds)) add('bedrooms >= ?', query.minBeds);
  if (query.featured) add('featured = 1');
  const order = { 'price-asc': 'price ASC', 'price-desc': 'price DESC', newest: 'created_at DESC, id DESC', area: 'area DESC' }[query.sort ?? ''] ?? 'featured DESC, id ASC';
  const limit = query.limit && query.limit > 0 ? ` LIMIT ${Math.min(Math.floor(query.limit), 200)}` : '';
  const sql = `SELECT * FROM properties ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${order}${limit}`;
  return (getDb().prepare(sql).all(...args) as Row[]).map(toProperty);
}
export function getProperty(idOrSlug: string | number): Property | null {
  const r = getDb().prepare('SELECT * FROM properties WHERE id = ? OR slug = ?').get(Number(idOrSlug) || -1, String(idOrSlug)) as Row | undefined;
  return r ? toProperty(r) : null;
}
const propCols = (p: Omit<Property, 'id'>) => ({
  slug: p.slug, title: p.title, type: p.type, status: p.status, price: p.price, location: p.location, community: p.community,
  projectSlug: p.projectSlug, bedrooms: p.bedrooms, bathrooms: p.bathrooms, area: p.area, featured: p.featured ? 1 : 0, data: JSON.stringify(p),
});
export function createProperty(p: Omit<Property, 'id'>): Property {
  const res = getDb().prepare(`INSERT INTO properties (slug, title, type, status, price, location, community, project_slug, bedrooms, bathrooms, area, featured, data)
    VALUES (@slug, @title, @type, @status, @price, @location, @community, @projectSlug, @bedrooms, @bathrooms, @area, @featured, @data)`).run(propCols(p));
  return getProperty(Number(res.lastInsertRowid))!;
}
export function updateProperty(id: number, p: Omit<Property, 'id'>): Property | null {
  getDb().prepare(`UPDATE properties SET slug=@slug, title=@title, type=@type, status=@status, price=@price, location=@location, community=@community,
    project_slug=@projectSlug, bedrooms=@bedrooms, bathrooms=@bathrooms, area=@area, featured=@featured, data=@data WHERE id=@id`).run({ ...propCols(p), id });
  return getProperty(id);
}
export function deleteProperty(id: number) {
  const db = getDb();
  db.prepare('DELETE FROM wishlist WHERE property_id = ?').run(id);
  return db.prepare('DELETE FROM properties WHERE id = ?').run(id).changes > 0;
}

export const listProjects = (): Project[] => (getDb().prepare('SELECT * FROM projects ORDER BY id').all() as Row[]).map(toProject);
export function getProject(idOrSlug: string | number): Project | null {
  const r = getDb().prepare('SELECT * FROM projects WHERE id = ? OR slug = ?').get(Number(idOrSlug) || -1, String(idOrSlug)) as Row | undefined;
  return r ? toProject(r) : null;
}
export function saveProject(p: Omit<Project, 'id'>, id?: number): Project {
  const db = getDb();
  if (id) db.prepare('UPDATE projects SET slug = ?, name = ?, data = ? WHERE id = ?').run(p.slug, p.name, JSON.stringify(p), id);
  else id = Number(db.prepare('INSERT INTO projects (slug, name, data) VALUES (?, ?, ?)').run(p.slug, p.name, JSON.stringify(p)).lastInsertRowid);
  return getProject(id)!;
}
export const deleteProject = (id: number) => getDb().prepare('DELETE FROM projects WHERE id = ?').run(id).changes > 0;

export const listUnits = (projectSlug: string): Unit[] =>
  (getDb().prepare('SELECT * FROM units WHERE project_slug = ? ORDER BY floor, position').all(projectSlug) as Row[]).map(toUnit);
export function updateUnit(id: number, patch: { status?: string; price?: number }): Unit | null {
  const db = getDb();
  if (patch.status) db.prepare('UPDATE units SET status = ? WHERE id = ?').run(patch.status, id);
  if (patch.price != null) db.prepare('UPDATE units SET price = ? WHERE id = ?').run(patch.price, id);
  const r = db.prepare('SELECT * FROM units WHERE id = ?').get(id) as Row | undefined;
  return r ? toUnit(r) : null;
}

const LEAD_SQL = 'SELECT e.*, p.title AS property_title FROM enquiries e LEFT JOIN properties p ON p.id = e.property_id';
export const listEnquiries = (userId?: number): Enquiry[] =>
  (userId
    ? (getDb().prepare(`${LEAD_SQL} WHERE e.user_id = ? ORDER BY e.created_at DESC`).all(userId) as Row[])
    : (getDb().prepare(`${LEAD_SQL} ORDER BY e.created_at DESC`).all() as Row[])
  ).map(toEnquiry);
export function createEnquiry(e: Pick<Enquiry, 'type' | 'name' | 'email' | 'phone' | 'message' | 'propertyId' | 'userId' | 'preferredDate'>): number {
  return Number(getDb().prepare('INSERT INTO enquiries (type, name, email, phone, message, property_id, user_id, preferred_date) VALUES (?,?,?,?,?,?,?,?)')
    .run(e.type, e.name, e.email, e.phone, e.message, e.propertyId, e.userId, e.preferredDate).lastInsertRowid);
}
export function updateEnquiry(id: number, patch: { status?: string; notes?: string }) {
  const db = getDb();
  if (patch.status) db.prepare('UPDATE enquiries SET status = ? WHERE id = ?').run(patch.status, id);
  if (patch.notes != null) db.prepare('UPDATE enquiries SET notes = ? WHERE id = ?').run(patch.notes, id);
}
export const deleteEnquiry = (id: number) => getDb().prepare('DELETE FROM enquiries WHERE id = ?').run(id).changes > 0;

export const listUsers = (): User[] => (getDb().prepare('SELECT * FROM users ORDER BY created_at DESC').all() as Row[]).map(toUser);
export function getUserById(id: number): User | null {
  const r = getDb().prepare('SELECT * FROM users WHERE id = ?').get(id) as Row | undefined;
  return r ? toUser(r) : null;
}
export const getUserAuth = (email: string) => getDb().prepare('SELECT * FROM users WHERE email = ?').get(email) as (Row & { id: number; password: string }) | undefined;
export function createUser(u: { name: string; email: string; phone: string; password: string }): User {
  const id = Number(getDb().prepare('INSERT INTO users (name, email, phone, password) VALUES (?,?,?,?)').run(u.name, u.email, u.phone, u.password).lastInsertRowid);
  return getUserById(id)!;
}
export function updateUser(id: number, patch: { name?: string; phone?: string; role?: string }) {
  const db = getDb();
  if (patch.name) db.prepare('UPDATE users SET name = ? WHERE id = ?').run(patch.name, id);
  if (patch.phone != null) db.prepare('UPDATE users SET phone = ? WHERE id = ?').run(patch.phone, id);
  if (patch.role) db.prepare('UPDATE users SET role = ? WHERE id = ?').run(patch.role, id);
  return getUserById(id);
}
export function deleteUser(id: number) {
  const db = getDb();
  db.prepare('DELETE FROM wishlist WHERE user_id = ?').run(id);
  return db.prepare('DELETE FROM users WHERE id = ?').run(id).changes > 0;
}

export const getWishlist = (userId: number): number[] =>
  (getDb().prepare('SELECT property_id FROM wishlist WHERE user_id = ? ORDER BY created_at DESC').all(userId) as { property_id: number }[]).map((r) => r.property_id);
export const addWishlist = (userId: number, propertyId: number) => getDb().prepare('INSERT OR IGNORE INTO wishlist (user_id, property_id) VALUES (?, ?)').run(userId, propertyId);
export const removeWishlist = (userId: number, propertyId: number) => getDb().prepare('DELETE FROM wishlist WHERE user_id = ? AND property_id = ?').run(userId, propertyId);

export function getContent(): SiteContent {
  return Object.fromEntries((getDb().prepare('SELECT key, value FROM content').all() as { key: string; value: string }[]).map((r) => [r.key, r.value]));
}
export function setContent(entries: SiteContent) {
  const db = getDb();
  const up = db.prepare('INSERT INTO content (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  db.transaction(() => { for (const [k, v] of Object.entries(entries)) up.run(k, String(v)); })();
}

export function getStats() {
  const db = getDb();
  const n = (sql: string) => (db.prepare(sql).get() as { n: number }).n;
  return {
    properties: n('SELECT COUNT(*) n FROM properties'),
    available: n("SELECT COUNT(*) n FROM properties WHERE status = 'available'"),
    projects: n('SELECT COUNT(*) n FROM projects'),
    units: n('SELECT COUNT(*) n FROM units'),
    unitsAvailable: n("SELECT COUNT(*) n FROM units WHERE status = 'available'"),
    unitsSold: n("SELECT COUNT(*) n FROM units WHERE status = 'sold'"),
    leads: n('SELECT COUNT(*) n FROM enquiries'),
    newLeads: n("SELECT COUNT(*) n FROM enquiries WHERE status = 'new'"),
    users: n('SELECT COUNT(*) n FROM users'),
    pipeline: n("SELECT COALESCE(SUM(p.price),0) n FROM enquiries e JOIN properties p ON p.id = e.property_id WHERE e.status NOT IN ('lost','won')"),
    byStatus: db.prepare('SELECT status, COUNT(*) n FROM enquiries GROUP BY status').all() as { status: string; n: number }[],
  };
}
