'use client';

import { ThreeEvent } from '@react-three/fiber';
import { useMemo, useState } from 'react';
import type { Project } from '@/lib/types';
import { BuildingMaterials, Tree, rnd } from './common';

function MiniBuilding({ p, m }: { p: Project; m: BuildingMaterials }) {
  const floors = p.model.floors ?? 20;
  const h = floors * 0.14;
  if (p.model.kind === 'villa') {
    return (
      <group>
        {Array.from({ length: 6 }, (_, i) => {
          const x = ((i % 3) - 1) * 1.15;
          const z = i < 3 ? -0.55 : 0.6;
          return (
            <group key={i} position={[x, 0, z]}>
              <mesh material={m.slab} position={[0, 0.14, 0]} castShadow><boxGeometry args={[0.8, 0.26, 0.55]} /></mesh>
              <mesh material={m.plainGlass} position={[0, 0.13, 0.28]}><boxGeometry args={[0.6, 0.18, 0.02]} /></mesh>
              <mesh material={m.wood} position={[0.08, 0.38, -0.03]} castShadow><boxGeometry args={[0.6, 0.2, 0.45]} /></mesh>
              <mesh material={m.slab} position={[0.05, 0.5, 0]} castShadow><boxGeometry args={[0.85, 0.03, 0.6]} /></mesh>
              <mesh material={m.water} position={[0, 0.03, 0.48]}><boxGeometry args={[0.5, 0.02, 0.16]} /></mesh>
            </group>
          );
        })}
      </group>
    );
  }
  const segs = p.model.variant === 'twist' ? 10 : p.model.variant === 'stepped' ? 3 : 1;
  return (
    <group>
      <mesh material={m.slab} position={[0, 0.08, 0]} castShadow><boxGeometry args={[1.9, 0.16, 1.9]} /></mesh>
      {Array.from({ length: segs }, (_, i) => {
        const sh = h / segs;
        const step = p.model.variant === 'stepped' ? 1.5 - i * 0.32 : 1;
        return (
          <group key={i} position={[p.model.variant === 'stepped' ? -i * 0.2 : 0, 0.16 + sh * i, 0]} rotation-y={p.model.variant === 'twist' ? (i / segs) * (Math.PI / 2) : 0}>
            <mesh material={m.glass[i % 3]} position={[0, sh / 2, 0]} castShadow><boxGeometry args={[1.25 * step, sh - 0.012, 1.25]} /></mesh>
            <mesh material={m.slab} position={[0, sh - 0.006, 0]}><boxGeometry args={[1.33 * step, 0.014, 1.33]} /></mesh>
          </group>
        );
      })}
      <mesh material={m.goldGlow} position={[p.model.variant === 'stepped' ? -0.4 : 0, 0.16 + h + 0.02, 0]} rotation-y={p.model.variant === 'twist' ? Math.PI / 2 : 0}><boxGeometry args={[p.model.variant === 'stepped' ? 1.15 : 1.36, 0.04, 1.36]} /></mesh>
    </group>
  );
}

interface Props {
  projects: Project[];
  m: BuildingMaterials;
  selected: string | null;
  onSelect: (slug: string | null) => void;
}

/** Height of the label anchor above each plot. */
export const planLabelY = (p: Project) => (p.model.kind === 'villa' ? 1.5 : (p.model.floors ?? 20) * 0.14 + 1.1);

