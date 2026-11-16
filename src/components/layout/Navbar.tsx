'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Menu, User as UserIcon, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useApp } from '@/components/Providers';
import { EASE } from '@/components/ui/Reveal';
import { CURRENCIES, Currency, Key, LANGS, Lang } from '@/lib/i18n';

const LINKS: { href: string; key: Key }[] = [
  { href: '/properties', key: 'nav.properties' }, { href: '/projects', key: 'nav.projects' }, { href: '/tours', key: 'nav.tours' },
  { href: '/communities', key: 'nav.communities' }, { href: '/about', key: 'nav.about' }, { href: '/contact', key: 'nav.contact' },
];

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`group flex items-center gap-3 ${className}`} aria-label="Aurelia Estates — home">
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" className="text-gold transition-transform duration-700 ease-luxe group-hover:rotate-180">
        <path d="M16 2 30 16 16 30 2 16Z" stroke="currentColor" strokeWidth="1" />
        <path d="M16 8 24 16 16 24 8 16Z" stroke="currentColor" strokeWidth="1" />
        <path d="M16 2v28M2 16h28" stroke="currentColor" strokeWidth=".5" opacity=".5" />
      </svg>
      <span className="leading-none">
        <span className="block font-serif text-[22px] tracking-[0.28em] text-ivory">AURELIA</span>
        <span className="mt-1 block text-[8px] font-medium uppercase tracking-[0.5em] text-gold">Estates</span>
      </span>
    </Link>
  );
}

function Prefs({ className = '' }: { className?: string }) {
  const { lang, setLang, currency, setCurrency } = useApp();
  const cls = 'cursor-pointer appearance-none bg-transparent text-[10px] font-semibold uppercase tracking-wide2 text-ivory/70 transition-colors hover:text-gold focus:outline-none [&>option]:bg-ink-700 [&>option]:text-ivory';
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <select aria-label="Currency" className={cls} value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
        {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <span className="h-3 w-px bg-white/20" />
      <select aria-label="Language" className={cls} value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
        {LANGS.map((l) => <option key={l.code} value={l.code}>{l.code.toUpperCase()}</option>)}
      </select>
    </div>
  );
}

export default function Navbar() {
  const { t, user, wishlist } = useApp();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);

  const account = user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login';
  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-luxe ${scrolled || open ? 'border-b border-white/[0.07] bg-ink/85 py-3 backdrop-blur-xl' : 'border-b border-transparent py-5 lg:py-7'}`}>
        <div className="shell flex items-center justify-between gap-6">
          <Logo />
          <nav className="hidden items-center gap-8 xl:flex" aria-label="Primary">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={`link-underline text-[11px] font-medium uppercase tracking-wide2 rtl:tracking-normal rtl:text-sm transition-colors duration-300 ${pathname.startsWith(l.href) ? 'text-gold' : 'text-ivory/75 hover:text-ivory'}`}>
                {t(l.key)}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4 sm:gap-5">
            <Prefs className="hidden md:flex" />
            <Link href="/properties?saved=1" aria-label={`${t('label.saved')} (${wishlist.length})`} className="relative text-ivory/75 transition-colors hover:text-gold">
              <Heart size={18} strokeWidth={1.4} />
              {wishlist.length > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-ink">{wishlist.length}</span>}
            </Link>
            <Link href={account} aria-label={user ? t('nav.account') : t('nav.login')} className="flex items-center gap-2 text-ivory/75 transition-colors hover:text-gold">
              <UserIcon size={18} strokeWidth={1.4} />
              <span className="hidden max-w-[9rem] truncate text-[10px] font-semibold uppercase tracking-wide2 2xl:block">{user ? user.name.split(' ')[0] : t('nav.login')}</span>
            </Link>
            <Link href="/contact" className="btn-gold btn-sm hidden sm:inline-flex">{t('nav.enquire')}</Link>
            <button type="button" className="text-ivory xl:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
              {open ? <X size={24} strokeWidth={1.2} /> : <Menu size={24} strokeWidth={1.2} />}
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-40 flex flex-col bg-ink px-6 pb-10 pt-28 xl:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} data-lenis-prevent>
            <nav className="flex flex-1 flex-col justify-center gap-1 overflow-y-auto" aria-label="Mobile">
              {[{ href: '/', key: 'nav.home' as Key }, ...LINKS].map((l, i) => (
                <motion.div key={l.href} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i + 0.1, duration: 0.7, ease: EASE }}>
                  <Link href={l.href} className="flex items-baseline gap-4 border-b border-white/[0.06] py-4 font-serif text-4xl font-light text-ivory transition-colors hover:text-gold">
                    <span className="font-sans text-[10px] tracking-wide2 text-gold">0{i + 1}</span>{t(l.key)}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-8 flex items-center justify-between">
              <Prefs />
              <Link href="/contact" className="btn-gold btn-sm">{t('nav.enquire')}</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
