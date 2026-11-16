'use client';

import Link from 'next/link';
import { useApp } from '@/components/Providers';
import type { SiteContent } from '@/lib/types';
import { Logo } from './Navbar';

export default function Footer({ content }: { content: SiteContent }) {
  const { t } = useApp();
  const cols = [
    { title: 'Explore', links: [['/properties', t('nav.properties')], ['/projects', t('nav.projects')], ['/tours', t('nav.tours')], ['/communities', t('nav.communities')]] },
    { title: 'Company', links: [['/about', t('nav.about')], ['/contact', t('nav.contact')], ['/login', t('nav.login')], ['/dashboard', t('nav.account')]] },
  ];
  return (
    <footer className="relative border-t border-white/[0.07] bg-ink-800">
      <div className="shell grid gap-14 py-20 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div>
          <Logo />
          <p className="mt-8 max-w-xs font-serif text-2xl font-light italic leading-snug text-ivory/80">{t('footer.tagline')}</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="eyebrow mb-6">{c.title}</p>
            <ul className="space-y-3.5">
              {c.links.map(([href, label]) => <li key={href}><Link href={href} className="link-underline text-sm text-ivory/60 transition-colors hover:text-ivory">{label}</Link></li>)}
            </ul>
          </div>
        ))}
        <div>
          <p className="eyebrow mb-6">Visit the gallery</p>
          <address className="space-y-3.5 text-sm not-italic leading-relaxed text-ivory/60">
            <p>{content['contact.address']}</p>
            <p><a className="link-underline hover:text-ivory" href={`tel:${content['contact.phone']?.replace(/\s/g, '')}`} dir="ltr">{content['contact.phone']}</a></p>
            <p><a className="link-underline hover:text-ivory" href={`mailto:${content['contact.email']}`}>{content['contact.email']}</a></p>
            <p className="text-ivory/40">{content['contact.hours']}</p>
          </address>
        </div>
      </div>
      <div className="hairline" />
      <div className="shell flex flex-col items-center justify-between gap-3 py-7 text-[11px] text-ivory/35 sm:flex-row">
        <p>© {new Date().getFullYear()} Aurelia Estates. {t('footer.rights')}</p>
        <p>Imagery is rendered from the interactive 3D models and is indicative only.</p>
      </div>
    </footer>
  );
}
