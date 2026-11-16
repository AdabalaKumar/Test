'use client';

import { Loader2, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-ink-800 p-6 sm:p-9" onClick={(e) => e.stopPropagation()}>
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-serif text-3xl font-light">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="border border-white/15 p-2.5 hover:border-gold hover:text-gold"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children, hint, className = '' }: { label: string; children: React.ReactNode; hint?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[11px] text-ivory/35">{hint}</span>}
    </label>
  );
}

/** Uploads one or more files to /api/upload and reports each stored URL. */
export function UploadButton({ kind, accept, multiple, label, onUploaded }: { kind: 'image' | 'model' | 'plan'; accept: string; multiple?: boolean; label: string; onUploaded: (url: string, name: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])];
    e.target.value = '';
    if (!files.length) return;
    setBusy(true); setError('');
    for (const file of files) {
      const body = new FormData();
      body.set('file', file); body.set('kind', kind);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        onUploaded(data.url, file.name);
      } catch (err) { setError(err instanceof Error ? err.message : 'Upload failed'); }
    }
    setBusy(false);
  }
  return (
    <div>
      <label className={`btn-outline btn-sm cursor-pointer ${busy ? 'pointer-events-none opacity-60' : ''}`}>
        {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} {label}
        <input type="file" className="sr-only" accept={accept} multiple={multiple} onChange={onChange} />
      </label>
      {error && <p role="alert" className="mt-2 text-xs text-rose-300">{error}</p>}
    </div>
  );
}

export const Th = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => <th scope="col" className={`whitespace-nowrap px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-wide2 text-ivory/40 ${className}`}>{children}</th>;
export const Td = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => <td className={`px-4 py-3.5 align-middle text-sm ${className}`}>{children}</td>;
export const TableWrap = ({ children }: { children: React.ReactNode }) => <div className="overflow-x-auto border border-white/[0.07]"><table className="w-full min-w-[720px] border-collapse [&_tbody_tr]:border-t [&_tbody_tr]:border-white/[0.06] [&_thead]:bg-ink-800">{children}</table></div>;
export const selectSm = 'cursor-pointer border border-white/10 bg-ink-700 px-2.5 py-1.5 text-xs text-ivory focus:border-gold focus:outline-none';
