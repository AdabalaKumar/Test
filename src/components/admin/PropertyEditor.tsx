'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { api } from '@/components/Providers';
import type { LayoutKey, Project, Property } from '@/lib/types';
import { Drawer, Field, UploadButton } from './ui';

const blank: Omit<Property, 'id'> = {
  slug: '', title: '', tagline: '', description: '', type: 'apartment', status: 'available', price: 0, location: 'Downtown Dubai', community: 'downtown', projectSlug: '',
  bedrooms: 2, bathrooms: 2, area: 0, featured: false, images: [], modelUrl: null, layout: 'two', floorPlans: [], amenities: [], specs: {}, paymentPlan: [], lat: 25.1972, lng: 55.2744,
};

export default function PropertyEditor({ property, projects, onClose, onSaved }: { property: Property | null; projects: Project[]; onClose: () => void; onSaved: () => void }) {
  const [p, setP] = useState<Omit<Property, 'id'>>(property ?? { ...blank, projectSlug: projects[0]?.slug ?? '' });
  const [amenities, setAmenities] = useState((property?.amenities ?? []).join('\n'));
  const [specs, setSpecs] = useState(Object.entries(property?.specs ?? {}).map(([k, v]) => `${k}: ${v}`).join('\n'));
  const [plan, setPlan] = useState((property?.paymentPlan ?? []).map((s) => `${s.label} | ${s.percent} | ${s.note}`).join('\n'));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof typeof p>(k: K, v: (typeof p)[K]) => setP((s) => ({ ...s, [k]: v }));
  const num = (k: 'price' | 'bedrooms' | 'bathrooms' | 'area' | 'lat' | 'lng') => (e: React.ChangeEvent<HTMLInputElement>) => set(k, Number(e.target.value));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    const body = {
      ...p,
      amenities: amenities.split('\n').map((s) => s.trim()).filter(Boolean),
      specs: Object.fromEntries(specs.split('\n').map((l) => l.split(':')).filter((a) => a.length >= 2).map(([k, ...v]) => [k.trim(), v.join(':').trim()])),
      paymentPlan: plan.split('\n').map((l) => l.split('|').map((s) => s.trim())).filter((a) => a[0]).map(([label, percent, note]) => ({ label, percent: Number(percent) || 0, note: note ?? '' })),
    };
    try {
      await api(property ? `/api/properties/${property.id}` : '/api/properties', { method: property ? 'PUT' : 'POST', json: body });
      onSaved();
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save.'); setBusy(false); }
  }

  return (
    <Drawer title={property ? 'Edit property' : 'New property'} onClose={onClose}>
      <form onSubmit={save} className="space-y-5">
        <Field label="Title"><input className="field" required minLength={3} value={p.title} onChange={(e) => set('title', e.target.value)} /></Field>
        <Field label="Tagline"><input className="field" value={p.tagline} onChange={(e) => set('tagline', e.target.value)} /></Field>
        <Field label="Description"><textarea className="field min-h-[110px]" value={p.description} onChange={(e) => set('description', e.target.value)} /></Field>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Type"><select className="field" value={p.type} onChange={(e) => set('type', e.target.value as Property['type'])}>{['apartment', 'penthouse', 'villa', 'townhouse'].map((v) => <option key={v}>{v}</option>)}</select></Field>
          <Field label="Status"><select className="field" value={p.status} onChange={(e) => set('status', e.target.value as Property['status'])}>{['available', 'reserved', 'sold'].map((v) => <option key={v}>{v}</option>)}</select></Field>
          <Field label="Price (AED)"><input className="field" type="number" min={1} required value={p.price || ''} onChange={num('price')} /></Field>
          <Field label="Bedrooms"><input className="field" type="number" min={0} value={p.bedrooms} onChange={num('bedrooms')} /></Field>
          <Field label="Bathrooms"><input className="field" type="number" min={0} value={p.bathrooms} onChange={num('bathrooms')} /></Field>
          <Field label="Area (sq ft)"><input className="field" type="number" min={0} value={p.area || ''} onChange={num('area')} /></Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Project"><select className="field" value={p.projectSlug} onChange={(e) => { const pr = projects.find((x) => x.slug === e.target.value); setP((s) => ({ ...s, projectSlug: e.target.value, ...(pr ? { location: pr.location, community: pr.community, lat: pr.lat, lng: pr.lng } : {}) })); }}>{projects.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}</select></Field>
          <Field label="Location"><input className="field" value={p.location} onChange={(e) => set('location', e.target.value)} /></Field>
          <Field label="Latitude"><input className="field" type="number" step="any" value={p.lat} onChange={num('lat')} /></Field>
          <Field label="Longitude"><input className="field" type="number" step="any" value={p.lng} onChange={num('lng')} /></Field>
        </div>
        <label className="flex items-center gap-3 text-sm text-ivory/80"><input type="checkbox" className="h-4 w-4 accent-[#c9a96e]" checked={p.featured} onChange={(e) => set('featured', e.target.checked)} /> Featured on the homepage</label>

        <fieldset className="border-t border-white/[0.07] pt-5">
          <legend className="label">Images</legend>
          <div className="mb-3 grid grid-cols-4 gap-2">
            {p.images.map((src, i) => (
              <div key={src + i} className="group relative aspect-[4/3] overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button type="button" aria-label="Remove image" onClick={() => set('images', p.images.filter((_, j) => j !== i))} className="absolute right-1 top-1 bg-ink/80 p-1 text-ivory hover:text-rose-300"><Trash2 size={12} /></button>
                {i === 0 && <span className="absolute bottom-0 left-0 bg-gold px-1.5 py-0.5 text-[8px] font-bold uppercase text-ink">Cover</span>}
              </div>
            ))}
          </div>
          <UploadButton kind="image" accept="image/jpeg,image/png,image/webp,image/avif" multiple label="Upload images" onUploaded={(url) => setP((s) => ({ ...s, images: [...s.images, url] }))} />
        </fieldset>

        <fieldset className="border-t border-white/[0.07] pt-5">
          <legend className="label">3D model</legend>
          <p className="mb-3 text-xs text-ivory/45">{p.modelUrl ? `Custom model: ${p.modelUrl}` : 'Using the procedural model of the selected project. Upload a .glb to replace it on this property.'}</p>
          <div className="flex flex-wrap items-center gap-3">
            <UploadButton kind="model" accept=".glb" label="Upload .glb model" onUploaded={(url) => set('modelUrl', url)} />
            {p.modelUrl && <button type="button" className="btn-ghost text-[10px]" onClick={() => set('modelUrl', null)}>Remove model</button>}
          </div>
          <Field label="Interior layout" className="mt-4"><select className="field" value={p.layout} onChange={(e) => set('layout', e.target.value as LayoutKey)}><option value="one">One bedroom</option><option value="two">Two bedroom</option><option value="three">Three bedroom +</option></select></Field>
        </fieldset>

        <fieldset className="border-t border-white/[0.07] pt-5">
          <legend className="label">Floor plans</legend>
          <ul className="mb-3 space-y-2">
            {p.floorPlans.map((f, i) => (
              <li key={i} className="grid grid-cols-[1fr_7rem_6rem_auto] items-center gap-2">
                <input aria-label="Plan name" className="field py-2" value={f.name} onChange={(e) => set('floorPlans', p.floorPlans.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                <select aria-label="Plan layout" className="field py-2" value={f.layout} onChange={(e) => set('floorPlans', p.floorPlans.map((x, j) => (j === i ? { ...x, layout: e.target.value as LayoutKey } : x)))}><option value="one">1 bed</option><option value="two">2 bed</option><option value="three">3 bed +</option></select>
                <input aria-label="Plan area" className="field py-2" type="number" value={f.area} onChange={(e) => set('floorPlans', p.floorPlans.map((x, j) => (j === i ? { ...x, area: Number(e.target.value) } : x)))} />
                <button type="button" aria-label="Remove plan" onClick={() => set('floorPlans', p.floorPlans.filter((_, j) => j !== i))} className="p-2 text-ivory/50 hover:text-rose-300"><Trash2 size={14} /></button>
                {f.image && <p className="col-span-4 -mt-1 truncate text-[11px] text-gold">Uploaded drawing: {f.image}</p>}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn-outline btn-sm" onClick={() => set('floorPlans', [...p.floorPlans, { name: 'Floor plan', layout: p.layout, area: p.area }])}>Add generated plan</button>
            <UploadButton kind="plan" accept="image/jpeg,image/png,image/webp,application/pdf" label="Upload drawing" onUploaded={(url, name) => setP((s) => ({ ...s, floorPlans: [...s.floorPlans, { name: name.replace(/\.\w+$/, ''), layout: s.layout, area: s.area, image: url }] }))} />
          </div>
        </fieldset>

        <Field label="Amenities" hint="One per line."><textarea className="field min-h-[100px]" value={amenities} onChange={(e) => setAmenities(e.target.value)} /></Field>
        <Field label="Specifications" hint="One per line, as “Label: value”."><textarea className="field min-h-[100px]" value={specs} onChange={(e) => setSpecs(e.target.value)} /></Field>
        <Field label="Payment plan" hint="One step per line, as “Label | percent | note”."><textarea className="field min-h-[90px]" value={plan} onChange={(e) => setPlan(e.target.value)} /></Field>

        {error && <p role="alert" className="border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
        <div className="sticky bottom-0 -mx-6 flex gap-3 border-t border-white/10 bg-ink-800 px-6 py-4 sm:-mx-9 sm:px-9">
          <button type="submit" disabled={busy} className="btn-gold flex-1">{busy ? 'Saving…' : 'Save property'}</button>
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
        </div>
      </form>
    </Drawer>
  );
}
