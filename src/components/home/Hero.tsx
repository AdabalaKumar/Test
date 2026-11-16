'use client';

import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Box, MapPin, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/components/Providers';
import { HeroScene } from '@/components/three/Viewer3D';
import LazyMount from '@/components/ui/LazyMount';
import { EASE } from '@/components/ui/Reveal';
import { formatNumber } from '@/lib/i18n';
import type { ModelConfig, Property, SiteContent } from '@/lib/types';

export interface HeroSlide { property: Property; model: ModelConfig; project: string }
const DURATION = 11000;

export default function Hero({ slides, content }: { slides: HeroSlide[]; content: SiteContent }) {
  const { t, money, lang } = useApp();
  const [index, setIndex] = useState(0);
  const root = useRef<HTMLElement>(null);
  const slide = slides[index];

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % slides.length), DURATION);
    return () => clearTimeout(id);
  }, [index, slides.length]);

  // Scroll-linked exit: copy drifts up and fades while the model recedes.
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 };
      gsap.to('[data-hero-copy]', { yPercent: -18, opacity: 0, ease: 'none', scrollTrigger: st });
      gsap.to('[data-hero-stage]', { yPercent: 10, scale: 0.94, opacity: 0.25, ease: 'none', scrollTrigger: st });
    }, root);
    return () => ctx.revert();
  }, []);

  const headline = lang === 'en' ? content['hero.headline'] : { ar: 'عمارة لحياة غير اعتيادية', fr: 'Une architecture pour une vie hors du commun' }[lang];
  const words = (headline ?? '').split(' ');

  return (
    <section ref={root} className="grain relative flex min-h-[100svh] flex-col overflow-hidden bg-ink">
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_68%_48%,rgba(201,169,110,.16),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(40%_40%_at_70%_70%,rgba(120,140,200,.08),transparent_70%)]" />

      {/* 3D stage */}
      <div data-hero-stage className="absolute inset-0 opacity-55 lg:left-[30%] lg:opacity-100">
        <LazyMount className="h-full w-full" margin="0px">{slide && <HeroScene model={slide.model} />}</LazyMount>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-transparent lg:via-ink/35 rtl:bg-gradient-to-l" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ink to-transparent" />

      {/* Copy */}
      <div data-hero-copy className="shell pointer-events-none relative z-10 flex flex-1 flex-col justify-center pb-40 pt-36">
        <motion.p className="eyebrow flex items-center gap-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.3, ease: EASE }}>
          <span className="h-px w-12 bg-gold" />{content['hero.eyebrow']}
        </motion.p>
        <h1 className="display mt-7 max-w-[13ch]">
          {words.map((w, i) => (
            <span key={`${lang}-${i}`} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
              <motion.span className={`inline-block ${i === words.length - 2 || i === words.length - 1 ? 'italic text-gold' : ''}`} initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1.2, delay: 0.45 + i * 0.09, ease: EASE }}>
                {w}&nbsp;
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p className="lede mt-7 max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.1, ease: EASE }}>{content['hero.sub']}</motion.p>
        <motion.div className="pointer-events-auto mt-10 flex flex-wrap gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.3, ease: EASE }}>
          <Link href="/properties" className="btn-gold"><Search size={14} /> {t('cta.search')}</Link>
          <Link href="/tours" className="btn-outline bg-ink/30 backdrop-blur"><Box size={14} /> {t('cta.explore3d')}</Link>
        </motion.div>
      </div>

      {/* Floating property information */}
      {slide && (
        <AnimatePresence mode="wait">
          <motion.div key={slide.property.id} className="pointer-events-none absolute inset-0 z-10 hidden lg:block" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <motion.div className="glass absolute right-[7%] top-[24%] animate-floaty px-5 py-4" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.4, duration: 0.9, ease: EASE }}>
              <p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-wide2 text-ivory/50"><MapPin size={11} className="text-gold" />{t('label.location')}</p>
              <p className="mt-1.5 font-serif text-xl">{slide.property.location}</p>
            </motion.div>
            <motion.div className="glass absolute right-[4%] top-[50%] animate-floaty px-5 py-4 [animation-delay:-2s]" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.7, duration: 0.9, ease: EASE }}>
              <p className="text-[9px] font-semibold uppercase tracking-wide2 text-ivory/50">{t('label.price')}</p>
              <p className="mt-1.5 font-serif text-2xl text-gold" dir="ltr">{money(slide.property.price, true)}</p>
            </motion.div>
            <motion.div className="glass absolute left-[46%] top-[66%] animate-floaty px-5 py-4 [animation-delay:-4s]" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 2, duration: 0.9, ease: EASE }}>
              <p className="text-[9px] font-semibold uppercase tracking-wide2 text-ivory/50">{t(`type.${slide.property.type}`)}</p>
              <p className="mt-1.5 text-sm text-ivory/90">{slide.property.bedrooms} {t('label.beds')} · {formatNumber(slide.property.area)} {t('label.area')}</p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Slide rail */}
      <div className="shell absolute inset-x-0 bottom-0 z-10 pb-8">
        <div className="flex flex-col gap-5 border-t border-white/10 pt-6 lg:flex-row lg:items-end lg:justify-between">
          {slide && (
            <AnimatePresence mode="wait">
              <motion.div key={slide.property.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.6, ease: EASE }}>
                <p className="text-[10px] font-medium uppercase tracking-wide2 text-ivory/45">{slide.project} · <span dir="ltr">{money(slide.property.price, true)}</span></p>
                <Link href={`/properties/${slide.property.slug}`} className="group mt-1.5 flex items-center gap-3 font-serif text-2xl font-light hover:text-gold sm:text-3xl">
                  {slide.property.title}<ArrowRight size={18} strokeWidth={1.2} className="transition-transform duration-500 group-hover:translate-x-1.5 rtl:rotate-180" />
                </Link>
              </motion.div>
            </AnimatePresence>
          )}
          <div className="flex items-center gap-3" role="tablist" aria-label="Featured residences">
            {slides.map((s, i) => (
              <button key={s.property.id} type="button" role="tab" aria-selected={i === index} aria-label={s.property.title} onClick={() => setIndex(i)} className="group flex items-center gap-3 py-2">
                <span className={`text-[10px] font-semibold tracking-wide2 transition-colors ${i === index ? 'text-gold' : 'text-ivory/40 group-hover:text-ivory'}`}>0{i + 1}</span>
                <span className={`relative h-px overflow-hidden bg-white/20 transition-all duration-700 ease-luxe ${i === index ? 'w-16 sm:w-24' : 'w-6'}`}>
                  {i === index && <motion.span key={index} className="absolute inset-y-0 left-0 bg-gold rtl:left-auto rtl:right-0" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: DURATION / 1000, ease: 'linear' }} />}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
