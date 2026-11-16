'use client';

import { ThreeEvent, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { BuildingMaterials, Tree } from './common';

export const VILLA_LEVELS = [
  { name: 'Ground floor', detail: 'Grand salon, show kitchen, majlis, guest suite and the pool terrace', area: 5600 },
  { name: 'First floor', detail: 'Master wing with sea-facing terrace and four en-suite bedrooms', area: 4200 },
  { name: 'Roof terrace', detail: 'Sunset lounge, outdoor cinema and a plunge pool', area: 1400 },
];

interface Props {
  m: BuildingMaterials;
  interactive?: boolean;
  selectedLevel?: number | null;
  onSelectLevel?: (level: number) => void;
}

export default function Villa({ m, interactive = false, selectedLevel = null, onSelectLevel }: Props) {
  const first = useRef<THREE.Group>(null);
  const roof = useRef<THREE.Group>(null);
  const [hover, setHover] = useState<number | null>(null);

  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.002, dt);
    const lift = (level: number) => (selectedLevel != null && level > selectedLevel ? 1.3 * (level - selectedLevel) : 0);
    if (first.current) first.current.position.y += (lift(1) - first.current.position.y) * k;
    if (roof.current) roof.current.position.y += (lift(2) - roof.current.position.y) * k;
  });

  const ev = (level: number) => interactive ? {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHover(level); document.body.style.cursor = 'pointer'; },
    onPointerOut: () => { setHover((h) => (h === level ? null : h)); document.body.style.cursor = ''; },
    onClick: (e: ThreeEvent<MouseEvent>) => { if (e.delta > 5) return; e.stopPropagation(); onSelectLevel?.(level); },
  } : {};
  const tint = (level: number, base: THREE.Material) => (selectedLevel === level ? m.selected : hover === level ? m.hover : base);

  return (
    <group scale={1.15}>
      {/* Terrace deck, pool and garden */}
      <mesh material={m.stone} position={[0, 0.06, 0.4]} receiveShadow castShadow><boxGeometry args={[10, 0.12, 7.6]} /></mesh>
      <mesh material={m.water} position={[-0.7, 0.125, 2.75]}><boxGeometry args={[5.8, 0.02, 1.7]} /></mesh>
      <mesh material={m.wood} position={[3.4, 0.13, 2.75]} receiveShadow><boxGeometry args={[2.2, 0.02, 1.7]} /></mesh>
      {[2.8, 3.4, 4.0].map((x) => (
        <group key={x} position={[x, 0.2, 2.75]}>
          <mesh material={m.slab} castShadow><boxGeometry args={[0.34, 0.06, 0.95]} /></mesh>
          <mesh material={m.slab} position={[0, 0.08, -0.36]} rotation-x={-0.5}><boxGeometry args={[0.34, 0.05, 0.3]} /></mesh>
        </group>
      ))}
      {[-4.4, 4.4].map((x) => <mesh key={x} material={m.leaf} position={[x, 0.3, 0.4]} castShadow><boxGeometry args={[0.35, 0.4, 7]} /></mesh>)}
      <Tree m={m} palm position={[-4.2, 0.12, 3.3]} scale={1.5} seed={1} />
      <Tree m={m} palm position={[4.3, 0.12, 1.2]} scale={1.3} seed={2} />
      <Tree m={m} palm position={[-3.9, 0.12, -2.6]} scale={1.7} seed={3} />
      <Tree m={m} palm position={[2.2, 0.12, 3.75]} scale={1.1} seed={4} />

      {/* Ground floor */}
      <group {...ev(0)}>
        <mesh material={tint(0, m.slab)} position={[-0.6, 0.77, -1.1]} castShadow receiveShadow><boxGeometry args={[6.2, 1.3, 3.6]} /></mesh>
        <mesh material={m.plainGlass} position={[-0.6, 0.72, 0.72]}><boxGeometry args={[5.4, 1.08, 0.06]} /></mesh>
        {[-2.4, -0.6, 1.2].map((x) => <mesh key={x} material={m.dark} position={[x, 0.72, 0.76]}><boxGeometry args={[0.04, 1.08, 0.04]} /></mesh>)}
        <mesh material={tint(0, m.dark)} position={[3.55, 0.77, -1.3]} castShadow><boxGeometry args={[2.1, 1.3, 3.2]} /></mesh>
        <mesh material={m.wood} position={[3.55, 0.62, 0.31]}><boxGeometry args={[1.7, 0.95, 0.04]} /></mesh>
        {[-3.2, 1.4].map((x) => <mesh key={x} material={m.gold} position={[x, 0.77, 1.9]}><cylinderGeometry args={[0.035, 0.035, 1.3, 10]} /></mesh>)}
      </group>

      {/* First floor */}
      <group ref={first}>
        <group {...ev(1)}>
          <mesh material={m.slab} position={[-0.3, 1.48, -0.5]} castShadow receiveShadow><boxGeometry args={[7.6, 0.12, 5.2]} /></mesh>
          <mesh material={m.goldGlow} position={[-0.3, 1.415, -0.5]}><boxGeometry args={[7.62, 0.02, 5.22]} /></mesh>
          <mesh material={tint(1, m.wood)} position={[0.5, 2.12, -1.2]} castShadow><boxGeometry args={[5.2, 1.16, 3.1]} /></mesh>
          <mesh material={m.plainGlass} position={[0.2, 2.08, 0.37]}><boxGeometry args={[4.2, 0.96, 0.06]} /></mesh>
          <mesh material={m.rail} position={[-0.3, 1.74, 2.05]}><boxGeometry args={[7.5, 0.4, 0.03]} /></mesh>
          <mesh material={m.rail} position={[-4.07, 1.74, 0.9]}><boxGeometry args={[0.03, 0.4, 2.3]} /></mesh>
          {Array.from({ length: 9 }, (_, i) => <mesh key={i} material={m.wood} position={[-3.75 + i * 0.16, 2.12, -0.2]} castShadow><boxGeometry args={[0.05, 1.16, 0.22]} /></mesh>)}
        </group>
      </group>

      {/* Roof */}
      <group ref={roof}>
        <group {...ev(2)}>
          <mesh material={tint(2, m.slab)} position={[0.1, 2.76, -0.9]} castShadow><boxGeometry args={[6.6, 0.11, 4.4]} /></mesh>
          <mesh material={m.gold} position={[0.1, 2.695, -0.9]}><boxGeometry args={[6.62, 0.025, 4.42]} /></mesh>
          <mesh material={m.rail} position={[0.1, 2.95, -0.9]}><boxGeometry args={[6.3, 0.26, 4.1]} /></mesh>
          <mesh material={m.water} position={[1.9, 2.83, -0.2]}><boxGeometry args={[1.6, 0.03, 1.1]} /></mesh>
          <mesh material={m.wood} position={[-1.4, 3.32, -1.6]} castShadow><boxGeometry args={[2.4, 0.05, 1.8]} /></mesh>
          {[[-2.5, -2.4], [-0.3, -2.4], [-2.5, -0.8], [-0.3, -0.8]].map(([x, z], i) => <mesh key={i} material={m.dark} position={[x, 3.06, z]}><boxGeometry args={[0.05, 0.5, 0.05]} /></mesh>)}
        </group>
      </group>
    </group>
  );
}
