'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Logo } from '@/components/layout/Navbar';
import { api, useApp } from '@/components/Providers';
import type { User } from '@/lib/types';

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { setUser } = useApp();
  const router = useRouter();
  const next = useSearchParams().get('next');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const register = mode === 'register';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const { user } = await api<{ user: User }>(`/api/auth/${mode}`, { method: 'POST', json: form });
      setUser(user);
      // Only follow same-site relative paths, never an absolute URL supplied in the query string.
      const safeNext = next && /^\/(?!\/)[\w\-/?=&%.]*$/.test(next) ? next : null;
      router.push(safeNext ?? (user.role === 'admin' ? '/admin' : '/dashboard'));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-[100svh] lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image src={register ? '/images/palm-crest-dusk.jpg' : '/images/marina-helix-dusk.jpg'} alt="" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/30 to-ink" />
        <blockquote className="absolute bottom-14 left-14 max-w-md font-serif text-4xl font-light italic leading-tight">“A home is the only investment you get to live inside.”</blockquote>
      </div>
      <div className="flex flex-col justify-center px-6 pb-16 pt-32 sm:px-14 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <Logo className="mb-12 lg:hidden" />
          <p className="eyebrow">{register ? 'Create an account' : 'Welcome back'}</p>
          <h1 className="mt-3 font-serif text-5xl font-light">{register ? 'Join Aurelia' : 'Sign in'}</h1>
          <p className="lede mt-4">{register ? 'Save residences, track your enquiries and manage viewings in one place.' : 'Access your saved residences, enquiries and scheduled viewings.'}</p>
          <form onSubmit={submit} className="mt-10 space-y-4">
            {register && <div><label className="label" htmlFor="au-name">Full name</label><input id="au-name" className="field" required minLength={2} autoComplete="name" value={form.name} onChange={set('name')} /></div>}
            <div><label className="label" htmlFor="au-email">Email</label><input id="au-email" className="field" type="email" required autoComplete="email" value={form.email} onChange={set('email')} /></div>
            {register && <div><label className="label" htmlFor="au-phone">Phone (optional)</label><input id="au-phone" className="field" type="tel" autoComplete="tel" dir="ltr" value={form.phone} onChange={set('phone')} /></div>}
            <div>
              <label className="label" htmlFor="au-pass">Password</label>
              <input id="au-pass" className="field" type="password" required minLength={register ? 8 : 1} autoComplete={register ? 'new-password' : 'current-password'} value={form.password} onChange={set('password')} aria-describedby={register ? 'au-pass-hint' : undefined} />
              {register && <p id="au-pass-hint" className="mt-2 text-[11px] text-ivory/40">At least 8 characters.</p>}
            </div>
            {error && <p role="alert" className="border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
            <button type="submit" disabled={busy} className="btn-gold w-full">{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}</button>
          </form>
          <p className="mt-8 text-sm text-ivory/50">
            {register ? 'Already have an account?' : 'New to Aurelia?'}{' '}
            <Link href={`${register ? '/login' : '/register'}${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="link-underline text-gold">{register ? 'Sign in' : 'Create an account'}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
