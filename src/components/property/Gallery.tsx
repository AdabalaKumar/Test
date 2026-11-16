'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { imgProps } from './PropertyCard';

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const step = useCallback((d: number) => setOpen((i) => (i == null ? i : (i + d + images.length) % images.length)), [images.length]);
  useEffect(() => {
    if (open == null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open, step]);
  if (!images.length) return null;
  const tiles = images.slice(0, 5);
  return (
    <>
      <div className="grid gap-1.5 md:grid-cols-4 md:grid-rows-2 md:h-[min(72vh,680px)]">
        {tiles.map((src, i) => (
          <button key={src + i} type="button" onClick={() => setOpen(i)} aria-label={`Open image ${i + 1} of ${images.length}`}
            className={`group relative overflow-hidden ${i === 0 ? 'aspect-[16/10] md:col-span-2 md:row-span-2 md:aspect-auto' : 'hidden aspect-[4/3] md:block md:aspect-auto'}`}>
            <Image {...imgProps(src)} alt={`${title} — image ${i + 1}`} fill priority={i === 0} sizes={i === 0 ? '(min-width: 768px) 50vw, 100vw' : '25vw'} className="object-cover transition-transform duration-[1400ms] ease-luxe group-hover:scale-105" />
            <span className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/20" />
            {i === tiles.length - 1 && images.length > tiles.length && <span className="absolute inset-0 flex items-center justify-center bg-ink/60 font-serif text-3xl">+{images.length - tiles.length}</span>}
            {i === 0 && <span className="glass absolute bottom-4 left-4 flex items-center gap-2 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-wide2"><Expand size={12} /> {images.length} images</span>}
          </button>
        ))}
      </div>
      <AnimatePresence>
        {open != null && (
          <motion.div role="dialog" aria-modal="true" aria-label={`${title} gallery`} className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/97 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <AnimatePresence mode="wait">
              <motion.div key={open} className="relative h-[78vh] w-[92vw] max-w-7xl" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} onClick={(e) => e.stopPropagation()}>
                <Image {...imgProps(images[open])} alt={`${title} — image ${open + 1}`} fill sizes="92vw" className="object-contain" />
              </motion.div>
            </AnimatePresence>
            <button type="button" aria-label="Close gallery" className="absolute right-5 top-5 border border-white/15 p-3 hover:border-gold hover:text-gold" onClick={() => setOpen(null)}><X size={18} /></button>
            <button type="button" aria-label="Previous image" className="absolute left-3 top-1/2 -translate-y-1/2 border border-white/15 bg-ink/50 p-3 hover:border-gold hover:text-gold sm:left-6" onClick={(e) => { e.stopPropagation(); step(-1); }}><ChevronLeft size={20} /></button>
            <button type="button" aria-label="Next image" className="absolute right-3 top-1/2 -translate-y-1/2 border border-white/15 bg-ink/50 p-3 hover:border-gold hover:text-gold sm:right-6" onClick={(e) => { e.stopPropagation(); step(1); }}><ChevronRight size={20} /></button>
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] tracking-wide2 text-ivory/60">{String(open + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
