'use client';

import { CalendarDays, Heart, LogOut, MessageSquare, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, useApp } from '@/components/Providers';
import PropertyCard from '@/components/property/PropertyCard';
import type { Enquiry, Property, User } from '@/lib/types';

const LEAD_LABEL: Record<string, string> = { new: 'Received', contacted: 'In contact', qualified: 'In progress', viewing: 'Viewing booked', won: 'Completed', lost: 'Closed' };
export const fmtDate = (s: string) => new Date(s.includes('T') ? s : s.replace(' ', 'T') + 'Z').toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function DashboardClient({ user: initial, properties, enquiries }: { user: User; properties: Property[]; enquiries: Enquiry[] }) {
  const { wishlist, setUser } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState<'overview' | 'saved' | 'enquiries' | 'profile'>('overview');
  const [user, setLocal] = useState(initial);
  const [profile, setProfile] = useState({ name: initial.name, phone: initial.phone });
  const [savedMsg, setSavedMsg] = useState('');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const saved = properties.filter((p) => wishlist.includes(p.id));
  const viewings = enquiries.filter((e) => e.type === 'viewing');
  const logout = async () => { await api('/api/auth/logout', { method: 'POST' }); setUser(null); router.push('/'); router.refresh(); };
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await api<{ user: User }>('/api/auth/me', { method: 'PATCH', json: profile });
      setLocal(r.user); setUser(r.user); setSavedMsg('Profile updated.');
    } catch (err) { setSavedMsg(err instanceof Error ? err.message : 'Could not save.'); }
  };
  const tabs = [['overview', 'Overview', UserRound], ['saved', `Saved (${saved.length})`, Heart], ['enquiries', `Enquiries (${enquiries.length})`, MessageSquare], ['profile', 'Profile', UserRound]] as const;

  const EnquiryList = ({ items }: { items: Enquiry[] }) => items.length === 0 ? <p className="py-10 text-sm text-ivory/45">Nothing here yet.</p> : (
    <ul className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
      {items.map((e) => (
        <li key={e.id} className="grid gap-3 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-wide2 text-gold">
              {e.type === 'viewing' ? <CalendarDays size={13} /> : <MessageSquare size={13} />}{e.type}
              <span className="text-ivory/35">{mounted ? fmtDate(e.createdAt) : ''}</span>
            </p>
            <p className="mt-2 font-serif text-2xl font-light">{e.propertyTitle ?? 'General enquiry'}</p>
            {e.preferredDate && <p className="mt-1 text-sm text-ivory/70">Requested viewing: {mounted ? fmtDate(e.preferredDate) : ''}</p>}
            {e.message && <p className="mt-1 max-w-2xl text-sm text-ivory/45">{e.message}</p>}
          </div>
          <span className="chip chip-active self-start sm:self-center">{LEAD_LABEL[e.status] ?? e.status}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="shell pb-24 pt-32 lg:pt-40">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="mt-3 font-serif text-[clamp(2.2rem,4.5vw,3.8rem)] font-light leading-none">Welcome, {user.name.split(' ')[0]}</h1>
        </div>
        <button type="button" onClick={logout} className="btn-outline btn-sm self-start"><LogOut size={13} /> Sign out</button>
      </div>
      <div className="mt-10 flex gap-px overflow-x-auto bg-white/[0.07] [scrollbar-width:none]" role="tablist">
        {tabs.map(([k, label, Icon]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`flex shrink-0 items-center gap-2 px-6 py-4 text-[10px] font-semibold uppercase tracking-wide2 transition-colors ${tab === k ? 'bg-gold text-ink' : 'bg-ink text-ivory/60 hover:text-gold'}`}><Icon size={13} />{label}</button>
        ))}
      </div>

      <div className="mt-10" role="tabpanel">
        {tab === 'overview' && (
          <>
            <div className="grid gap-px bg-white/[0.07] sm:grid-cols-3">
              {[['Saved residences', saved.length, 'saved'], ['Enquiries', enquiries.length, 'enquiries'], ['Viewings', viewings.length, 'enquiries']].map(([l, n, to]) => (
                <button key={l as string} type="button" onClick={() => setTab(to as typeof tab)} className="bg-ink p-8 text-left transition-colors hover:bg-ink-800">
                  <p className="font-serif text-6xl font-light text-gold">{n}</p><p className="mt-3 text-[10px] font-medium uppercase tracking-wide2 text-ivory/50">{l}</p>
                </button>
              ))}
            </div>
            <h2 className="mb-2 mt-14 font-serif text-3xl font-light">Upcoming viewings</h2>
            <EnquiryList items={viewings} />
            <Link href="/properties" className="btn-gold mt-10">Browse residences</Link>
          </>
        )}
        {tab === 'saved' && (saved.length
          ? <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{saved.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
          : <div className="py-16 text-center"><p className="font-serif text-3xl font-light">No saved residences yet</p><p className="mt-3 text-sm text-ivory/50">Tap the heart on any residence to keep it here.</p><Link href="/properties" className="btn-outline btn-sm mt-8">Browse residences</Link></div>)}
        {tab === 'enquiries' && <EnquiryList items={enquiries} />}
        {tab === 'profile' && (
          <form onSubmit={saveProfile} className="max-w-lg space-y-4">
            <div><label className="label" htmlFor="pf-name">Full name</label><input id="pf-name" className="field" required minLength={2} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
            <div><label className="label" htmlFor="pf-email">Email</label><input id="pf-email" className="field opacity-60" value={user.email} disabled /></div>
            <div><label className="label" htmlFor="pf-phone">Phone</label><input id="pf-phone" className="field" type="tel" dir="ltr" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
            <button type="submit" className="btn-gold">Save changes</button>
            {savedMsg && <p role="status" className="text-sm text-ivory/60">{savedMsg}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
