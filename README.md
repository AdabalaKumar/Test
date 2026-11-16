# Aurelia Estates

A luxury real-estate website with real-time 3D property exploration, built with Next.js 15, TypeScript, Tailwind CSS, React Three Fiber, Framer Motion and GSAP. It includes a REST API, a SQLite database, authentication, a customer dashboard and an admin console.

"Aurelia Estates", its projects, people and contact details are fictional sample data.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

The database is created and seeded on first run (`data/aurelia.db`). Two accounts are seeded:

| Role     | Email                  | Password       |
| -------- | ---------------------- | -------------- |
| Admin    | `admin@aurelia.example` | `Aurelia#2026` (or `ADMIN_PASSWORD` if set before first run) |
| Customer | `layla@example.com`     | `Welcome#2026` |

Change or remove these before going live. To start over, delete the `data/` folder.

Production: `npm run build && npm start`. See `.env.example` for configuration.

## What is in it

**Pages** — Home, Properties (filters, grid/list, compare, wishlist), Property detail, Projects, Project detail, 3D Virtual Tours, About, Communities, Contact, Login / Register, Customer dashboard, Admin console.

**3D** (`src/components/three`)

- `Tower`, `Villa` — procedural building models with selectable floors and clickable residences coloured by availability.
- `Interior` — a cutaway model of each residence layout with room hotspots and a guided tour.
- `MasterPlan` — an interactive district model of all developments.
- `PropertyViewer` — the viewer UI: 360° orbit, zoom, floor selector, exterior/interior, day/night, availability overlay, fullscreen.
- `HeroScene` — the homepage hero with a GSAP camera move.

All models are generated in code, so the site needs no 3D asset files. Admins can upload a `.glb` per property to replace the procedural exterior.

**Imagery** — every photograph-style image in `public/images` is a still rendered from those same 3D models by `npm run render:images` (start the app first; pass `-- --base http://localhost:3000`). Replace them with real photography or CGI by uploading images in the admin console.

**Backend** (`src/app/api`, `src/lib`)

| Endpoint | Methods | Access |
| --- | --- | --- |
| `/api/properties` | `GET` (search: `q`, `type`, `status`, `location`, `community`, `project`, `minPrice`, `maxPrice`, `minBeds`, `featured`, `sort`, `limit`), `POST` | public / admin |
| `/api/properties/:id` | `GET`, `PUT`, `DELETE` | public / admin |
| `/api/projects`, `/api/projects/:id` | `GET`, `POST`, `PUT`, `DELETE` | public / admin |
| `/api/units?project=` , `/api/units/:id` | `GET`, `PATCH` | public / admin |
| `/api/enquiries`, `/api/enquiries/:id` | `POST`, `GET`, `PATCH`, `DELETE` | public / owner / admin |
| `/api/wishlist` | `GET`, `POST`, `DELETE` | signed-in user |
| `/api/users`, `/api/users/:id` | `GET`, `PATCH`, `DELETE` | admin |
| `/api/content` | `GET`, `PUT` | public / admin |
| `/api/upload` | `POST` (multipart: `file`, `kind` = `image` \| `model` \| `plan`) | admin |
| `/api/stats` | `GET` | admin |
| `/api/auth/{register,login,logout,me}` | `POST`, `GET`, `PATCH` | — |

- **Database**: SQLite via `better-sqlite3` (`src/lib/db.ts`, `src/lib/repo.ts`). All queries are parameterised.
- **Auth**: scrypt password hashes, HS256 JWT in an `httpOnly`, `SameSite=Lax` cookie, role re-read from the database on every request, rate-limited login/registration/enquiry endpoints.
- **Uploads**: stored under `data/uploads`, served by `/api/files/*`; type, size and file signature are checked.

**Other features** — mortgage calculator, currency switcher (AED/USD/EUR/GBP, fixed indicative rates in `src/lib/i18n.ts`), English/Arabic (RTL)/French interface, Google Maps embeds, WhatsApp enquiry links, lead pipeline.

## Before production

- Set `AUTH_SECRET`, `ADMIN_PASSWORD` and `NEXT_PUBLIC_SITE_URL`, and serve over HTTPS.
- Put `DATA_DIR` on a persistent disk. SQLite and local uploads suit a single server; for serverless or multi-instance hosting, move `src/lib/repo.ts` to a hosted database and uploads to object storage. The in-memory rate limiter has the same single-instance assumption.
- Translations cover the interface (navigation, labels, forms). Property descriptions and long-form copy are stored in English only.
- Enquiries are stored and managed in the admin console; no email or CRM notification is sent.
- Set the real WhatsApp number and contact details under Admin → Content.
