'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { useApp } from '@/components/Providers';
import type { LayoutKey, Project } from '@/lib/types';
import { MasterPlanViewer, PropertyViewer } from './Viewer3D';

const LAYOUT_LABEL: Record<LayoutKey, string> = { one: '1 Bedroom', two: '2 Bedroom', three: '3 Bedroom +' };

/** Full-height 3D explorer: pick a development (or the master plan) and a residence layout to tour. */
export default function ToursClient({ projects }: { projects: Project[] }) {
  const { money, t } = useApp();
  const [slug, setSlug] = useState<string>(projects[0]?.slug ?? 'masterplan');
  const [layout, setLayout] = useState<LayoutKey>('two');
  const project = projects.find((p) => p.slug === slug);
  const tabs = [...projects.map((p) => ({ slug: p.slug, name: p.name, sub: p.location })), { slug: 'masterplan', name: 'Master plan', sub: 'All developments' }];

  return (
    <div className="shell pb-20">
      <div className="flex gap-px overflow-x-auto bg-white/[0.07] [scrollbar-width:none]" role="tablist" aria-label="Choose a 3D experience">
        {tabs.map((tab) => (
          <button key={tab.slug} type="button" role="tab" aria-selected={slug === tab.slug} onClick={() => setSlug(tab.slug)}
            className={`relative min-w-[11rem] flex-1 px-5 py-5 text-left transition-colors duration-500 ${slug === tab.slug ? 'bg-ink-700' : 'bg-ink hover:bg-ink-800'}`}>
            <span className="block text-[9px] font-medium uppercase tracking-wide2 text-ivory/40">{tab.sub}</span>
            <span className={`mt-1 block font-serif text-xl ${slug === tab.slug ? 'text-gold' : 'text-ivory/80'}`}>{tab.name}</span>
            {slug === tab.slug && <motion.span layoutId="tour-tab" className="absolute inset-x-0 bottom-0 h-px bg-gold" />}
          </button>
        ))}
      </div>
      <div className="mt-px h-[calc(100svh-15rem)] min-h-[580px] border border-white/[0.07]">
        {project
          ? <PropertyViewer key={`${project.slug}-${layout}`} model={project.model} projectSlug={project.slug} projectName={project.name} layout={layout} />
          : <MasterPlanViewer projects={projects} />}
      </div>
      {project && (
        <div className="mt-6 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-[10px] font-medium uppercase tracking-wide2 text-ivory/40">Interior layout</span>
            {(Object.keys(LAYOUT_LABEL) as LayoutKey[]).map((k) => <button key={k} type="button" aria-pressed={layout === k} onClick={() => setLayout(k)} className={`chip ${layout === k ? 'chip-active' : 'hover:border-gold hover:text-gold'}`}>{LAYOUT_LABEL[k]}</button>)}
          </div>
          <div className="flex items-center gap-6">
            <p className="text-sm text-ivory/60">{t('label.from')} <span className="font-serif text-2xl text-gold" dir="ltr">{money(project.startingPrice, true)}</span></p>
            <Link href={`/projects/${project.slug}`} className="btn-outline btn-sm">{t('cta.discover')}</Link>
          </div>
        </div>
      )}
    </div>
  );
}
