'use client';

import { Center, useGLTF } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, ChevronLeft, ChevronRight, Expand, Layers, Minus, Moon, Pause, Play, Plus, RotateCcw, Sofa, Sun, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { api, useApp } from '@/components/Providers';
import { LAYOUTS, roomAreaSqft, type Room } from '@/lib/layouts';
import { formatNumber } from '@/lib/i18n';
import type { LayoutKey, ModelConfig, PropertyStatus, Unit } from '@/lib/types';
import { STATUS_COLOR } from './common';
import { AnchorItem, AnchorLayer, AnchorProjector, useViewerChrome } from './Anchors';
import Interior, { roomAnchor } from './Interior';
import { CameraRig, Exterior, SceneCanvas, View, defaultView } from './Stage';
import { FLOOR_H, towerHeight } from './Tower';
import { VILLA_LEVELS } from './Villa';

interface Props {
  model: ModelConfig;
  projectSlug: string;
  projectName: string;
  layout?: LayoutKey;
  modelUrl?: string | null;
  initialMode?: 'exterior' | 'interior';
  enquiryHref?: string;
}

function UploadedModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const scale = useMemo(() => {
    scene.updateMatrixWorld(true);
    const size = new THREE.Box3().setFromObject(scene).getSize(new THREE.Vector3());
    return 8 / Math.max(size.x, size.y, size.z, 0.001);
  }, [scene]);
  return <Center top scale={scale}><primitive object={scene} /></Center>;
}

const INTERIOR_HOME: View = { position: [5.4, 7.8, 7.8], target: [0, 0, 0.2] };

