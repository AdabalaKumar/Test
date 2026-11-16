'use client';

import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, useApp } from '@/components/Providers';

interface Props {
  propertyId?: number;
  type?: 'enquiry' | 'viewing' | 'contact' | 'callback';
  allowViewing?: boolean;
  defaultMessage?: string;
  compact?: boolean;
}

export default function EnquiryForm({ propertyId, type = 'enquiry', allowViewing = false, defaultMessage = '', compact = false }: Props) {
  const { t, user } = useApp();
  const [kind, setKind] = useState(type);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: defaultMessage, preferredDate: '', company: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');
  useEffect(() => { setKind(type); }, [type]);
  useEffect(() => { if (user) setForm((f) => ({ ...f, name: f.name || user.name, email: f.email || user.email, phone: f.phone || user.phone })); }, [user]);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('sending'); setError('');
    try {
      await api('/api/enquiries', { method: 'POST', json: { ...form, type: kind, propertyId, preferredDate: kind === 'viewing' ? form.preferredDate : null } });
      setState('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setState('idle');
    }
  }

  if (state === 'done') {
    return (
      <div className="flex flex-col items-center gap-4 border border-gold/30 bg-gold/[0.05] px-6 py-12 text-center" role="status">
        <CheckCircle2 className="text-gold" size={36} strokeWidth={1} />
        <p className="font-serif text-2xl font-light">{t('form.thanks')}</p>
        <button type="button" className="btn-ghost" onClick={() => { setState('idle'); setForm((f) => ({ ...f, message: '', preferredDate: '' })); }}>Send another</button>
      </div>
    );
  }
  const minDate = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
  return (
    <form onSubmit={submit} className="space-y-4" noValidate={false}>
      {allowViewing && (
        <div className="grid grid-cols-2 gap-px bg-white/10" role="tablist">
          {(['enquiry', 'viewing'] as const).map((k) => (
            <button key={k} type="button" role="tab" aria-selected={kind === k} onClick={() => setKind(k)}
              className={`py-3 text-[10px] font-semibold uppercase tracking-wide2 transition-colors ${kind === k ? 'bg-gold text-ink' : 'bg-ink-800 text-ivory/60 hover:text-gold'}`}>
              {k === 'enquiry' ? t('cta.enquire') : t('cta.schedule')}
            </button>
          ))}
        </div>
      )}
      <div className={`grid gap-4 ${compact ? '' : 'sm:grid-cols-2'}`}>
        <div><label className="label" htmlFor="eq-name">{t('form.name')}</label><input id="eq-name" className="field" required minLength={2} autoComplete="name" value={form.name} onChange={set('name')} /></div>
        <div><label className="label" htmlFor="eq-email">{t('form.email')}</label><input id="eq-email" className="field" type="email" required autoComplete="email" value={form.email} onChange={set('email')} /></div>
      </div>
      <div className={`grid gap-4 ${compact || kind !== 'viewing' ? '' : 'sm:grid-cols-2'}`}>
        <div><label className="label" htmlFor="eq-phone">{t('form.phone')}</label><input id="eq-phone" className="field" type="tel" autoComplete="tel" dir="ltr" placeholder="+971" value={form.phone} onChange={set('phone')} /></div>
        {kind === 'viewing' && <div><label className="label" htmlFor="eq-date">{t('form.date')}</label><input id="eq-date" className="field [color-scheme:dark]" type="datetime-local" required min={minDate} value={form.preferredDate} onChange={set('preferredDate')} /></div>}
      </div>
      <div><label className="label" htmlFor="eq-msg">{t('form.message')}</label><textarea id="eq-msg" className="field min-h-[110px] resize-y" maxLength={2000} value={form.message} onChange={set('message')} /></div>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={form.company} onChange={set('company')} />
      {error && <p role="alert" className="border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
      <button type="submit" disabled={state === 'sending'} className="btn-gold w-full">{state === 'sending' ? 'Sending…' : kind === 'viewing' ? t('cta.schedule') : t('cta.send')}</button>
      <p className="text-[11px] leading-relaxed text-ivory/35">By submitting you agree to be contacted about this enquiry. We never share your details.</p>
    </form>
  );
}
