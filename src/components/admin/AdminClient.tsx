'use client';

import { Building2, FileText, Home, Layers, LayoutDashboard, LogOut, MessageSquare, Pencil, Plus, Star, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fmtDate } from '@/components/DashboardClient';
import { Logo } from '@/components/layout/Navbar';
import { api, useApp } from '@/components/Providers';
import { STATUS_COLOR } from '@/lib/status';
import { formatMoney, formatNumber } from '@/lib/i18n';
import type { Enquiry, LeadStatus, Project, Property, PropertyStatus, SiteContent, Unit, User } from '@/lib/types';
import ProjectEditor from './ProjectEditor';
import PropertyEditor from './PropertyEditor';
import { TableWrap, Td, Th, selectSm } from './ui';

type Tab = 'overview' | 'properties' | 'projects' | 'availability' | 'leads' | 'users' | 'content';
type Stats = Record<string, number> & { byStatus: { status: string; n: number }[] };
const LEAD_STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'viewing', 'won', 'lost'];
const STATUSES: PropertyStatus[] = ['available', 'reserved', 'sold'];
const aed = (n: number, compact = false) => formatMoney(n, 'AED', 'en', compact);

export default function AdminClient({ admin }: { admin: User }) {
  const { setUser } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [leads, setLeads] = useState<Enquiry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [content, setContent] = useState<SiteContent>({});
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitProject, setUnitProject] = useState('');
  const [editProperty, setEditProperty] = useState<Property | null | 'new'>(null);
  const [editProject, setEditProject] = useState<Project | null | 'new'>(null);
  const [leadFilter, setLeadFilter] = useState('');
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2600); };
  const run = useCallback(async (fn: () => Promise<unknown>, done?: string) => {
    setError('');
    try { await fn(); if (done) notify(done); } catch (e) { setError(e instanceof Error ? e.message : 'Request failed.'); }
  }, []);

  const load = useCallback(() => run(async () => {
    const [s, pr, pj, l, u, c] = await Promise.all([
      api<Stats>('/api/stats'), api<{ items: Property[] }>('/api/properties'), api<{ items: Project[] }>('/api/projects'),
      api<{ items: Enquiry[] }>('/api/enquiries'), api<{ items: User[] }>('/api/users'), api<SiteContent>('/api/content'),
    ]);
    setStats(s); setProperties(pr.items); setProjects(pj.items); setLeads(l.items); setUsers(u.items); setContent(c);
    setUnitProject((cur) => cur || pj.items.find((p) => p.model.kind === 'tower')?.slug || '');
  }), [run]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (unitProject) run(async () => setUnits((await api<{ items: Unit[] }>(`/api/units?project=${unitProject}`)).items)); }, [unitProject, run]);

  const logout = async () => { await api('/api/auth/logout', { method: 'POST' }); setUser(null); router.push('/'); router.refresh(); };
  const patchProperty = (p: Property, patch: Partial<Property>) => run(async () => { await api(`/api/properties/${p.id}`, { method: 'PUT', json: patch }); await load(); }, 'Property updated');
  const cycleUnit = (u: Unit) => {
    const status = STATUSES[(STATUSES.indexOf(u.status) + 1) % 3];
    setUnits((list) => list.map((x) => (x.id === u.id ? { ...x, status } : x)));
    run(() => api(`/api/units/${u.id}`, { method: 'PATCH', json: { status } }));
  };
  const floors = useMemo(() => [...new Set(units.map((u) => u.floor))].sort((a, b) => b - a), [units]);
  const shownLeads = leads.filter((l) => !leadFilter || l.status === leadFilter);

  const NAV: [Tab, string, typeof Home][] = [
    ['overview', 'Overview', LayoutDashboard], ['properties', 'Properties', Home], ['projects', 'Projects', Building2], ['availability', 'Availability', Layers],
    ['leads', 'Leads', MessageSquare], ['users', 'Users', Users], ['content', 'Content', FileText],
  ];
  const CONTENT_GROUPS: [string, string[]][] = [
    ['Homepage hero', ['hero.eyebrow', 'hero.headline', 'hero.sub']],
    ['Statistics', [1, 2, 3, 4].flatMap((i) => [`stats.${i}.value`, `stats.${i}.label`])],
    ['About', ['about.headline', 'about.body']],
    ['Contact', ['contact.phone', 'contact.email', 'contact.whatsapp', 'contact.address', 'contact.hours']],
  ];

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="border-b border-white/[0.07] bg-ink-800 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between p-5 lg:block lg:p-7"><Logo /><p className="text-[9px] font-semibold uppercase tracking-luxe text-ivory/35 lg:mt-6">Admin console</p></div>
        <nav className="flex gap-px overflow-x-auto px-3 pb-3 [scrollbar-width:none] lg:block lg:space-y-1 lg:px-4" aria-label="Admin sections">
          {NAV.map(([k, label, Icon]) => (
            <button key={k} type="button" aria-current={tab === k ? 'page' : undefined} onClick={() => setTab(k)}
              className={`flex shrink-0 items-center gap-3 px-4 py-3 text-xs font-medium transition-colors lg:w-full ${tab === k ? 'bg-gold text-ink' : 'text-ivory/60 hover:bg-white/5 hover:text-ivory'}`}>
              <Icon size={15} strokeWidth={1.5} />{label}
              {k === 'leads' && stats && stats.newLeads > 0 && <span className={`ml-auto rounded-full px-1.5 text-[9px] font-bold ${tab === k ? 'bg-ink text-gold' : 'bg-gold text-ink'}`}>{stats.newLeads}</span>}
            </button>
          ))}
        </nav>
        <div className="hidden space-y-1 border-t border-white/[0.07] p-4 lg:absolute lg:inset-x-0 lg:bottom-0 lg:block">
          <p className="truncate px-4 pb-2 text-xs text-ivory/45">{admin.email}</p>
          <Link href="/" className="flex items-center gap-3 px-4 py-2.5 text-xs text-ivory/60 hover:text-gold"><Home size={14} /> View website</Link>
          <button type="button" onClick={logout} className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-ivory/60 hover:text-gold"><LogOut size={14} /> Sign out</button>
        </div>
      </aside>

      <div className="min-w-0 p-5 sm:p-8 lg:p-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-serif text-4xl font-light capitalize">{NAV.find(([k]) => k === tab)?.[1]}</h1>
          <div className="flex gap-2 lg:hidden"><Link href="/" className="btn-outline btn-sm">Website</Link><button type="button" onClick={logout} className="btn-outline btn-sm">Sign out</button></div>
        </div>
        {error && <p role="alert" className="mb-6 border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

        {tab === 'overview' && stats && (
          <div className="space-y-10">
            <div className="grid gap-px bg-white/[0.07] sm:grid-cols-2 xl:grid-cols-4">
              {[['Properties', stats.properties, `${stats.available} available`], ['Residences in towers', stats.units, `${stats.unitsAvailable} available · ${stats.unitsSold} sold`], ['Leads', stats.leads, `${stats.newLeads} new`], ['Open pipeline', aed(stats.pipeline, true), `${stats.users} registered users`]].map(([l, v, sub]) => (
                <div key={l as string} className="bg-ink p-7"><p className="text-[9px] font-semibold uppercase tracking-wide2 text-ivory/40">{l}</p><p className="mt-3 font-serif text-5xl font-light text-gold">{v}</p><p className="mt-2 text-xs text-ivory/50">{sub}</p></div>
              ))}
            </div>
            <div className="grid gap-8 xl:grid-cols-2">
              <section className="card p-7">
                <h2 className="font-serif text-2xl font-light">Lead pipeline</h2>
                <ul className="mt-6 space-y-4">
                  {LEAD_STATUSES.map((s) => {
                    const n = stats.byStatus.find((b) => b.status === s)?.n ?? 0;
                    return (
                      <li key={s} className="grid grid-cols-[6rem_1fr_2rem] items-center gap-4 text-xs">
                        <span className="capitalize text-ivory/60">{s}</span>
                        <span className="h-2 bg-white/[0.06]"><span className="block h-full bg-gold transition-all duration-700" style={{ width: `${stats.leads ? (n / stats.leads) * 100 : 0}%` }} /></span>
                        <span className="text-right text-ivory">{n}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>
              <section className="card p-7">
                <h2 className="font-serif text-2xl font-light">Latest leads</h2>
                <ul className="mt-4 divide-y divide-white/[0.06]">
                  {leads.slice(0, 5).map((l) => (
                    <li key={l.id} className="flex items-center justify-between gap-4 py-3.5">
                      <div className="min-w-0"><p className="truncate text-sm">{l.name}</p><p className="truncate text-xs text-ivory/45">{l.propertyTitle ?? 'General enquiry'} · {fmtDate(l.createdAt)}</p></div>
                      <span className="chip shrink-0 capitalize">{l.status}</span>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => setTab('leads')} className="btn-ghost mt-4 text-[10px]">Manage leads →</button>
              </section>
            </div>
          </div>
        )}

        {tab === 'properties' && (
          <>
            <button type="button" onClick={() => setEditProperty('new')} className="btn-gold btn-sm mb-5"><Plus size={13} /> New property</button>
            <TableWrap>
              <thead><tr><Th>Property</Th><Th>Type</Th><Th>Price</Th><Th>Status</Th><Th>Media</Th><Th>Featured</Th><Th /></tr></thead>
              <tbody>
                {properties.map((p) => (
                  <tr key={p.id}>
                    <Td><div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0] ?? '/images/masterplan-dusk.jpg'} alt="" className="h-11 w-16 shrink-0 object-cover" />
                      <div className="min-w-0"><Link href={`/properties/${p.slug}`} className="block truncate hover:text-gold">{p.title}</Link><p className="text-xs text-ivory/40">{p.location} · {p.bedrooms} bd · {formatNumber(p.area)} sq ft</p></div>
                    </div></Td>
                    <Td className="capitalize text-ivory/70">{p.type}</Td>
                    <Td className="whitespace-nowrap">{aed(p.price)}</Td>
                    <Td><select aria-label={`Status of ${p.title}`} className={selectSm} value={p.status} onChange={(e) => patchProperty(p, { status: e.target.value as PropertyStatus })} style={{ color: STATUS_COLOR[p.status] }}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></Td>
                    <Td className="whitespace-nowrap text-xs text-ivory/50">{p.images.length} img · {p.floorPlans.length} plan{p.modelUrl ? ' · GLB' : ''}</Td>
                    <Td><button type="button" aria-pressed={p.featured} aria-label="Toggle featured" onClick={() => patchProperty(p, { featured: !p.featured })} className={p.featured ? 'text-gold' : 'text-ivory/25 hover:text-gold'}><Star size={16} fill={p.featured ? 'currentColor' : 'none'} /></button></Td>
                    <Td className="whitespace-nowrap text-right">
                      <button type="button" aria-label={`Edit ${p.title}`} onClick={() => setEditProperty(p)} className="p-2 text-ivory/60 hover:text-gold"><Pencil size={14} /></button>
                      <button type="button" aria-label={`Delete ${p.title}`} onClick={() => confirm(`Delete “${p.title}”? This cannot be undone.`) && run(async () => { await api(`/api/properties/${p.id}`, { method: 'DELETE' }); await load(); }, 'Property deleted')} className="p-2 text-ivory/60 hover:text-rose-300"><Trash2 size={14} /></button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </>
        )}

        {tab === 'projects' && (
          <>
            <button type="button" onClick={() => setEditProject('new')} className="btn-gold btn-sm mb-5"><Plus size={13} /> New project</button>
            <TableWrap>
              <thead><tr><Th>Project</Th><Th>Location</Th><Th>Status</Th><Th>3D model</Th><Th>From</Th><Th /></tr></thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id}>
                    <Td><Link href={`/projects/${p.slug}`} className="hover:text-gold">{p.name}</Link><p className="text-xs text-ivory/40">{p.completion}</p></Td>
                    <Td className="text-ivory/70">{p.location}</Td><Td className="text-ivory/70">{p.status}</Td>
                    <Td className="capitalize text-ivory/70">{p.model.kind === 'villa' ? 'Villa' : `${p.model.variant} tower · ${p.model.floors} fl`}</Td>
                    <Td className="whitespace-nowrap">{aed(p.startingPrice, true)}</Td>
                    <Td className="whitespace-nowrap text-right">
                      <button type="button" aria-label={`Edit ${p.name}`} onClick={() => setEditProject(p)} className="p-2 text-ivory/60 hover:text-gold"><Pencil size={14} /></button>
                      <button type="button" aria-label={`Delete ${p.name}`} onClick={() => confirm(`Delete “${p.name}”? Its properties will remain but lose their project page.`) && run(async () => { await api(`/api/projects/${p.id}`, { method: 'DELETE' }); await load(); }, 'Project deleted')} className="p-2 text-ivory/60 hover:text-rose-300"><Trash2 size={14} /></button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </>
        )}

        {tab === 'availability' && (
          <>
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <select aria-label="Project" className="field w-auto" value={unitProject} onChange={(e) => setUnitProject(e.target.value)}>
                {projects.filter((p) => p.model.kind === 'tower').map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
              </select>
              {STATUSES.map((s) => <span key={s} className="flex items-center gap-2 text-xs capitalize text-ivory/60"><i className="h-2.5 w-2.5" style={{ background: STATUS_COLOR[s] }} />{s} ({units.filter((u) => u.status === s).length})</span>)}
            </div>
            <p className="mb-4 text-xs text-ivory/45">Click a residence to cycle Available → Reserved → Sold. Changes appear in the 3D viewer immediately.</p>
            {units.length === 0 ? <p className="py-10 text-sm text-ivory/45">This project has no tower residences to manage.</p> : (
              <div className="max-w-3xl space-y-1">
                {floors.map((f) => (
                  <div key={f} className="grid grid-cols-[3rem_repeat(4,minmax(0,1fr))] items-stretch gap-1">
                    <span className="flex items-center text-[10px] font-semibold text-ivory/40">FL {String(f + 1).padStart(2, '0')}</span>
                    {units.filter((u) => u.floor === f).map((u) => (
                      <button key={u.id} type="button" onClick={() => cycleUnit(u)} title={`${u.number} · ${u.bedrooms} bed · ${aed(u.price)} · ${u.status}`} aria-label={`Residence ${u.number}, ${u.status}. Click to change.`}
                        className="flex items-center justify-between border px-3 py-2 text-left text-xs transition-colors hover:brightness-125" style={{ borderColor: `${STATUS_COLOR[u.status]}66`, background: `${STATUS_COLOR[u.status]}1f` }}>
                        <span className="font-semibold">{u.number}</span><span className="hidden text-ivory/55 sm:inline">{u.bedrooms}BR · {aed(u.price, true)}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'leads' && (
          <>
            <div className="mb-5 flex flex-wrap gap-1.5">
              <button type="button" onClick={() => setLeadFilter('')} className={`chip ${!leadFilter ? 'chip-active' : ''}`}>All ({leads.length})</button>
              {LEAD_STATUSES.map((s) => <button key={s} type="button" onClick={() => setLeadFilter(s)} className={`chip ${leadFilter === s ? 'chip-active' : ''}`}>{s} ({leads.filter((l) => l.status === s).length})</button>)}
            </div>
            <TableWrap>
              <thead><tr><Th>Contact</Th><Th>Interest</Th><Th>Message</Th><Th>Received</Th><Th>Stage</Th><Th /></tr></thead>
              <tbody>
                {shownLeads.map((l) => (
                  <tr key={l.id}>
                    <Td><p>{l.name}</p><a href={`mailto:${l.email}`} className="block text-xs text-gold hover:underline">{l.email}</a>{l.phone && <a href={`tel:${l.phone.replace(/\s/g, '')}`} className="block text-xs text-ivory/45 hover:text-gold">{l.phone}</a>}</Td>
                    <Td><span className="chip capitalize">{l.type}</span><p className="mt-1.5 text-xs text-ivory/60">{l.propertyTitle ?? 'General'}</p>{l.preferredDate && <p className="text-xs text-gold">Viewing: {fmtDate(l.preferredDate)}</p>}</Td>
                    <Td className="max-w-xs">
                      <p className="line-clamp-2 text-xs text-ivory/60">{l.message || '—'}</p>
                      <input aria-label={`Notes for ${l.name}`} className="mt-2 w-full border-b border-white/10 bg-transparent py-1 text-xs text-ivory placeholder:text-ivory/25 focus:border-gold focus:outline-none" placeholder="Add a note…" defaultValue={l.notes}
                        onBlur={(e) => e.target.value !== l.notes && run(async () => { await api(`/api/enquiries/${l.id}`, { method: 'PATCH', json: { notes: e.target.value } }); await load(); }, 'Note saved')} />
                    </Td>
                    <Td className="whitespace-nowrap text-xs text-ivory/50">{fmtDate(l.createdAt)}</Td>
                    <Td><select aria-label={`Stage for ${l.name}`} className={selectSm} value={l.status} onChange={(e) => run(async () => { await api(`/api/enquiries/${l.id}`, { method: 'PATCH', json: { status: e.target.value } }); await load(); }, 'Lead updated')}>{LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></Td>
                    <Td className="text-right"><button type="button" aria-label={`Delete lead from ${l.name}`} onClick={() => confirm(`Delete the lead from ${l.name}?`) && run(async () => { await api(`/api/enquiries/${l.id}`, { method: 'DELETE' }); await load(); }, 'Lead deleted')} className="p-2 text-ivory/60 hover:text-rose-300"><Trash2 size={14} /></button></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </>
        )}

        {tab === 'users' && (
          <TableWrap>
            <thead><tr><Th>Name</Th><Th>Email</Th><Th>Phone</Th><Th>Joined</Th><Th>Role</Th><Th /></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <Td>{u.name}{u.id === admin.id && <span className="ml-2 text-[9px] uppercase tracking-wide2 text-gold">You</span>}</Td>
                  <Td className="text-ivory/70">{u.email}</Td><Td className="text-ivory/70">{u.phone || '—'}</Td><Td className="whitespace-nowrap text-xs text-ivory/50">{fmtDate(u.createdAt)}</Td>
                  <Td><select aria-label={`Role of ${u.name}`} className={selectSm} value={u.role} disabled={u.id === admin.id} onChange={(e) => run(async () => { await api(`/api/users/${u.id}`, { method: 'PATCH', json: { role: e.target.value } }); await load(); }, 'Role updated')}><option value="customer">customer</option><option value="admin">admin</option></select></Td>
                  <Td className="text-right">{u.id !== admin.id && <button type="button" aria-label={`Delete ${u.name}`} onClick={() => confirm(`Delete the account for ${u.name}?`) && run(async () => { await api(`/api/users/${u.id}`, { method: 'DELETE' }); await load(); }, 'User deleted')} className="p-2 text-ivory/60 hover:text-rose-300"><Trash2 size={14} /></button>}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}

        {tab === 'content' && (
          <form className="max-w-3xl space-y-10" onSubmit={(e) => { e.preventDefault(); run(async () => setContent(await api<SiteContent>('/api/content', { method: 'PUT', json: content })), 'Website content saved'); }}>
            {CONTENT_GROUPS.map(([title, keys]) => (
              <fieldset key={title} className="card p-7">
                <legend className="px-2 font-serif text-2xl font-light">{title}</legend>
                <div className="grid gap-5 sm:grid-cols-2">
                  {keys.map((k) => {
                    const long = (content[k] ?? '').length > 60 || /sub|body|headline|address/.test(k);
                    return (
                      <label key={k} className={long ? 'sm:col-span-2' : ''}>
                        <span className="label">{k}</span>
                        {long ? <textarea className="field min-h-[80px]" value={content[k] ?? ''} onChange={(e) => setContent({ ...content, [k]: e.target.value })} /> : <input className="field" value={content[k] ?? ''} onChange={(e) => setContent({ ...content, [k]: e.target.value })} />}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
            <button type="submit" className="btn-gold">Save website content</button>
          </form>
        )}
      </div>

      {editProperty && <PropertyEditor property={editProperty === 'new' ? null : editProperty} projects={projects} onClose={() => setEditProperty(null)} onSaved={() => { setEditProperty(null); load(); notify('Property saved'); }} />}
      {editProject && <ProjectEditor project={editProject === 'new' ? null : editProject} onClose={() => setEditProject(null)} onSaved={() => { setEditProject(null); load(); notify('Project saved'); }} />}
      {toast && <p role="status" className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 border border-gold/40 bg-ink-700 px-5 py-3 text-xs font-semibold uppercase tracking-wide2 text-gold shadow-2xl">{toast}</p>}
    </div>
  );
}
