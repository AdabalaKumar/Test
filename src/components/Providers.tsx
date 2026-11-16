'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Currency, Key, Lang, LANGS, formatMoney, translate } from '@/lib/i18n';
import type { User } from '@/lib/types';

interface AppState {
  lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string;
  currency: Currency; setCurrency: (c: Currency) => void; money: (aed: number, compact?: boolean) => string;
  user: User | null; userLoaded: boolean; setUser: (u: User | null) => void;
  wishlist: number[]; toggleWish: (id: number) => void;
  compare: number[]; toggleCompare: (id: number) => void; clearCompare: () => void;
}
const Ctx = createContext<AppState | null>(null);
export const useApp = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside <Providers>');
  return v;
};

const read = <T,>(key: string, fallback: T): T => {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
};
const write = (key: string, value: unknown) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ } };

export async function api<T = unknown>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.json !== undefined ? { 'Content-Type': 'application/json', ...init?.headers } : init?.headers,
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Request failed');
  return data as T;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  const [currency, setCurrencyState] = useState<Currency>('AED');
  const [user, setUserState] = useState<User | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [compare, setCompare] = useState<number[]>([]);

  useEffect(() => {
    setLangState(read<Lang>('aurelia.lang', 'en'));
    setCurrencyState(read<Currency>('aurelia.currency', 'AED'));
    setWishlist(read<number[]>('aurelia.wishlist', []));
    setCompare(read<number[]>('aurelia.compare', []));
    api<{ user: User | null }>('/api/auth/me').then((r) => setUserState(r.user)).catch(() => {}).finally(() => setUserLoaded(true));
  }, []);

  // Signed-in visitors keep their wishlist on the server; anything saved as a guest is merged in on sign-in.
  useEffect(() => {
    if (!user) return;
    const local = read<number[]>('aurelia.wishlist', []);
    (async () => {
      let ids = (await api<{ ids: number[] }>('/api/wishlist')).ids;
      for (const id of local.filter((i) => !ids.includes(i))) ids = (await api<{ ids: number[] }>('/api/wishlist', { method: 'POST', json: { propertyId: id } }).catch(() => ({ ids }))).ids;
      setWishlist(ids);
      write('aurelia.wishlist', ids);
    })().catch(() => {});
  }, [user]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = LANGS.find((l) => l.code === lang)?.dir ?? 'ltr';
  }, [lang]);

  const toggleWish = useCallback((id: number) => {
    setWishlist((prev) => {
      const has = prev.includes(id);
      const next = has ? prev.filter((i) => i !== id) : [id, ...prev];
      write('aurelia.wishlist', next);
      if (user) (has ? api(`/api/wishlist?propertyId=${id}`, { method: 'DELETE' }) : api('/api/wishlist', { method: 'POST', json: { propertyId: id } })).catch(() => {});
      return next;
    });
  }, [user]);
  const toggleCompare = useCallback((id: number) => {
    setCompare((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id].slice(-3);
      write('aurelia.compare', next);
      return next;
    });
  }, []);

  const value = useMemo<AppState>(() => ({
    lang, setLang: (l) => { setLangState(l); write('aurelia.lang', l); }, t: (k) => translate(lang, k),
    currency, setCurrency: (c) => { setCurrencyState(c); write('aurelia.currency', c); }, money: (aed, compact) => formatMoney(aed, currency, lang, compact),
    user, userLoaded, setUser: (u) => { setUserState(u); if (!u) { setWishlist([]); write('aurelia.wishlist', []); } },
    wishlist, toggleWish, compare, toggleCompare, clearCompare: () => { setCompare([]); write('aurelia.compare', []); },
  }), [lang, currency, user, userLoaded, wishlist, compare, toggleWish, toggleCompare]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
