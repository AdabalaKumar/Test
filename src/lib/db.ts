import 'server-only';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { defaultContent, projects as seedProjects, properties as seedProperties } from '@/data/seed';
import type { PropertyStatus } from './types';

export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const a = Buffer.from(hash, 'hex');
  const b = scryptSync(password, salt, 64);
  return a.length === b.length && timingSafeEqual(a, b);
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  phone TEXT NOT NULL DEFAULT '', password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'customer',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, data TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, type TEXT NOT NULL,
  status TEXT NOT NULL, price INTEGER NOT NULL, location TEXT NOT NULL, community TEXT NOT NULL,
  project_slug TEXT NOT NULL, bedrooms INTEGER NOT NULL, bathrooms INTEGER NOT NULL, area INTEGER NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0, data TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_properties_filter ON properties (type, status, price);
CREATE TABLE IF NOT EXISTS units (
  id INTEGER PRIMARY KEY AUTOINCREMENT, project_slug TEXT NOT NULL, floor INTEGER NOT NULL, position INTEGER NOT NULL,
  number TEXT NOT NULL, bedrooms INTEGER NOT NULL, area INTEGER NOT NULL, price INTEGER NOT NULL,
  view TEXT NOT NULL, status TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_units_project ON units (project_slug, floor);
CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL DEFAULT 'enquiry', name TEXT NOT NULL, email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '', message TEXT NOT NULL DEFAULT '', property_id INTEGER, user_id INTEGER,
  preferred_date TEXT, status TEXT NOT NULL DEFAULT 'new', notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS wishlist (
  user_id INTEGER NOT NULL, property_id INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, property_id)
);
CREATE TABLE IF NOT EXISTS content (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`;

/** Deterministic pseudo-random in [0,1) so seeded availability is stable. */
function rand(seed: number) {
  const x = Math.sin(seed * 9301.31 + 49297.7) * 233280.17;
  return x - Math.floor(x);
}

function seed(db: Database.Database) {
  const insProject = db.prepare('INSERT INTO projects (slug, name, data) VALUES (?, ?, ?)');
  const insUnit = db.prepare('INSERT INTO units (project_slug, floor, position, number, bedrooms, area, price, view, status) VALUES (?,?,?,?,?,?,?,?,?)');
  const views = ['Skyline', 'Sea', 'Park', 'Boulevard'];
  seedProjects.forEach((p, pi) => {
    insProject.run(p.slug, p.name, JSON.stringify(p));
    if (p.model.kind !== 'tower') return;
    const floors = p.model.floors ?? 20;
    for (let f = 0; f < floors; f++) {
      for (let k = 0; k < 4; k++) {
        const r = rand(pi * 1000 + f * 7 + k * 13 + 1);
        const top = f >= floors - 2;
        const beds = top ? 4 : f > floors * 0.6 ? (k % 2 ? 3 : 2) : k === 0 ? 1 : k === 3 ? 3 : 2;
        const area = [0, 940, 1580, 2340, 3120][beds] + Math.round(r * 12) * 10;
        const price = Math.round((area * (2300 + f * 55 + (k < 2 ? 180 : 0))) / 10000) * 10000;
        const status: PropertyStatus = r < (p.status === 'Launching' ? 0.18 : 0.42) ? 'sold' : r < 0.6 ? 'reserved' : 'available';
        insUnit.run(p.slug, f, k, `${f + 1}${String(k + 1).padStart(2, '0')}`, beds, area, price, views[(k + pi) % 4], status);
      }
    }
  });
  const insProp = db.prepare(`INSERT INTO properties (slug, title, type, status, price, location, community, project_slug, bedrooms, bathrooms, area, featured, data)
    VALUES (@slug, @title, @type, @status, @price, @location, @community, @projectSlug, @bedrooms, @bathrooms, @area, @featured, @data)`);
  for (const p of seedProperties) insProp.run({ ...p, featured: p.featured ? 1 : 0, data: JSON.stringify(p) });

  const insContent = db.prepare('INSERT INTO content (key, value) VALUES (?, ?)');
  for (const [k, v] of Object.entries(defaultContent)) insContent.run(k, v);

  const insUser = db.prepare('INSERT INTO users (name, email, phone, password, role) VALUES (?,?,?,?,?)');
  insUser.run('Aurelia Admin', process.env.ADMIN_EMAIL || 'admin@aurelia.example', '', hashPassword(process.env.ADMIN_PASSWORD || 'Aurelia#2026'), 'admin');
  const demo = insUser.run('Layla Haddad', 'layla@example.com', '+971 50 555 0188', hashPassword('Welcome#2026'), 'customer');
  const uid = Number(demo.lastInsertRowid);

  const insLead = db.prepare(`INSERT INTO enquiries (type, name, email, phone, message, property_id, user_id, preferred_date, status, created_at)
    VALUES (?,?,?,?,?,?,?,?,?, datetime('now', ?))`);
  insLead.run('viewing', 'Layla Haddad', 'layla@example.com', '+971 50 555 0188', 'We would like to see the penthouse at sunset if possible.', 1, uid, '2026-12-02T17:30', 'viewing', '-2 days');
  insLead.run('enquiry', 'James Whitmore', 'j.whitmore@example.com', '+44 7700 900142', 'Please send the brochure and payment plan for the Sky Villa.', 4, null, null, 'contacted', '-4 days');
  insLead.run('enquiry', 'Chen Wei', 'chen.wei@example.com', '+65 8123 4567', 'Is the Signature Villa available furnished? Looking to move in Q1.', 7, null, null, 'qualified', '-6 days');
  insLead.run('callback', 'Sofia Marchetti', 's.marchetti@example.com', '+39 345 555 0101', 'Interested in two-bedroom options under AED 5M.', null, null, null, 'new', '-1 days');
  insLead.run('contact', 'Omar Al Farsi', 'omar@example.com', '+971 55 555 0123', 'Enquiring about bulk purchase for a family office.', null, null, null, 'new', '-3 hours');
  db.prepare('INSERT INTO wishlist (user_id, property_id) VALUES (?, ?), (?, ?)').run(uid, 1, uid, 7);
}

declare global {
  // eslint-disable-next-line no-var
  var __aureliaDb: Database.Database | undefined;
}

export function getDb(): Database.Database {
  if (globalThis.__aureliaDb) return globalThis.__aureliaDb;
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const db = new Database(process.env.DATABASE_PATH || path.join(DATA_DIR, 'aurelia.db'), { timeout: 15000 });
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.transaction(() => {
    db.exec(SCHEMA);
    const seeded = db.prepare("SELECT value FROM meta WHERE key = 'seeded'").get();
    if (!seeded) {
      seed(db);
      db.prepare("INSERT INTO meta (key, value) VALUES ('seeded', '1'), ('auth_secret', ?)").run(randomBytes(48).toString('hex'));
    }
  }).immediate();
  globalThis.__aureliaDb = db;
  return db;
}

export function getAuthSecret(): Uint8Array {
  const env = process.env.AUTH_SECRET;
  const value = env && env.length >= 32 ? env : (getDb().prepare("SELECT value FROM meta WHERE key = 'auth_secret'").get() as { value: string }).value;
  return new TextEncoder().encode(value);
}
