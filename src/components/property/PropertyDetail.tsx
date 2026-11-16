'use client';

import { CalendarDays, Check, Heart, MapPin, Scale, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { WhatsAppIcon } from '@/components/layout/WhatsAppFab';
import { whatsappLink } from '@/lib/whatsapp';
import { useApp } from '@/components/Providers';
import { PropertyViewer, ViewerSkeleton } from '@/components/three/Viewer3D';
import LazyMount from '@/components/ui/LazyMount';
import Reveal from '@/components/ui/Reveal';
import type { Project, Property } from '@/lib/types';
import EnquiryForm from './EnquiryForm';
import FloorPlanSvg from './FloorPlanSvg';
import Gallery from './Gallery';
import MortgageCalculator from './MortgageCalculator';
import PropertyCard, { Facts, StatusBadge, imgProps } from './PropertyCard';

const Section = ({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="scroll-mt-36 border-t border-white/[0.07] py-14 lg:py-20">
    <Reveal>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-[clamp(1.8rem,3vw,2.6rem)] font-light">{title}</h2>
    </Reveal>
    <Reveal className="mt-9" delay={0.1}>{children}</Reveal>
  </section>
);

export default function PropertyDetail({ p, project, related, whatsapp, map }: { p: Property; project: Project | null; related: Property[]; whatsapp: string; map: React.ReactNode }) {
  const { t, money, wishlist, toggleWish, compare, toggleCompare } = useApp();
  const [formType, setFormType] = useState<'enquiry' | 'viewing'>('enquiry');
  const [plan, setPlan] = useState(0);
  const [copied, setCopied] = useState(false);
  const saved = wishlist.includes(p.id);
  const sold = p.status === 'sold';
  const nav = [['overview', 'Overview'], ['experience', '3D & tour'], ['plans', 'Floor plans'], ['amenities', 'Amenities'], ['location', 'Location'], ['payment', 'Payment']];
  const toForm = (type: 'enquiry' | 'viewing') => { setFormType(type); document.getElementById('enquire')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: p.title, url: location.href });
      else { await navigator.clipboard.writeText(location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch { /* share sheet dismissed */ }
  };
  const model = project?.model ?? { kind: p.type === 'villa' ? 'villa' as const : 'tower' as const };

  return (
    <>
      <div className="shell pt-28 lg:pt-36">
        <nav aria-label="Breadcrumb" className="mb-6 text-[10px] font-medium uppercase tracking-wide2 text-ivory/40">
          <Link href="/properties" className="hover:text-gold">{t('nav.properties')}</Link> <span className="mx-2">/</span> <span className="text-ivory/70">{p.title}</span>
        </nav>
        <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={p.status} />
              <span className="text-[10px] font-semibold uppercase tracking-wide2 text-gold">{t(`type.${p.type}`)}</span>
              <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide2 text-ivory/50"><MapPin size={12} className="text-gold" />{p.location}</span>
            </div>
            <h1 className="mt-4 font-serif text-[clamp(2.3rem,5vw,4.4rem)] font-light leading-[1.02]">{p.title}</h1>
            <p className="mt-3 font-serif text-xl italic text-ivory/60">{p.tagline}</p>
          </div>
          <div className="flex items-end justify-between gap-8 lg:flex-col lg:items-end lg:gap-4">
            <div className="lg:text-right">
              <p className="text-[9px] font-medium uppercase tracking-wide2 text-ivory/40">{t('label.price')}</p>
              <p className="font-serif text-[clamp(1.9rem,3.2vw,2.8rem)] leading-none text-gold" dir="ltr">{money(p.price)}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => toggleWish(p.id)} aria-pressed={saved} aria-label={t('label.saved')} className={`flex h-11 w-11 items-center justify-center border transition-colors ${saved ? 'border-gold bg-gold text-ink' : 'border-white/15 hover:border-gold hover:text-gold'}`}><Heart size={16} strokeWidth={1.5} fill={saved ? 'currentColor' : 'none'} /></button>
              <button type="button" onClick={() => toggleCompare(p.id)} aria-pressed={compare.includes(p.id)} aria-label={t('cta.compare')} className={`flex h-11 w-11 items-center justify-center border transition-colors ${compare.includes(p.id) ? 'border-gold bg-gold text-ink' : 'border-white/15 hover:border-gold hover:text-gold'}`}><Scale size={16} strokeWidth={1.5} /></button>
              <button type="button" onClick={share} aria-label="Share" className="flex h-11 w-11 items-center justify-center border border-white/15 transition-colors hover:border-gold hover:text-gold">{copied ? <Check size={16} /> : <Share2 size={16} strokeWidth={1.5} />}</button>
            </div>
          </div>
        </div>
        <Gallery images={p.images} title={p.title} />
      </div>

      <div className="sticky top-[60px] z-30 mt-10 border-y border-white/[0.07] bg-ink/90 backdrop-blur-xl">
        <nav aria-label="Sections" className="shell flex gap-7 overflow-x-auto py-4 [scrollbar-width:none]">
          {nav.map(([id, label]) => <a key={id} href={`#${id}`} className="link-underline shrink-0 text-[10px] font-semibold uppercase tracking-wide2 text-ivory/55 hover:text-gold">{label}</a>)}
        </nav>
      </div>

      <div className="shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
        <div className="min-w-0">
          <section id="overview" className="scroll-mt-36 py-14 lg:py-20">
            <Reveal>
              <Facts p={p} className="!gap-x-8 !text-sm" />
              <p className="mt-8 font-serif text-[clamp(1.35rem,2.1vw,1.8rem)] font-light leading-relaxed text-ivory/90">{p.description}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <dl className="mt-12 grid grid-cols-2 gap-px bg-white/[0.07] sm:grid-cols-4">
                {Object.entries(p.specs).map(([k, v]) => (
                  <div key={k} className="bg-ink px-5 py-5"><dt className="text-[9px] font-medium uppercase tracking-wide2 text-ivory/40">{k}</dt><dd className="mt-2 font-serif text-lg leading-snug">{v}</dd></div>
                ))}
              </dl>
            </Reveal>
          </section>

          <Section id="experience" eyebrow="Interactive 3D" title="Explore the building, then step inside">
            <LazyMount className="h-[70svh] min-h-[540px] border border-white/[0.07] lg:h-[76svh]" placeholder={<ViewerSkeleton />}>
              <PropertyViewer model={model} projectSlug={p.projectSlug} projectName={project?.name ?? p.title} layout={p.layout} modelUrl={p.modelUrl} enquiryHref="/contact" />
            </LazyMount>
            <p className="mt-4 text-xs text-ivory/40">Switch to Interior for the virtual tour: select a hotspot or press “Guided tour” to move room by room.</p>
          </Section>

          <Section id="plans" eyebrow="Floor plans" title="Measured, to the centimetre">
            {p.floorPlans.length > 1 && (
              <div className="mb-5 flex flex-wrap gap-1.5" role="tablist">
                {p.floorPlans.map((f, i) => <button key={f.name} type="button" role="tab" aria-selected={plan === i} onClick={() => setPlan(i)} className={`chip ${plan === i ? 'chip-active' : 'hover:border-gold hover:text-gold'}`}>{f.name}</button>)}
              </div>
            )}
            {p.floorPlans[plan] && (
              <figure className="border border-white/[0.07] bg-ink-800">
                {p.floorPlans[plan].image
                  // eslint-disable-next-line @next/next/no-img-element
                  ? (p.floorPlans[plan].image!.endsWith('.pdf') ? <a className="btn-outline m-8" href={p.floorPlans[plan].image} target="_blank" rel="noopener noreferrer">Open floor plan (PDF)</a> : <img {...imgProps(p.floorPlans[plan].image!)} alt={`${p.floorPlans[plan].name} floor plan`} className="w-full" />)
                  : <FloorPlanSvg layout={p.floorPlans[plan].layout} className="w-full font-sans" />}
                <figcaption className="flex items-center justify-between border-t border-white/[0.07] px-6 py-4 text-xs text-ivory/55">
                  <span>{p.floorPlans[plan].name}</span><span className="font-serif text-lg text-gold">{p.floorPlans[plan].area.toLocaleString('en-US')} {t('label.area')}</span>
                </figcaption>
              </figure>
            )}
          </Section>

          <Section id="amenities" eyebrow="Amenities" title="Everything, already considered">
            <ul className="grid gap-x-10 sm:grid-cols-2">
              {p.amenities.map((a) => <li key={a} className="flex items-center gap-4 border-b border-white/[0.06] py-4 text-sm text-ivory/80"><span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" />{a}</li>)}
            </ul>
          </Section>

          <Section id="location" eyebrow={t('label.location')} title={p.location}>{map}</Section>

          <Section id="payment" eyebrow="Payment plan" title="Structured around you">
            <ol className="grid gap-px bg-white/[0.07] sm:grid-cols-3">
              {p.paymentPlan.map((s, i) => (
                <li key={s.label} className="relative bg-ink px-6 py-8">
                  <span className="text-[10px] font-semibold tracking-wide2 text-ivory/35">0{i + 1}</span>
                  <p className="mt-3 font-serif text-5xl font-light text-gold">{s.percent}%</p>
                  <p className="mt-3 font-serif text-xl">{s.label}</p>
                  <p className="mt-2 text-xs leading-relaxed text-ivory/50">{s.note}</p>
                  <p className="mt-4 text-sm text-ivory/80" dir="ltr">{money(p.price * s.percent / 100)}</p>
                </li>
              ))}
            </ol>
            <h3 className="mb-6 mt-14 font-serif text-2xl font-light">Mortgage estimate</h3>
            <MortgageCalculator price={p.price} fixedPrice />
          </Section>
        </div>

        <aside className="lg:py-20">
          <div id="enquire" className="card sticky top-32 scroll-mt-32 p-7">
            <p className="eyebrow">{sold ? 'Sold' : 'Private appointment'}</p>
            <h2 className="mt-2 font-serif text-3xl font-light">{sold ? 'Ask about similar homes' : 'Enquire about this residence'}</h2>
            <div className="mt-6"><EnquiryForm propertyId={p.id} type={formType} allowViewing={!sold} compact defaultMessage={`I am interested in ${p.title}.`} /></div>
            <div className="mt-5 grid gap-2">
              {!sold && <button type="button" onClick={() => toForm('viewing')} className="btn-outline w-full"><CalendarDays size={14} /> {t('cta.schedule')}</button>}
              <a href={whatsappLink(whatsapp, `Hello, I am interested in ${p.title} (${p.location}).`)} target="_blank" rel="noopener noreferrer" className="btn w-full border border-[#1f8f5f]/60 text-[#5fd3a0] hover:bg-[#1f8f5f] hover:text-white"><WhatsAppIcon size={15} /> {t('cta.whatsapp')}</a>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="border-t border-white/[0.07] bg-ink-800 py-20 lg:py-28">
          <div className="shell">
            <p className="eyebrow">You may also like</p>
            <h2 className="mt-3 font-serif text-[clamp(1.8rem,3vw,2.6rem)] font-light">Similar residences</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{related.map((r) => <PropertyCard key={r.id} p={r} />)}</div>
          </div>
        </section>
      )}

      {/* Mobile action bar */}
      <div className="glass fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 px-4 py-3 lg:hidden">
        <p className="flex-1 font-serif text-xl text-gold" dir="ltr">{money(p.price, true)}</p>
        <button type="button" onClick={() => toForm(sold ? 'enquiry' : 'viewing')} className="btn-gold btn-sm">{sold ? t('cta.enquire') : t('cta.schedule')}</button>
      </div>
    </>
  );
}
