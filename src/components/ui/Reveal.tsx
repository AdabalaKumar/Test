'use client';

import { motion } from 'framer-motion';

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Fades and lifts its children into place the first time they scroll into view. */
export default function Reveal({ children, delay = 0, y = 28, className, as = 'div' }: { children: React.ReactNode; delay?: number; y?: number; className?: string; as?: 'div' | 'li' | 'section' }) {
  const M = motion[as];
  return (
    <M className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '0px 0px -8% 0px' }} transition={{ duration: 0.9, delay, ease: EASE }}>
      {children}
    </M>
  );
}

export function SectionHeading({ eyebrow, title, lede, align = 'left', className = '' }: { eyebrow: string; title: string; lede?: string; align?: 'left' | 'center'; className?: string }) {
  return (
    <Reveal className={`${align === 'center' ? 'mx-auto text-center' : ''} max-w-3xl ${className}`}>
      <p className="eyebrow mb-5 flex items-center gap-4 rtl:tracking-normal">
        {align === 'left' && <span className="h-px w-10 bg-gold" />}
        {eyebrow}
      </p>
      <h2 className="h-section">{title}</h2>
      {lede && <p className={`lede mt-6 max-w-xl ${align === 'center' ? 'mx-auto' : ''}`}>{lede}</p>}
    </Reveal>
  );
}
