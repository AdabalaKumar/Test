'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { api } from '@/components/Providers';
import type { Project } from '@/lib/types';
import { Drawer, Field, UploadButton } from './ui';

const blank: Omit<Project, 'id'> = {
  slug: '', name: '', tagline: '', description: '', location: 'Dubai', community: 'downtown', status: 'Launching', completion: '', startingPrice: 0,
  model: { kind: 'tower', variant: 'slab', floors: 20, accent: '#c9a96e' }, images: [], highlights: [], lat: 25.2048, lng: 55.2708, plot: { x: 0, z: -6 },
};

export default function ProjectEditor({ project, onClose, onSaved }: { project: Project | null; onClose: () => void; onSaved: () => void }) {
  const [p, setP] = useState<Omit<Project, 'id'>>(project ?? blank);
  const [highlights, setHighlights] = useState((project?.highlights ?? []).join('\n'));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof typeof p>(k: K, v: (typeof p)[K]) => setP((s) => ({ ...s, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await api(project ? `/api/projects/${project.id}` : '/api/projects', { method: project ? 'PUT' : 'POST', json: { ...p, highlights: highlights.split('\n').map((s) => s.trim()).filter(Boolean) } });
      onSaved();
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save.'); setBusy(false); }
  }

  return (
    <Drawer title={project ? 'Edit project' : 'New project'} onClose={onClose}>
      <form onSubmit={save} className="space-y-5">
        <Field label="Name"><input className="field" required minLength={3} value={p.name} onChange={(e) => set('name', e.target.value)} /></Field>
        <Field label="Tagline"><input className="field" value={p.tagline} onChange={(e) => set('tagline', e.target.value)} /></Field>
        <Field label="Description"><textarea className="field min-h-[110px]" value={p.description} onChange={(e) => set('description', e.target.value)} /></Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Location"><input className="field" value={p.location} onChange={(e) => set('location', e.target.value)} /></Field>
          <Field label="Status"><select className="field" value={p.status} onChange={(e) => set('status', e.target.value as Project['status'])}>{['Launching', 'Under Construction', 'Ready'].map((v) => <option key={v}>{v}</option>)}</select></Field>
          <Field label="Completion"><input className="field" placeholder="Q4 2028" value={p.completion} onChange={(e) => set('completion', e.target.value)} /></Field>
          <Field label="Starting price (AED)"><input className="field" type="number" min={0} value={p.startingPrice || ''} onChange={(e) => set('startingPrice', Number(e.target.value))} /></Field>
          <Field label="Latitude"><input className="field" type="number" step="any" value={p.lat} onChange={(e) => set('lat', Number(e.target.value))} /></Field>
          <Field label="Longitude"><input className="field" type="number" step="any" value={p.lng} onChange={(e) => set('lng', Number(e.target.value))} /></Field>
        </div>
        <fieldset className="border-t border-white/[0.07] pt-5">
          <legend className="label">3D model</legend>
          <div className="grid gap-5 sm:grid-cols-4">
            <Field label="Kind"><select className="field" value={p.model.kind} onChange={(e) => set('model', { ...p.model, kind: e.target.value as 'tower' | 'villa' })}><option value="tower">Tower</option><option value="villa">Villa</option></select></Field>
            <Field label="Form"><select className="field" disabled={p.model.kind === 'villa'} value={p.model.variant} onChange={(e) => set('model', { ...p.model, variant: e.target.value as 'slab' | 'twist' | 'stepped' })}><option value="slab">Slab</option><option value="twist">Twist</option><option value="stepped">Stepped</option></select></Field>
            <Field label="Floors"><input className="field" type="number" min={6} max={40} disabled={p.model.kind === 'villa'} value={p.model.floors ?? 20} onChange={(e) => set('model', { ...p.model, floors: Number(e.target.value) })} /></Field>
            <Field label="Accent"><input className="field h-[46px] p-1" type="color" value={p.model.accent ?? '#c9a96e'} onChange={(e) => set('model', { ...p.model, accent: e.target.value })} /></Field>
            <Field label="Master plan X" hint="-8 to 8"><input className="field" type="number" step="0.5" min={-8} max={8} value={p.plot.x} onChange={(e) => set('plot', { ...p.plot, x: Number(e.target.value) })} /></Field>
            <Field label="Master plan Z" hint="-8 to 8"><input className="field" type="number" step="0.5" min={-8} max={8} value={p.plot.z} onChange={(e) => set('plot', { ...p.plot, z: Number(e.target.value) })} /></Field>
          </div>
        </fieldset>
        <fieldset className="border-t border-white/[0.07] pt-5">
          <legend className="label">Images</legend>
          <div className="mb-3 grid grid-cols-4 gap-2">
            {p.images.map((src, i) => (
              <div key={src + i} className="relative aspect-[4/3] overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button type="button" aria-label="Remove image" onClick={() => set('images', p.images.filter((_, j) => j !== i))} className="absolute right-1 top-1 bg-ink/80 p-1 hover:text-rose-300"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
          <UploadButton kind="image" accept="image/jpeg,image/png,image/webp,image/avif" multiple label="Upload images" onUploaded={(url) => setP((s) => ({ ...s, images: [...s.images, url] }))} />
        </fieldset>
        <Field label="Highlights" hint="One per line, up to eight."><textarea className="field min-h-[100px]" value={highlights} onChange={(e) => setHighlights(e.target.value)} /></Field>
        {error && <p role="alert" className="border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
        <div className="sticky bottom-0 -mx-6 flex gap-3 border-t border-white/10 bg-ink-800 px-6 py-4 sm:-mx-9 sm:px-9">
          <button type="submit" disabled={busy} className="btn-gold flex-1">{busy ? 'Saving…' : 'Save project'}</button>
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
        </div>
      </form>
    </Drawer>
  );
}
