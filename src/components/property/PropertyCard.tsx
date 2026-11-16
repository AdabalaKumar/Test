'use client';

import { ArrowUpRight, Bath, BedDouble, Heart, MapPin, Maximize, Scale } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useApp } from '@/components/Providers';
import { formatNumber } from '@/lib/i18n';
import type { Property, PropertyStatus } from '@/lib/types';

const STATUS_STYLE: Record<PropertyStatus, string> = {
  available: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
  reserved: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  sold: 'border-rose-400/40 bg-rose-400/10 text-rose-300',
};

export function StatusBadge({ status }: { status: PropertyStatus }) {
  const { t } = useApp();
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide2 backdrop-blur ${STATUS_STYLE[status]}`}>
      <i className="h-1.5 w-1.5 rounded-full bg-current" />{t(`status.${status}`)}
    </span>
  );
}

export const imgProps = (src: string) => ({ src, unoptimized: src.startsWith('/api/') });

export function Facts({ p, className = '' }: { p: Property; className?: string }) {
  const { t } = useApp();
  return (
    <ul className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ivory/60 ${className}`}>
      <li className="flex items-center gap-1.5"><BedDouble size={14} strokeWidth={1.3} className="text-gold" />{p.bedrooms} {t('label.beds')}</li>
      <li className="flex items-center gap-1.5"><Bath size={14} strokeWidth={1.3} className="text-gold" />{p.bathrooms} {t('label.baths')}</li>
      <li className="flex items-center gap-1.5"><Maximize size={13} strokeWidth={1.3} className="text-gold" />{formatNumber(p.area)} {t('label.area')}</li>
    </ul>
  );
}

export default function PropertyCard({ p, view = 'grid', priority = false }: { p: Property; view?: 'grid' | 'list'; priority?: boolean }) {
  const { t, money, wishlist, toggleWish, compare, toggleCompare } = useApp();
  const saved = wishlist.includes(p.id);
  const comparing = compare.includes(p.id);
  const list = view === 'list';
  const cover = p.images[0] ?? '/images/masterplan-dusk.jpg';
  return (
    <article className={`group card relative flex h-full overflow-hidden transition-colors duration-500 hover:border-gold/40 ${list ? 'flex-col md:flex-row' : 'flex-col'}`}>
      <div className={`relative overflow-hidden ${list ? 'aspect-[16/10] md:aspect-auto md:w-[42%] md:min-h-[17rem]' : 'aspect-[4/3]'}`}>
        <Image {...imgProps(cover)} alt={p.title} fill sizes={list ? '(min-width: 768px) 40vw, 100vw' : '(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw'} priority={priority}
          className={`object-cover transition-transform duration-[1400ms] ease-luxe group-hover:scale-[1.06] ${p.status === 'sold' ? 'grayscale-[0.5]' : ''}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-transparent to-ink-900/30" />
        <div className="absolute left-4 top-4 flex gap-2"><StatusBadge status={p.status} /></div>
        <div className="absolute right-4 top-4 z-[2] flex gap-2">
          <button type="button" onClick={() => toggleCompare(p.id)} aria-pressed={comparing} aria-label={`${t('cta.compare')}: ${p.title}`}
            className={`flex h-9 w-9 items-center justify-center border backdrop-blur transition-colors duration-300 ${comparing ? 'border-gold bg-gold text-ink' : 'border-white/20 bg-ink-900/50 text-ivory hover:border-gold hover:text-gold'}`}>
            <Scale size={15} strokeWidth={1.5} />
          </button>
          <button type="button" onClick={() => toggleWish(p.id)} aria-pressed={saved} aria-label={`${t('label.saved')}: ${p.title}`}
            className={`flex h-9 w-9 items-center justify-center border backdrop-blur transition-colors duration-300 ${saved ? 'border-gold bg-gold text-ink' : 'border-white/20 bg-ink-900/50 text-ivory hover:border-gold hover:text-gold'}`}>
            <Heart size={15} strokeWidth={1.5} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>
        <p className="absolute bottom-4 left-4 text-[10px] font-semibold uppercase tracking-wide2 text-ivory/85">{t(`type.${p.type}`)}</p>
      </div>
      <div className={`flex flex-1 flex-col p-6 ${list ? 'md:p-8' : ''}`}>
        <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide2 text-ivory/45"><MapPin size={12} strokeWidth={1.4} className="text-gold" />{p.location}</p>
        <h3 className={`mt-2.5 font-serif font-light leading-tight ${list ? 'text-3xl' : 'text-[1.65rem]'}`}>
          <Link href={`/properties/${p.slug}`} className="after:absolute after:inset-0 after:z-[1]">{p.title}</Link>
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ivory/50 line-clamp-2">{p.tagline}</p>
        <Facts p={p} className="mt-5" />
        <div className="mt-auto pt-6">
          <div className="flex items-end justify-between border-t border-white/[0.07] pt-5">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-wide2 text-ivory/40">{t('label.price')}</p>
            <p className="font-serif text-2xl text-gold" dir="ltr">{money(p.price)}</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center border border-white/15 text-ivory/70 transition-all duration-500 ease-luxe group-hover:border-gold group-hover:bg-gold group-hover:text-ink"><ArrowUpRight size={16} strokeWidth={1.4} /></span>
          </div>
        </div>
      </div>
    </article>
  );
}
