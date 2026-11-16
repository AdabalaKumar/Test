'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { LayoutGrid, List, Search, SlidersHorizontal, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/components/Providers';
import type { Property, PropertyStatus, PropertyType } from '@/lib/types';
import PropertyCard from './PropertyCard';

const TYPES: PropertyType[] = ['apartment', 'penthouse', 'villa', 'townhouse'];
const STATUSES: PropertyStatus[] = ['available', 'reserved', 'sold'];
const SORTS = [['featured', 'Featured'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['area', 'Largest first'], ['beds', 'Most bedrooms']] as const;

export default function PropertiesExplorer({ properties }: { properties: Property[] }) {
  const { t, money, wishlist } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const ceiling = useMemo(() => Math.ceil(Math.max(...properties.map((p) => p.price), 1e6) / 1e6) * 1e6, [properties]);
  const locations = useMemo(() => [...new Set(properties.map((p) => p.location))], [properties]);

  const [q, setQ] = useState(params.get('q') ?? '');
  const [types, setTypes] = useState<string[]>(params.get('type')?.split(',').filter(Boolean) ?? []);
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [location, setLocation] = useState(params.get('location') ?? '');
  const [minBeds, setMinBeds] = useState(Number(params.get('minBeds') ?? 0));
  const [maxPrice, setMaxPrice] = useState(Number(params.get('maxPrice')) || ceiling);
  const [minPrice, setMinPrice] = useState(Number(params.get('minPrice')) || 0);
  const [sort, setSort] = useState(params.get('sort') ?? 'featured');
  const [saved, setSaved] = useState(params.get('saved') === '1');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => { setSaved(params.get('saved') === '1'); }, [params]);

  // Keep the URL shareable: filters are mirrored into the query string.
  useEffect(() => {
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    if (types.length) next.set('type', types.join(','));
    if (status) next.set('status', status);
    if (location) next.set('location', location);
    if (minBeds) next.set('minBeds', String(minBeds));
    if (minPrice) next.set('minPrice', String(minPrice));
    if (maxPrice < ceiling) next.set('maxPrice', String(maxPrice));
    if (sort !== 'featured') next.set('sort', sort);
    if (saved) next.set('saved', '1');
    const qs = next.toString();
    if (qs !== params.toString()) router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, types, status, location, minBeds, minPrice, maxPrice, sort, saved]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = properties.filter((p) =>
      (!needle || [p.title, p.location, p.tagline, p.description, p.type].join(' ').toLowerCase().includes(needle)) &&
      (!types.length || types.includes(p.type)) && (!status || p.status === status) && (!location || p.location === location) &&
      p.bedrooms >= minBeds && p.price >= minPrice && p.price <= maxPrice && (!saved || wishlist.includes(p.id)));
    const by: Record<string, (a: Property, b: Property) => number> = {
      'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price, area: (a, b) => b.area - a.area, beds: (a, b) => b.bedrooms - a.bedrooms,
      featured: (a, b) => Number(b.featured) - Number(a.featured) || a.id - b.id,
    };
    return list.sort(by[sort] ?? by.featured);
  }, [properties, q, types, status, location, minBeds, minPrice, maxPrice, sort, saved, wishlist]);

  const active = (q ? 1 : 0) + types.length + (status ? 1 : 0) + (location ? 1 : 0) + (minBeds ? 1 : 0) + (minPrice ? 1 : 0) + (maxPrice < ceiling ? 1 : 0) + (saved ? 1 : 0);
  const reset = () => { setQ(''); setTypes([]); setStatus(''); setLocation(''); setMinBeds(0); setMinPrice(0); setMaxPrice(ceiling); setSaved(false); };
  const toggleType = (v: string) => setTypes((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));

  const filters = (
    <div className="space-y-8">
      <div>
        <label className="label" htmlFor="f-q">Search</label>
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold rtl:left-auto rtl:right-4" />
          <input id="f-q" className="field pl-10 rtl:pl-4 rtl:pr-10" placeholder="Name, location, feature…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <fieldset>
        <legend className="label">{t('label.type')}</legend>
        <div className="flex flex-wrap gap-1.5">
          {TYPES.map((v) => <button key={v} type="button" aria-pressed={types.includes(v)} onClick={() => toggleType(v)} className={`chip ${types.includes(v) ? 'chip-active' : 'hover:border-gold hover:text-gold'}`}>{t(`type.${v}`)}</button>)}
        </div>
      </fieldset>
      <fieldset>
        <legend className="label">{t('label.status')}</legend>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" aria-pressed={!status} onClick={() => setStatus('')} className={`chip ${!status ? 'chip-active' : 'hover:border-gold hover:text-gold'}`}>{t('label.any')}</button>
          {STATUSES.map((v) => <button key={v} type="button" aria-pressed={status === v} onClick={() => setStatus(v)} className={`chip ${status === v ? 'chip-active' : 'hover:border-gold hover:text-gold'}`}>{t(`status.${v}`)}</button>)}
        </div>
      </fieldset>
      <div>
        <label className="label" htmlFor="f-loc">{t('label.location')}</label>
        <select id="f-loc" className="field" value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="">{t('label.any')}</option>
          {locations.map((l) => <option key={l}>{l}</option>)}
        </select>
      </div>
      <div>
        <div className="mb-2 flex items-baseline justify-between"><span className="label mb-0">{t('label.price')}</span><span className="text-xs text-ivory/80" dir="ltr">{money(minPrice, true)} – {money(maxPrice, true)}{maxPrice >= ceiling ? '+' : ''}</span></div>
        <label className="sr-only" htmlFor="f-min">Minimum price</label>
        <input id="f-min" type="range" className="h-1 w-full cursor-pointer" min={0} max={ceiling} step={500000} value={minPrice} onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice))} />
        <label className="sr-only" htmlFor="f-max">Maximum price</label>
        <input id="f-max" type="range" className="mt-3 h-1 w-full cursor-pointer" min={0} max={ceiling} step={500000} value={maxPrice} onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice))} />
      </div>
      <fieldset>
        <legend className="label">{t('label.beds')}</legend>
        <div className="grid grid-cols-6 gap-px bg-white/10">
          {[0, 1, 2, 3, 4, 5].map((n) => <button key={n} type="button" aria-pressed={minBeds === n} onClick={() => setMinBeds(n)} className={`py-2.5 text-xs transition-colors ${minBeds === n ? 'bg-gold font-semibold text-ink' : 'bg-ink-800 text-ivory/60 hover:text-gold'}`}>{n === 0 ? t('label.any') : `${n}+`}</button>)}
        </div>
      </fieldset>
      <label className="flex cursor-pointer items-center justify-between border border-white/10 px-4 py-3 text-xs text-ivory/70">
        {t('label.saved')} ({wishlist.length})
        <input type="checkbox" className="h-4 w-4 accent-[#c9a96e]" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
      </label>
      {active > 0 && <button type="button" onClick={reset} className="btn-ghost text-[10px]"><X size={12} /> Clear all filters</button>}
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-14">
      <aside className="hidden lg:block"><div className="sticky top-28">{filters}</div></aside>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] pb-5">
          <p className="text-sm text-ivory/60" aria-live="polite"><span className="font-serif text-2xl text-ivory">{results.length}</span> {t('label.results')}</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setFiltersOpen(true)} className="chip lg:hidden"><SlidersHorizontal size={12} /> Filters{active ? ` (${active})` : ''}</button>
            <label className="sr-only" htmlFor="f-sort">{t('label.sort')}</label>
            <select id="f-sort" className="field w-auto py-2 text-xs" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <div className="hidden border border-white/10 sm:flex" role="group" aria-label="Layout">
              {([['grid', LayoutGrid], ['list', List]] as const).map(([v, Icon]) => (
                <button key={v} type="button" aria-pressed={view === v} aria-label={`${v} view`} onClick={() => setView(v)} className={`p-2.5 transition-colors ${view === v ? 'bg-gold text-ink' : 'text-ivory/60 hover:text-gold'}`}><Icon size={15} strokeWidth={1.5} /></button>
              ))}
            </div>
          </div>
        </div>
        {results.length === 0 ? (
          <div className="flex flex-col items-center py-28 text-center">
            <p className="font-serif text-3xl font-light">No residences match those filters</p>
            <p className="mt-3 text-sm text-ivory/50">Try widening the price range or clearing a filter.</p>
            <button type="button" onClick={reset} className="btn-outline btn-sm mt-8">Clear all filters</button>
          </div>
        ) : (
          <motion.div layout className={`mt-8 grid gap-6 ${view === 'grid' ? 'sm:grid-cols-2 2xl:grid-cols-3' : ''}`}>
            <AnimatePresence mode="popLayout">
              {results.map((p, i) => (
                <motion.div key={p.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                  <PropertyCard p={p} view={view} priority={i < 2} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      <AnimatePresence>
        {filtersOpen && (
          <motion.div role="dialog" aria-modal="true" aria-label="Filters" className="fixed inset-0 z-[60] overflow-y-auto bg-ink p-6 lg:hidden" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} data-lenis-prevent>
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-serif text-3xl font-light">Filters</h2>
              <button type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)} className="border border-white/15 p-2.5"><X size={18} /></button>
            </div>
            {filters}
            <button type="button" onClick={() => setFiltersOpen(false)} className="btn-gold sticky bottom-0 mt-8 w-full">Show {results.length} {t('label.results')}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