const IconBtn = ({ label, active, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button" aria-label={label} title={label} aria-pressed={active} onClick={onClick}
    className={`flex h-10 w-10 items-center justify-center border backdrop-blur-xl transition-colors duration-300 ${active ? 'border-gold bg-gold text-ink' : 'border-white/10 bg-ink-900/60 text-ivory/80 hover:border-gold hover:text-gold'}`}
  >
    {children}
  </button>
);

export default function PropertyViewer({ model, projectSlug, projectName, layout = 'two', modelUrl, initialMode = 'exterior', enquiryHref = '/contact' }: Props) {
  const { t, money } = useApp();
  const { ref: wrap, wide } = useViewerChrome();
  const els = useRef<Record<string, HTMLElement | null>>({});
  const rig = useRef<{ dolly: (f: number) => void } | null>(null);
  const [mode, setMode] = useState<'exterior' | 'interior'>(initialMode);
  const [night, setNight] = useState(true);
  const [availability, setAvailability] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [floor, setFloor] = useState<number | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [touring, setTouring] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [panel, setPanel] = useState(true);

  const isTower = model.kind === 'tower' && !modelUrl;
  const floors = model.floors ?? 22;
  const L = LAYOUTS[layout];

  useEffect(() => {
    if (!isTower) return;
    api<{ items: Unit[] }>(`/api/units?project=${encodeURIComponent(projectSlug)}`).then((r) => setUnits(r.items)).catch(() => setUnits([]));
  }, [projectSlug, isTower]);

  // Guided tour: step through the rooms on a timer.
  useEffect(() => {
    if (!touring || mode !== 'interior') return;
    const id = setInterval(() => setRoom((r) => L.rooms[(L.rooms.findIndex((x) => x.id === r?.id) + 1) % L.rooms.length]), 4200);
    return () => clearInterval(id);
  }, [touring, mode, L]);

  const view = useMemo<View>(() => {
    if (mode === 'interior') {
      if (!room) return INTERIOR_HOME;
      const [cx, , cz] = roomAnchor(L, room);
      return { position: [cx + 3.2, 5.4, cz + 5.4], target: [cx, 0.2, cz] };
    }
    const base = defaultView(model);
    if (floor == null) return { position: [base.position[0] + resetKey * 1e-6, base.position[1], base.position[2]], target: base.target };
    if (!isTower) return { position: [8.5, 4.6 + floor * 1.2, 11], target: [0, 1 + floor * 1.1, 0.4] };
    const y = 0.9 + floor * FLOOR_H;
    const h = towerHeight(floors);
    return { position: [h * 0.5 + 5.5, y + 5.2, h * 0.6 + 6.5], target: [0, y + 0.2, 0] };
  }, [mode, room, floor, model, isTower, floors, L, resetKey]);

  const counts = useMemo(() => {
    const c: Record<PropertyStatus, number> = { available: 0, reserved: 0, sold: 0 };
    units.forEach((u) => c[u.status]++);
    return c;
  }, [units]);
  const anchors = useMemo(() => L.rooms.map((r) => ({ id: r.id, position: roomAnchor(L, r) })), [L]);
  const floorUnits = useMemo(() => units.filter((u) => u.floor === floor), [units, floor]);

  const reset = () => { setFloor(null); setUnit(null); setRoom(null); setTouring(false); setResetKey((k) => k + 1); };
  const switchMode = (m: 'exterior' | 'interior') => { setMode(m); setFloor(null); setUnit(null); setRoom(null); setTouring(false); };
  const stepRoom = (dir: 1 | -1) => setRoom((r) => L.rooms[(L.rooms.findIndex((x) => x.id === r?.id) + dir + L.rooms.length) % L.rooms.length]);
  const levels = isTower ? floors : modelUrl ? 0 : VILLA_LEVELS.length;

  return (
    <div ref={wrap} className="relative h-full min-h-[520px] w-full overflow-hidden bg-ink-900">
      <div className="canvas-wrap absolute inset-0">
        <SceneCanvas night={night}>
          {mode === 'exterior' ? (
            modelUrl ? <UploadedModel url={modelUrl} /> : (
              <Exterior
                model={model} night={night} units={units} interactive selectedFloor={floor} selectedUnit={unit?.id ?? null} showAvailability={availability}
                onSelectUnit={(u) => { setFloor(u.floor); setUnit(u); setPanel(true); }} onSelectLevel={(l) => { setFloor((f) => (f === l ? null : l)); setPanel(true); }}
              />
            )
          ) : (
            <>
              <Interior layout={layout} night={night} />
              <AnchorProjector anchors={anchors} els={els} />
            </>
          )}
          <CameraRig view={view} apiRef={rig} autoRotate={mode === 'exterior' && floor == null && !unit} minDistance={mode === 'interior' ? 3 : 6} maxDistance={mode === 'interior' ? 22 : 48} shift={panel && wide ? 170 : 0} shiftY={panel && !wide ? 0.17 : 0} />
        </SceneCanvas>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(13,13,15,.55))]" />

      {mode === 'interior' && (
        <AnchorLayer>
          {L.rooms.map((r) => (
            <AnchorItem key={r.id} id={r.id} els={els}>
              <button type="button" onClick={() => { setRoom(r); setTouring(false); setPanel(true); }} aria-label={`View ${r.name}`} aria-pressed={room?.id === r.id} className="group relative flex h-7 w-7 items-center justify-center">
                <span className="absolute h-4 w-4 animate-pulseRing rounded-full bg-gold/60" />
                <span className={`relative h-2.5 w-2.5 rounded-full border border-white/80 transition-transform duration-300 group-hover:scale-150 ${room?.id === r.id ? 'scale-150 bg-white' : 'bg-gold'}`} />
                <span className={`pointer-events-none absolute left-full ml-1 whitespace-nowrap border border-white/15 bg-ink-900/85 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide2 backdrop-blur transition-opacity duration-300 ${room?.id === r.id ? 'text-gold opacity-100' : 'text-ivory opacity-0 group-hover:opacity-100'}`}>{r.name}</span>
              </button>
            </AnchorItem>
          ))}
        </AnchorLayer>
      )}

      {/* Mode switch */}
      <div className="absolute left-4 top-4 z-10 flex border border-white/10 bg-ink-900/60 backdrop-blur-xl sm:left-6 sm:top-6">
        {([['exterior', Building2, t('viewer.exterior')], ['interior', Sofa, t('viewer.interior')]] as const).map(([m, Icon, label]) => (
          <button key={m} type="button" onClick={() => switchMode(m)} aria-pressed={mode === m}
            className={`flex items-center gap-2 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide2 transition-colors duration-300 ${mode === m ? 'bg-gold text-ink' : 'text-ivory/70 hover:text-gold'}`}>
            <Icon size={14} strokeWidth={1.6} /> {label}
          </button>
        ))}
      </div>

      {/* Tools */}
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2 sm:right-6 sm:top-6">
        <IconBtn label={night ? t('viewer.day') : t('viewer.night')} onClick={() => setNight((n) => !n)}>{night ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}</IconBtn>
        {isTower && mode === 'exterior' && <IconBtn label={t('viewer.availability')} active={availability} onClick={() => setAvailability((a) => !a)}><Layers size={16} strokeWidth={1.5} /></IconBtn>}
        <IconBtn label="Zoom in" onClick={() => rig.current?.dolly(0.75)}><Plus size={16} strokeWidth={1.5} /></IconBtn>
        <IconBtn label="Zoom out" onClick={() => rig.current?.dolly(1.3)}><Minus size={16} strokeWidth={1.5} /></IconBtn>
        <IconBtn label="Reset view" onClick={reset}><RotateCcw size={15} strokeWidth={1.5} /></IconBtn>
        <IconBtn label="Fullscreen" onClick={() => (document.fullscreenElement ? document.exitFullscreen() : wrap.current?.requestFullscreen?.())}><Expand size={15} strokeWidth={1.5} /></IconBtn>
      </div>

      {/* Floor selector */}
      {mode === 'exterior' && levels > 0 && wide && (
        <div className="absolute bottom-16 left-6 top-24 z-10 flex w-[4.6rem] flex-col">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-wide2 text-ivory/50">{t('viewer.floor')}</p>
          <div className="flex-1 space-y-px overflow-y-auto border border-white/10 bg-ink-900/60 p-1 backdrop-blur-xl [scrollbar-width:none]">
            {Array.from({ length: levels }, (_, i) => levels - 1 - i).map((f) => {
              const fu = units.filter((u) => u.floor === f);
              return (
                <button key={f} type="button" onClick={() => { setFloor(floor === f ? null : f); setUnit(null); setPanel(true); }} aria-pressed={floor === f}
                  className={`flex w-full items-center justify-between gap-1 px-2 py-1.5 text-[10px] font-semibold transition-colors ${floor === f ? 'bg-gold text-ink' : 'text-ivory/60 hover:bg-white/5 hover:text-gold'}`}>
                  <span>{isTower ? String(f + 1).padStart(2, '0') : ['G', '1', 'R'][f]}</span>
                  <span className="flex gap-px">{fu.map((u) => <i key={u.id} className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR[u.status] }} />)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail panel */}
      <AnimatePresence>
        {panel && (
          <motion.aside
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`glass absolute z-10 overflow-y-auto p-5 ${wide ? 'right-20 top-6 max-h-[calc(100%-3rem)] w-[21rem]' : 'inset-x-3 bottom-3 max-h-[44%]'}`} data-lenis-prevent
          >
            <button type="button" aria-label="Hide panel" onClick={() => setPanel(false)} className="absolute right-3 top-3 text-ivory/40 hover:text-gold"><X size={16} /></button>
            <p className="eyebrow mb-1.5">{projectName}</p>

            {mode === 'exterior' && isTower && floor == null && (
              <>
                <h3 className="font-serif text-2xl font-light">Select a residence</h3>
                <p className="mt-2 text-xs leading-relaxed text-ivory/55">{t('viewer.drag')}</p>
                <div className="mt-5 grid grid-cols-3 gap-px bg-white/10">
                  {(Object.keys(counts) as PropertyStatus[]).map((s) => (
                    <div key={s} className="bg-ink-800 px-3 py-3">
                      <p className="font-serif text-2xl">{counts[s]}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide2 text-ivory/50"><i className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR[s] }} />{t(`status.${s}`)}</p>
                    </div>
                  ))}
                </div>
                <label className={`label mt-5 ${wide ? 'hidden' : ''}`} htmlFor="floor-select">{t('viewer.floor')}</label>
                <select id="floor-select" className={`field ${wide ? 'hidden' : ''}`} value="" onChange={(e) => e.target.value && setFloor(Number(e.target.value))}>
                  <option value="">{t('viewer.allFloors')}</option>
                  {Array.from({ length: floors }, (_, i) => <option key={i} value={i}>{t('viewer.floor')} {i + 1}</option>)}
                </select>
              </>
            )}

            {mode === 'exterior' && isTower && floor != null && (
              <>
                <div className="flex items-end justify-between pr-6">
                  <h3 className="font-serif text-2xl font-light">{t('viewer.floor')} {floor + 1}</h3>
                  <div className="flex gap-1">
                    <button type="button" aria-label="Floor down" disabled={floor <= 0} onClick={() => { setFloor(floor - 1); setUnit(null); }} className="border border-white/10 p-1.5 text-ivory/70 hover:border-gold hover:text-gold disabled:opacity-30"><ChevronLeft size={14} className="-rotate-90" /></button>
                    <button type="button" aria-label="Floor up" disabled={floor >= floors - 1} onClick={() => { setFloor(floor + 1); setUnit(null); }} className="border border-white/10 p-1.5 text-ivory/70 hover:border-gold hover:text-gold disabled:opacity-30"><ChevronLeft size={14} className="rotate-90" /></button>
                  </div>
                </div>
                <ul className="mt-4 space-y-1.5">
                  {floorUnits.map((u) => (
                    <li key={u.id}>
                      <button type="button" onClick={() => setUnit(unit?.id === u.id ? null : u)} aria-pressed={unit?.id === u.id}
                        className={`w-full border px-3.5 py-3 text-left transition-colors duration-300 ${unit?.id === u.id ? 'border-gold bg-gold/[0.08]' : 'border-white/[0.08] hover:border-white/25'}`}>
                        <span className="flex items-center justify-between">
                          <span className="font-serif text-lg">Residence {u.number}</span>
                          <span className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide2" style={{ color: STATUS_COLOR[u.status] }}><i className="h-1.5 w-1.5 rounded-full bg-current" />{t(`status.${u.status}`)}</span>
                        </span>
                        <span className="mt-1 flex items-center justify-between text-[11px] text-ivory/55">
                          <span>{u.bedrooms} {t('label.beds')} · {formatNumber(u.area)} {t('label.area')} · {u.view}</span>
                          <span className="text-ivory/85">{money(u.price, true)}</span>
                        </span>
                        {unit?.id === u.id && (
                          <span className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                            <span className="font-serif text-xl text-gold">{money(u.price)}</span>
                            {u.status !== 'sold' && <Link href={`${enquiryHref}?unit=${encodeURIComponent(`${projectName} ${u.number}`)}`} onClick={(e) => e.stopPropagation()} className="btn-gold btn-sm">{t('cta.enquire')}</Link>}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={reset} className="btn-ghost mt-4 text-[10px]"><ChevronLeft size={12} /> {t('viewer.allFloors')}</button>
              </>
            )}

            {mode === 'exterior' && !isTower && !modelUrl && (
              <>
                <h3 className="font-serif text-2xl font-light">{floor != null ? VILLA_LEVELS[floor].name : 'Explore the villa'}</h3>
                <p className="mt-2 text-xs leading-relaxed text-ivory/55">{floor != null ? VILLA_LEVELS[floor].detail : 'Click a level of the villa, or choose one below, to lift the floors apart.'}</p>
                {floor != null && <p className="mt-3 font-serif text-xl text-gold">{formatNumber(VILLA_LEVELS[floor].area)} {t('label.area')}</p>}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {VILLA_LEVELS.map((l, i) => <button key={l.name} type="button" onClick={() => setFloor(floor === i ? null : i)} className={`chip ${floor === i ? 'chip-active' : 'hover:border-gold hover:text-gold'}`}>{l.name}</button>)}
                </div>
              </>
            )}
            {mode === 'exterior' && modelUrl && (
              <>
                <h3 className="font-serif text-2xl font-light">3D model</h3>
                <p className="mt-2 text-xs leading-relaxed text-ivory/55">Drag to rotate; use the zoom buttons or Ctrl + scroll. Switch to Interior to walk through the residence.</p>
              </>
            )}

            {mode === 'interior' && (
              <>
                <h3 className="font-serif text-2xl font-light">{room ? room.name : `${L.label} residence`}</h3>
                <p className="mt-2 text-xs leading-relaxed text-ivory/55">{room ? room.detail : 'Select a hotspot to step into a room, or start the guided tour.'}</p>
                {room && (
                  <>
                    <div className="mt-4 grid grid-cols-2 gap-px bg-white/10 text-center">
                      <div className="bg-ink-800 py-3"><p className="font-serif text-xl">{room.w.toFixed(1)} × {room.d.toFixed(1)} m</p><p className="mt-1 text-[9px] uppercase tracking-wide2 text-ivory/45">Dimensions</p></div>
                      <div className="bg-ink-800 py-3"><p className="font-serif text-xl">{formatNumber(roomAreaSqft(room))}</p><p className="mt-1 text-[9px] uppercase tracking-wide2 text-ivory/45">{t('label.area')}</p></div>
                    </div>
                    <ul className="mt-4 space-y-2">
                      {room.finishes.map((f) => <li key={f} className="flex items-start gap-2.5 text-xs text-ivory/70"><span className="mt-1.5 h-1 w-1 shrink-0 rotate-45 bg-gold" />{f}</li>)}
                    </ul>
                  </>
                )}
                <div className="mt-5 flex items-center gap-1.5">
                  <button type="button" onClick={() => { setTouring((v) => !v); if (!room) setRoom(L.rooms[0]); }} className="btn-gold btn-sm flex-1">
                    {touring ? <Pause size={12} /> : <Play size={12} />} {t('viewer.tour')}
                  </button>
                  <button type="button" aria-label="Previous room" onClick={() => { setTouring(false); stepRoom(-1); }} className="border border-white/15 p-2.5 text-ivory/70 hover:border-gold hover:text-gold"><ChevronLeft size={14} className="rtl:rotate-180" /></button>
                  <button type="button" aria-label="Next room" onClick={() => { setTouring(false); stepRoom(1); }} className="border border-white/15 p-2.5 text-ivory/70 hover:border-gold hover:text-gold"><ChevronRight size={14} className="rtl:rotate-180" /></button>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {L.rooms.map((r) => <button key={r.id} type="button" onClick={() => { setRoom(r); setTouring(false); }} className={`chip ${room?.id === r.id ? 'chip-active' : 'hover:border-gold hover:text-gold'}`}>{r.name}</button>)}
                </div>
              </>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
      {!panel && <button type="button" onClick={() => setPanel(true)} className="btn-gold btn-sm absolute bottom-4 right-4 z-10 sm:bottom-6 sm:right-6">Details</button>}

      {/* Legend */}
      <div className={`pointer-events-none absolute bottom-6 left-6 z-10 items-center gap-4 text-[9px] font-semibold uppercase tracking-wide2 text-ivory/55 ${wide ? 'flex' : 'hidden'}`}>
        {isTower && mode === 'exterior' && (Object.keys(STATUS_COLOR) as PropertyStatus[]).map((s) => <span key={s} className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR[s] }} />{t(`status.${s}`)}</span>)}
        <span className="text-ivory/35">{t('viewer.drag')}</span>
      </div>
    </div>
  );
}