/** Interactive district model: the developments set in a stylised waterfront masterplan. */
export default function MasterPlan({ projects, m, selected, onSelect }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  const context = useMemo(() => Array.from({ length: 34 }, (_, i) => {
    const a = rnd(i * 2.1) * Math.PI * 2;
    const r = 2 + rnd(i * 5.3) * 6.6;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    return { x, z, h: 0.25 + rnd(i * 9.1) * 1.3, w: 0.5 + rnd(i * 3.3) * 0.5, tree: i % 3 === 0 };
  }).filter((b) => Math.abs(b.x) > 0.8 && Math.abs(b.z) > 0.8 && !projects.some((p) => Math.hypot(p.plot.x - b.x, p.plot.z - b.z) < 2.6)), [projects]);

  return (
    <group>
      {/* Sea, island and shoreline */}
      <mesh material={m.water} position={[0, -0.32, 0]} receiveShadow><cylinderGeometry args={[15, 15, 0.2, 72]} /></mesh>
      <mesh material={m.dark} position={[0, -0.6, 0]}><cylinderGeometry args={[15.2, 15.6, 0.5, 72]} /></mesh>
      <mesh material={m.stone} position={[0, -0.14, 0]} receiveShadow><cylinderGeometry args={[10.2, 10.5, 0.24, 72]} /></mesh>
      <mesh material={m.lawn} position={[0, -0.01, 0]} receiveShadow><cylinderGeometry args={[9.7, 9.7, 0.03, 72]} /></mesh>
      {/* Boulevards */}
      <mesh material={m.dark} position={[0, 0.012, 0]} receiveShadow><boxGeometry args={[19, 0.02, 0.7]} /></mesh>
      <mesh material={m.dark} position={[0, 0.012, 0]} receiveShadow><boxGeometry args={[0.7, 0.02, 19]} /></mesh>
      <mesh material={m.dark} position={[0, 0.011, 0]} rotation-x={-Math.PI / 2}><ringGeometry args={[7.6, 8.1, 96]} /></mesh>
      <mesh material={m.stone} position={[0, 0.03, 0]}><cylinderGeometry args={[1.25, 1.25, 0.04, 48]} /></mesh>
      <mesh material={m.water} position={[0, 0.06, 0]}><cylinderGeometry args={[0.8, 0.8, 0.03, 48]} /></mesh>
      <mesh material={m.goldGlow} position={[0, 0.5, 0]}><cylinderGeometry args={[0.02, 0.05, 0.9, 8]} /></mesh>
      {/* Marina jetties and yachts */}
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[10.6, -0.2, -3 + i * 1.1]}>
          <mesh material={m.stone}><boxGeometry args={[2.2, 0.06, 0.14]} /></mesh>
          <mesh material={m.slab} position={[0.5, 0.08, 0.36]} rotation-z={Math.PI / 2} scale={[0.6, 1, 1]} castShadow><capsuleGeometry args={[0.13, 0.7, 4, 10]} /></mesh>
        </group>
      ))}
      {context.map((b, i) => b.tree
        ? <Tree key={i} m={m} position={[b.x, 0, b.z]} scale={0.9} seed={i} />
        : <mesh key={i} material={i % 4 === 0 ? m.glass[0] : m.slab} position={[b.x, b.h / 2, b.z]} castShadow receiveShadow><boxGeometry args={[b.w, b.h, b.w]} /></mesh>)}

      {projects.map((p) => {
        const active = selected === p.slug || hover === p.slug;
        return (
          <group
            key={p.slug} position={[p.plot.x, 0, p.plot.z]}
            onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHover(p.slug); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHover((h) => (h === p.slug ? null : h)); document.body.style.cursor = ''; }}
            onClick={(e: ThreeEvent<MouseEvent>) => { if (e.delta > 5) return; e.stopPropagation(); onSelect(selected === p.slug ? null : p.slug); }}
          >
            <mesh material={active ? m.goldGlow : m.stone} position={[0, 0.02, 0]} receiveShadow><cylinderGeometry args={[2.25, 2.25, 0.04, 48]} /></mesh>
            <mesh material={m.lawn} position={[0, 0.035, 0]} receiveShadow><cylinderGeometry args={[2.12, 2.12, 0.03, 48]} /></mesh>
            <group scale={active ? 1.06 : 1}><MiniBuilding p={p} m={m} /></group>
          </group>
        );
      })}
    </group>
  );
}
