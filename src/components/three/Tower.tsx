'use client';

import { ThreeEvent, useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { TowerVariant, Unit } from '@/lib/types';
import { BuildingMaterials, rnd } from './common';

export const FLOOR_H = 0.36;
const W = 3.3;
const D = 3.3;
const PODIUM = 0.9;
const QUAD: [number, number][] = [[-1, 1], [1, 1], [1, -1], [-1, -1]]; // unit position index -> (x, z) quadrant

export const towerHeight = (floors: number) => PODIUM + floors * FLOOR_H + 0.9;

function floorShape(variant: TowerVariant, i: number, floors: number) {
  if (variant === 'twist') return { sx: 1, ox: 0, rot: (i / floors) * (Math.PI / 2) };
  if (variant === 'stepped') {
    const sx = i < floors * 0.4 ? 1.55 : i < floors * 0.72 ? 1.2 : 0.85;
    return { sx, ox: -((1.55 - sx) * W) / 2, rot: 0 };
  }
  return { sx: 1, ox: 0, rot: 0 };
}

export interface TowerProps {
  floors?: number;
  variant?: TowerVariant;
  m: BuildingMaterials;
  units?: Unit[];
  interactive?: boolean;
  selectedFloor?: number | null;
  selectedUnit?: number | null;
  showAvailability?: boolean;
  onSelectUnit?: (unit: Unit) => void;
}

export default function Tower({ floors = 22, variant = 'slab', m, units, interactive = false, selectedFloor = null, selectedUnit = null, showAvailability = false, onSelectUnit }: TowerProps) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const crown = useRef<THREE.Group>(null);
  const [hover, setHover] = useState<string | null>(null);
  const byKey = useMemo(() => {
    const map = new Map<string, Unit>();
    units?.forEach((u) => map.set(`${u.floor}-${u.position}`, u));
    return map;
  }, [units]);

  // Floors above the selected one lift away so the chosen level can be looked into.
  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.002, dt);
    for (let i = 0; i < floors; i++) {
      const g = refs.current[i];
      if (!g) continue;
      const target = PODIUM + i * FLOOR_H + (selectedFloor != null && i > selectedFloor ? 1.1 : 0);
      g.position.y += (target - g.position.y) * k;
    }
    if (crown.current) {
      const target = PODIUM + floors * FLOOR_H + (selectedFloor != null && selectedFloor < floors ? 1.1 : 0);
      crown.current.position.y += (target - crown.current.position.y) * k;
    }
  });

  const ghosting = selectedFloor != null;
  const top = floorShape(variant, floors - 1, floors);

  return (
    <group>
      {/* Podium and lobby */}
      <mesh material={m.stone} position={[variant === 'stepped' ? 0 : 0, 0.02, 0]} receiveShadow castShadow><boxGeometry args={[W * (variant === 'stepped' ? 1.75 : 1.5), 0.1, D * 1.5]} /></mesh>
      <mesh material={m.plainGlass} position={[0, PODIUM / 2 + 0.03, 0]} castShadow><boxGeometry args={[W * (variant === 'stepped' ? 1.55 : 1.18), PODIUM - 0.1, D * 1.18]} /></mesh>
      <mesh material={m.slab} position={[0, PODIUM - 0.02, 0]} castShadow receiveShadow><boxGeometry args={[W * (variant === 'stepped' ? 1.7 : 1.4), 0.08, D * 1.4]} /></mesh>
      <mesh material={m.gold} position={[0, PODIUM * 0.62, D * 0.59 + 0.5]} castShadow><boxGeometry args={[1.9, 0.05, 1.0]} /></mesh>
      {[-0.85, 0.85].map((x) => <mesh key={x} material={m.gold} position={[x, PODIUM * 0.31, D * 0.59 + 0.9]}><cylinderGeometry args={[0.025, 0.025, PODIUM * 0.62, 8]} /></mesh>)}
      <mesh material={m.goldGlow} position={[0, PODIUM - 0.075, 0]}><boxGeometry args={[W * (variant === 'stepped' ? 1.71 : 1.41), 0.02, D * 1.41]} /></mesh>

      {Array.from({ length: floors }, (_, i) => {
        const { sx, ox, rot } = floorShape(variant, i, floors);
        const w = W * sx;
        const active = selectedFloor === i;
        const dim = ghosting && !active;
        const terrace = variant === 'stepped' && floorShape(variant, i - 1, floors).sx > sx;
        return (
          <group key={i} ref={(g) => { refs.current[i] = g; }} position={[ox, PODIUM + i * FLOOR_H, 0]} rotation-y={rot}>
            <mesh material={dim ? m.ghostSlab : m.slab} position={[0, 0.025, 0]} castShadow={!dim} receiveShadow><boxGeometry args={[w + 0.36, 0.05, D + 0.36]} /></mesh>
            {!dim && <mesh material={m.rail} position={[0, 0.11, 0]}><boxGeometry args={[w + 0.34, 0.12, D + 0.34]} /></mesh>}
            {QUAD.map(([qx, qz], k) => {
              const key = `${i}-${k}`;
              const unit = byKey.get(key);
              const material = dim ? m.ghost
                : unit && selectedUnit === unit.id ? m.selected
                : interactive && hover === key ? m.hover
                : unit && (showAvailability || active) ? m.status[unit.status]
                : m.glass[Math.floor(rnd(i * 4.3 + k * 1.7) * 3)];
              const events = interactive && unit && !dim ? {
                onPointerOver: (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHover(key); document.body.style.cursor = 'pointer'; },
                onPointerOut: () => { setHover((h) => (h === key ? null : h)); document.body.style.cursor = ''; },
                onClick: (e: ThreeEvent<MouseEvent>) => { if (e.delta > 5) return; e.stopPropagation(); onSelectUnit?.(unit); },
              } : {};
              return (
                <mesh key={k} material={material} position={[(qx * w) / 4, 0.05 + (FLOOR_H - 0.05) / 2, (qz * D) / 4]} castShadow={!dim} {...events}>
                  <boxGeometry args={[w / 2 - 0.03, FLOOR_H - 0.05, D / 2 - 0.03]} />
                </mesh>
              );
            })}
            {!dim && variant !== 'stepped' && QUAD.map(([qx, qz], k) => (
              <mesh key={k} material={m.gold} position={[qx * (w / 2 + 0.15), FLOOR_H / 2 + 0.025, qz * (D / 2 + 0.15)]}><boxGeometry args={[0.04, FLOOR_H, 0.04]} /></mesh>
            ))}
            {!dim && terrace && (
              <>
                <mesh material={m.lawn} position={[w / 2 + 0.75, 0.0, 0]}><boxGeometry args={[1.0, 0.08, D * 0.9]} /></mesh>
                {[-1, 0, 1].map((z) => <mesh key={z} material={m.leaf} position={[w / 2 + 0.8, 0.2, z * 1.0]} castShadow><icosahedronGeometry args={[0.2, 1]} /></mesh>)}
              </>
            )}
          </group>
        );
      })}

      {/* Crown: roof terrace, pavilion, pool and beacon */}
      <group ref={crown} position={[top.ox, PODIUM + floors * FLOOR_H, 0]} rotation-y={top.rot}>
        <mesh material={ghosting ? m.ghostSlab : m.slab} position={[0, 0.04, 0]} castShadow><boxGeometry args={[W * top.sx + 0.5, 0.08, D + 0.5]} /></mesh>
        {!ghosting && (
          <>
            <mesh material={m.goldGlow} position={[0, 0.0, 0]}><boxGeometry args={[W * top.sx + 0.52, 0.025, D + 0.52]} /></mesh>
            <mesh material={m.rail} position={[0, 0.16, 0]}><boxGeometry args={[W * top.sx + 0.46, 0.16, D + 0.46]} /></mesh>
            <mesh material={m.plainGlass} position={[-W * top.sx * 0.16, 0.33, -D * 0.14]} castShadow><boxGeometry args={[W * top.sx * 0.52, 0.5, D * 0.55]} /></mesh>
            <mesh material={m.slab} position={[-W * top.sx * 0.12, 0.61, -D * 0.1]} castShadow><boxGeometry args={[W * top.sx * 0.7, 0.05, D * 0.75]} /></mesh>
            <mesh material={m.gold} position={[-W * top.sx * 0.12, 0.575, -D * 0.1]}><boxGeometry args={[W * top.sx * 0.71, 0.02, D * 0.76]} /></mesh>
            <mesh material={m.water} position={[W * top.sx * 0.26, 0.09, D * 0.22]}><boxGeometry args={[W * top.sx * 0.36, 0.03, D * 0.42]} /></mesh>
            <mesh material={m.gold} position={[-W * top.sx * 0.3, 1.25, -D * 0.3]}><cylinderGeometry args={[0.012, 0.03, 1.3, 6]} /></mesh>
            <mesh material={m.lamp} position={[-W * top.sx * 0.3, 1.92, -D * 0.3]}><sphereGeometry args={[0.035, 8, 8]} /></mesh>
          </>
        )}
      </group>
    </group>
  );
}
