'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { useApp } from '@/components/Providers';
import type { Project } from '@/lib/types';
import { useBuildingMaterials } from './common';
import { AnchorItem, AnchorLayer, AnchorProjector, useViewerChrome } from './Anchors';
import MasterPlan, { planLabelY } from './MasterPlan';
import { CameraRig, SceneCanvas, View } from './Stage';

function Plan({ projects, night, selected, onSelect }: { projects: Project[]; night: boolean; selected: string | null; onSelect: (s: string | null) => void }) {
  const m = useBuildingMaterials(night);
  return <MasterPlan projects={projects} m={m} selected={selected} onSelect={onSelect} />;
}

export default function MasterPlanViewer({ projects }: { projects: Project[] }) {
  const { money, t } = useApp();
  const [night, setNight] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const project = projects.find((p) => p.slug === selected);
  const { ref, wide } = useViewerChrome();
  const els = useRef<Record<string, HTMLElement | null>>({});
  const anchors = useMemo(() => projects.map((p) => ({ id: p.slug, position: [p.plot.x, planLabelY(p), p.plot.z] as [number, number, number] })), [projects]);
  const view = useMemo<View>(() => (project
    ? { position: [project.plot.x * 1.35 + 5.5, 6.5, project.plot.z * 1.35 + 8], target: [project.plot.x, 1, project.plot.z] }
    : { position: [15, 11, 19], target: [0, 0.4, 0] }), [project]);

  return (
    <div ref={ref} className="relative h-full min-h-[520px] w-full overflow-hidden bg-ink-900">
      <div className="canvas-wrap absolute inset-0">
        <SceneCanvas night={night} fov={34}>
          <Plan projects={projects} night={night} selected={selected} onSelect={setSelected} />
          <CameraRig view={view} autoRotate={!selected} minDistance={7} maxDistance={40} shift={project && wide ? 170 : 0} shiftY={project && !wide ? 0.14 : 0} />
          <AnchorProjector anchors={anchors} els={els} />
        </SceneCanvas>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(13,13,15,.6))]" />
      <AnchorLayer>
        {projects.map((p) => (
          <AnchorItem key={p.slug} id={p.slug} els={els}>
            <button type="button" onClick={() => setSelected(selected === p.slug ? null : p.slug)} className="flex -translate-y-1/2 flex-col items-center whitespace-nowrap">
              <span className={`border px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-wide2 backdrop-blur transition-colors duration-300 ${selected === p.slug ? 'border-gold bg-gold text-ink' : 'border-white/20 bg-ink-900/75 text-ivory hover:border-gold hover:text-gold'}`}>{p.name}</span>
              <span className={`h-5 w-px ${selected === p.slug ? 'bg-gold' : 'bg-white/40'}`} />
            </button>
          </AnchorItem>
        ))}
      </AnchorLayer>
      <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-1.5 sm:left-6 sm:top-6">
        {projects.map((p) => (
          <button key={p.slug} type="button" onClick={() => setSelected(selected === p.slug ? null : p.slug)} className={`chip bg-ink-900/60 backdrop-blur-xl ${selected === p.slug ? 'chip-active' : 'hover:border-gold hover:text-gold'}`}>{p.name}</button>
        ))}
      </div>
      <button type="button" onClick={() => setNight((n) => !n)} aria-label={night ? t('viewer.day') : t('viewer.night')} className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center border border-white/10 bg-ink-900/60 text-ivory/80 backdrop-blur-xl hover:border-gold hover:text-gold sm:right-6 sm:top-6">
        {night ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
      </button>
      <AnimatePresence mode="wait">
        {project && (
          <motion.div key={project.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.5 }}
            className="glass absolute inset-x-3 bottom-3 z-10 p-6 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[22rem]">
            <p className="eyebrow">{project.location} · {project.status}</p>
            <h3 className="mt-2 font-serif text-3xl font-light">{project.name}</h3>
            <p className="mt-2 text-xs leading-relaxed text-ivory/60">{project.tagline}. {project.highlights[0]}.</p>
            <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-4">
              <div><p className="text-[9px] uppercase tracking-wide2 text-ivory/45">{t('label.from')}</p><p className="font-serif text-2xl text-gold">{money(project.startingPrice, true)}</p></div>
              <Link href={`/projects/${project.slug}`} className="btn-gold btn-sm">{t('cta.discover')} <ArrowUpRight size={13} /></Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!project && <p className="pointer-events-none absolute bottom-6 left-6 z-10 hidden text-[9px] font-semibold uppercase tracking-wide2 text-ivory/40 sm:block">Drag to orbit · Ctrl + scroll to zoom · Select a development</p>}
    </div>
  );
}
