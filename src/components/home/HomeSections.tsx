'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/components/Providers';
import Reveal, { SectionHeading } from '@/components/ui/Reveal';
import type { Key } from '@/lib/i18n';
import type { Community, Project, SiteContent } from '@/lib/types';

export function QuickSearch({ locations }: { locations: string[] }) {
  const { t, money } = useApp();
  const router = useRouter();
  const [f, setF] = useState({ type: '', location: '', maxPrice: '', minBeds: '' });
  const go = (e: React.FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams(Object.entries(f).filter(([, v]) => v));
    router.push(`/properties${q.size ? `?${q}` : ''}`);
  };
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLSelectElement>) => setF((s) => ({ ...s, [k]: e.target.value }));
  return (
    <Reveal className="shell relative z-20 -mt-2">
      <form onSubmit={go} className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]" aria-label="Quick property search">
        {[
          { k: 'type' as const, label: t('label.type'), opts: (['apartment', 'penthouse', 'villa', 'townhouse'] as const).map((v) => [v, t(`type.${v}`)]) },
          { k: 'location' as const, label: t('label.location'), opts: locations.map((l) => [l, l]) },
          { k: 'minBeds' as const, label: t('label.beds'), opts: [1, 2, 3, 4, 5].map((n) => [String(n), `${n}+`]) },
          { k: 'maxPrice' as const, label: `Max ${t('label.price').toLowerCase()}`, opts: [3e6, 5e6, 10e6, 30e6, 50e6].map((n) => [String(n), money(n, true)]) },
        ].map(({ k, label, opts }) => (
          <div key={k} className="bg-ink-800 px-6 py-4">
            <label htmlFor={`qs-${k}`} className="block text-[9px] font-medium uppercase tracking-wide2 text-gold">{label}</label>
            <select id={`qs-${k}`} value={f[k]} onChange={set(k)} className="mt-1 w-full cursor-pointer appearance-none bg-transparent font-serif text-xl text-ivory focus:outline-none [&>option]:bg-ink-700 [&>option]:font-sans [&>option]:text-sm">
              <option value="">{t('label.any')}</option>
              {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        ))}
        <button type="submit" className="btn-gold h-full min-h-[4.5rem] sm:col-span-2 lg:col-span-1 lg:px-10"><Search size={15} /> {t('cta.search')}</button>
      </form>
    </Reveal>
  );
}

/** Counts each figure up from zero when the band scrolls into view. */
export function Stats({ content }: { content: SiteContent }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
        const raw = el.dataset.count ?? '';
        const match = raw.match(/[\d,.]+/);
        if (!match) return;
        const target = parseFloat(match[0].replace(/,/g, ''));
        const decimals = (match[0].split('.')[1] ?? '').length;
        const state = { v: 0 };
        gsap.to(state, {
          v: target, duration: 2.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          onUpdate: () => { el.textContent = raw.replace(match[0], state.v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })); },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={root} className="grid grid-cols-2 gap-px border-y border-white/[0.07] bg-white/[0.07] lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-ink px-6 py-10 text-center sm:py-14">
          <p className="font-serif text-[clamp(2rem,4vw,3.4rem)] font-light leading-none text-ivory" data-count={content[`stats.${i}.value`]} dir="ltr">{content[`stats.${i}.value`]}</p>
          <p className="mt-4 text-[10px] font-medium uppercase tracking-luxe text-gold">{content[`stats.${i}.label`]}</p>
        </div>
      ))}
    </div>
  );
}

export function ProjectShowcase({ projects }: { projects: Project[] }) {
  const { t, money } = useApp();
  return (
    <div className="space-y-24 lg:space-y-36">
      {projects.map((p, i) => (
        <Reveal key={p.slug} className={`grid items-center gap-10 lg:grid-cols-12 lg:gap-16 ${i % 2 ? 'lg:[direction:rtl]' : ''}`}>
          <Link href={`/projects/${p.slug}`} className="group relative block aspect-[16/11] overflow-hidden lg:col-span-7 [direction:ltr]">
            <Image src={p.images[0]} alt={p.name} fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover transition-transform duration-[1800ms] ease-luxe group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <span className="absolute left-5 top-5 border border-white/20 bg-ink/50 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wide2 backdrop-blur">{p.status}</span>
            <span className="absolute bottom-5 right-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-ink/40 backdrop-blur transition-all duration-500 ease-luxe group-hover:scale-110 group-hover:border-gold group-hover:bg-gold group-hover:text-ink"><ArrowUpRight size={20} strokeWidth={1.2} /></span>
          </Link>
          <div className="lg:col-span-5 [direction:ltr] rtl:[direction:rtl]">
            <p className="font-serif text-7xl font-light leading-none text-white/[0.07]">0{i + 1}</p>
            <p className="eyebrow -mt-3">{p.location} · {p.completion}</p>
            <h3 className="mt-4 font-serif text-[clamp(2rem,3.4vw,3.2rem)] font-light leading-[1.05]">{p.name}</h3>
            <p className="mt-2 font-serif text-xl italic text-ivory/60">{p.tagline}</p>
            <p className="lede mt-6">{p.description}</p>
            <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2.5">
              {p.highlights.map((h) => <li key={h} className="flex items-start gap-2.5 text-xs text-ivory/65"><span className="mt-1.5 h-1 w-1 shrink-0 rotate-45 bg-gold" />{h}</li>)}
            </ul>
            <div className="mt-8 flex items-end justify-between border-t border-white/[0.08] pt-6">
              <div><p className="text-[9px] font-medium uppercase tracking-wide2 text-ivory/40">{t('label.from')}</p><p className="font-serif text-3xl text-gold" dir="ltr">{money(p.startingPrice, true)}</p></div>
              <Link href={`/projects/${p.slug}`} className="btn-outline btn-sm">{t('cta.discover')} <ArrowUpRight size={13} /></Link>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export function CommunityGrid({ communities }: { communities: Community[] }) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
      {communities.map((c, i) => (
        <Reveal key={c.slug} delay={i * 0.08}>
          <Link href={`/communities#${c.slug}`} className="group relative block aspect-[3/4] overflow-hidden">
            <Image src={c.image} alt={c.name} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-[1800ms] ease-luxe group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent transition-opacity duration-700 group-hover:opacity-90" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="eyebrow">0{i + 1}</p>
              <h3 className="mt-2 font-serif text-3xl font-light">{c.name}</h3>
              <p className="mt-2 max-h-0 overflow-hidden text-sm text-ivory/70 opacity-0 transition-all duration-700 ease-luxe group-hover:max-h-24 group-hover:opacity-100">{c.blurb}</p>
              <span className="mt-4 block h-px w-10 bg-gold transition-all duration-700 ease-luxe group-hover:w-full" />
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

/** Translated section heading for use from server components. */
export function THeading({ eyebrow, title, lede, align }: { eyebrow: Key; title: Key; lede?: string; align?: 'left' | 'center' }) {
  const { t } = useApp();
  return <SectionHeading eyebrow={t(eyebrow)} title={t(title)} lede={lede} align={align} />;
}
export function TLink({ href, k, className }: { href: string; k: Key; className: string }) {
  const { t } = useApp();
  return <Link href={href} className={className}>{t(k)} <ArrowUpRight size={14} /></Link>;
}
