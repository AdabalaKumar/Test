'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { LayoutKey, ModelConfig, Project } from '@/lib/types';

const Inner = dynamic(() => import('./RenderScene'), { ssr: false });

/** Chrome-less scene used by scripts/render-images.mjs to produce the site's still imagery from the live 3D models. */
export default function RenderClient({ projects }: { projects: Project[] }) {
  const q = useSearchParams();
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 2500); return () => clearTimeout(t); }, []);
  const vec = (k: string, d: string) => (q.get(k) ?? d).split(',').map(Number) as [number, number, number];
  const project = projects.find((p) => p.slug === q.get('project'));
  const model: ModelConfig = project?.model ?? { kind: 'tower', variant: 'slab', floors: 22 };
  return (
    <div className="fixed inset-0 bg-ink" data-ready={ready}>
      <Inner
        scene={(q.get('scene') ?? 'exterior') as 'exterior' | 'interior' | 'masterplan'} model={model} projects={projects} night={q.get('night') === '1'}
        layout={(q.get('layout') ?? 'two') as LayoutKey} position={vec('pos', '14,8,18')} target={vec('target', '0,4,0')} fov={Number(q.get('fov') ?? 32)}
      />
    </div>
  );
}
