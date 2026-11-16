'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Vec3 } from './Stage';

export interface Anchor { id: string; position: Vec3 }
export type AnchorEls = React.MutableRefObject<Record<string, HTMLElement | null>>;

/**
 * Pins ordinary DOM elements to points in the 3D scene. Runs inside the Canvas and writes transforms
 * straight to the elements, so labels track the camera without re-rendering React.
 */
export function AnchorProjector({ anchors, els }: { anchors: Anchor[]; els: AnchorEls }) {
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => {
    for (const a of anchors) {
      const el = els.current[a.id];
      if (!el) continue;
      v.set(a.position[0], a.position[1], a.position[2]).project(camera);
      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (-v.y * 0.5 + 0.5) * size.height;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.style.visibility = v.z > 1 || Math.abs(v.x) > 1.1 || Math.abs(v.y) > 1.1 ? 'hidden' : 'visible';
    }
  });
  return null;
}

/** Overlay that hosts the anchored elements above the canvas. */
export function AnchorLayer({ children }: { children: React.ReactNode }) {
  return <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">{children}</div>;
}
export function AnchorItem({ id, els, children }: { id: string; els: AnchorEls; children: React.ReactNode }) {
  return (
    <div ref={(el) => { els.current[id] = el; }} className="absolute left-0 top-0 will-change-transform" style={{ visibility: 'hidden' }}>
      <div className="pointer-events-auto -translate-x-1/2 -translate-y-1/2">{children}</div>
    </div>
  );
}

/**
 * Embedded viewers must not hijack page scrolling: the wheel zooms only with Ctrl/⌘ held or in fullscreen.
 * Also reports whether the viewer is wide enough to offset the scene beside its detail panel.
 */
export function useViewerChrome() {
  const ref = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => { if (!(e.ctrlKey || e.metaKey || document.fullscreenElement === el)) e.stopPropagation(); };
    el.addEventListener('wheel', onWheel, { capture: true, passive: true });
    const ro = new ResizeObserver(([entry]) => setWide(entry.contentRect.width >= 900));
    ro.observe(el);
    return () => { el.removeEventListener('wheel', onWheel, { capture: true }); ro.disconnect(); };
  }, []);
  return { ref, wide };
}
