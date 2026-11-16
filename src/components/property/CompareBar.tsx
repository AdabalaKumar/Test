'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Scale, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, useApp } from '@/components/Providers';
import { formatNumber } from '@/lib/i18n';
import type { Property } from '@/lib/types';
import { imgProps } from './PropertyCard';

/** Floating tray plus full-screen table for comparing up to three residences side by side. */
export default function CompareBar() {
  const { compare, toggleCompare, clearCompare, money, t } = useApp();
  const [items, setItems] = useState<Property[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!compare.length) { setItems([]); setOpen(false); return; }
    let live = true;
    Promise.all(compare.map((id) => api<Property>(`/api/properties/${id}`).catch(() => null))).then((r) => { if (live) setItems(r.filter(Boolean) as Property[]); });
    return () => { live = false; };
  }, [compare]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);

  const rows: [string, (p: Property) => string][] = [
    [t('label.price'), (p) => money(p.price)], [t('label.type'), (p) => t(`type.${p.type}`)], [t('label.status'), (p) => t(`status.${p.status}`)],
    [t('label.location'), (p) => p.location], [t('label.beds'), (p) => String(p.bedrooms)], [t('label.baths'), (p) => String(p.bathrooms)],
    [`Area (${t('label.area')})`, (p) => formatNumber(p.area)], [`Price / ${t('label.area')}`, (p) => money(Math.round(p.price / Math.max(p.area, 1)))],
    ['View', (p) => p.specs.View ?? '—'], ['Parking', (p) => p.specs.Parking ?? '—'], ['Handover', (p) => p.specs.Handover ?? '—'],
    ['Amenities', (p) => p.amenities.slice(0, 5).join(' · ')],
  ];

  return (
    <>
      <AnimatePresence>
        {items.length > 0 && !open && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="glass fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-2xl items-center gap-3 p-3 sm:bottom-5">
            <div className="flex flex-1 items-center gap-2 overflow-hidden">
              {items.map((p) => (
                <div key={p.id} className="relative h-12 w-16 shrink-0 overflow-hidden border border-white/10">
                  <Image {...imgProps(p.images[0])} alt={p.title} fill sizes="64px" className="object-cover" />
                  <button type="button" aria-label={`Remove ${p.title}`} onClick={() => toggleCompare(p.id)} className="absolute right-0 top-0 bg-ink/80 p-0.5 text-ivory hover:text-gold"><X size={10} /></button>
                </div>
              ))}
              <p className="ml-1 hidden truncate text-xs text-ivory/60 sm:block">{items.length} of 3 selected</p>
            </div>
            <button type="button" onClick={clearCompare} className="text-[10px] font-semibold uppercase tracking-wide2 text-ivory/50 hover:text-ivory">Clear</button>
            <button type="button" disabled={items.length < 2} onClick={() => setOpen(true)} className="btn-gold btn-sm"><Scale size={13} /> {t('cta.compare')}</button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <motion.div role="dialog" aria-modal="true" aria-label="Compare residences" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] overflow-auto bg-ink/97 backdrop-blur-xl" data-lenis-prevent>
            <div className="shell py-10">
              <div className="flex items-center justify-between">
                <div><p className="eyebrow">{t('cta.compare')}</p><h2 className="mt-2 font-serif text-4xl font-light">Side by side</h2></div>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close comparison" className="border border-white/15 p-3 text-ivory hover:border-gold hover:text-gold"><X size={18} /></button>
              </div>
              <div className="mt-10 overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    <tr>
                      <th className="w-40" />
                      {items.map((p) => (
                        <th key={p.id} className="p-3 align-top font-normal">
                          <div className="relative aspect-[4/3] overflow-hidden"><Image {...imgProps(p.images[0])} alt={p.title} fill sizes="33vw" className="object-cover" /></div>
                          <Link href={`/properties/${p.slug}`} onClick={() => setOpen(false)} className="mt-4 block font-serif text-2xl font-light hover:text-gold">{p.title}</Link>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(([label, get]) => (
                      <tr key={label} className="border-t border-white/[0.07]">
                        <th scope="row" className="py-4 pr-4 text-[10px] font-medium uppercase tracking-wide2 text-ivory/45">{label}</th>
                        {items.map((p) => <td key={p.id} className="px-3 py-4 text-sm text-ivory/85">{get(p)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
