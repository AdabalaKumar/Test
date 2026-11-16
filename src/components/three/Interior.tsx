'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { LAYOUTS, type Edge, type Layout, type Room } from '@/lib/layouts';
import type { LayoutKey } from '@/lib/types';

const WALL_H = 1.25;
const T = 0.1;
export const INTERIOR_SCALE = 0.62;

function useInteriorMaterials(night: boolean) {
  return useMemo(() => {
    const std = (color: string, o: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });
    return {
      wall: std(night ? '#b9b2a6' : '#e4ddd1'),
      wallTop: std('#2a2a2d', { roughness: 0.5 }),
      glass: new THREE.MeshPhysicalMaterial({ color: '#bfd9e6', transparent: true, opacity: 0.25, roughness: 0.05, metalness: 0.3, depthWrite: false }),
      floor: {
        living: std(night ? '#7c6245' : '#b9976c', { roughness: 0.55 }), kitchen: std(night ? '#7c6245' : '#b9976c', { roughness: 0.55 }),
        bedroom: std(night ? '#8a7860' : '#cdb695', { roughness: 0.9 }), bath: std(night ? '#9c978f' : '#e9e4dc', { roughness: 0.25 }),
        terrace: std(night ? '#6a6258' : '#cfc3b0', { roughness: 0.9 }), foyer: std(night ? '#9c978f' : '#e9e4dc', { roughness: 0.25 }),
      },
      base: std('#1a1a1c'),
      fabric: std(night ? '#8d867b' : '#d9d2c5', { roughness: 1 }),
      fabricDark: std('#4a4640', { roughness: 1 }),
      bed: std(night ? '#c9c2b6' : '#f7f4ee', { roughness: 1 }),
      oak: std(night ? '#5a4330' : '#8a6642', { roughness: 0.6 }),
      marble: std(night ? '#bdb7ad' : '#f4f1ea', { roughness: 0.2 }),
      dark: std('#26262a', { roughness: 0.5 }),
      gold: std('#c9a96e', { metalness: 1, roughness: 0.3 }),
      rug: std(night ? '#6d6257' : '#a89a86', { roughness: 1 }),
      plant: std(night ? '#24402c' : '#4f7a44', { roughness: 0.9 }),
      water: new THREE.MeshPhysicalMaterial({ color: '#3fa7c4', roughness: 0.05, metalness: 0.3, emissive: new THREE.Color('#2bb8e0'), emissiveIntensity: night ? 0.8 : 0.05 }),
      lamp: std('#ffe2b0', { emissive: new THREE.Color('#ffd08a'), emissiveIntensity: night ? 3.5 : 0.4 }),
    };
  }, [night]);
}
type IM = ReturnType<typeof useInteriorMaterials>;

const Box = ({ m, p, s, shadow = true }: { m: THREE.Material; p: [number, number, number]; s: [number, number, number]; shadow?: boolean }) => (
  <mesh material={m} position={p} castShadow={shadow} receiveShadow><boxGeometry args={s} /></mesh>
);

/** One edge of a room: solid wall, wall with a door opening, glazing, balustrade, or nothing. */
function EdgeWall({ kind, a, b, m }: { kind: Edge; a: [number, number]; b: [number, number]; m: IM }) {
  if (kind === 'none') return null;
  const horizontal = a[1] === b[1];
  const len = horizontal ? b[0] - a[0] : b[1] - a[1];
  const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const seg = (offset: number, l: number, h: number, mat: THREE.Material, y = h / 2, thick = T) => {
    const size: [number, number, number] = horizontal ? [l, h, thick] : [thick, h, l];
    const pos: [number, number, number] = horizontal ? [mid[0] + offset, y, mid[1]] : [mid[0], y, mid[1] + offset];
    return <mesh material={mat} position={pos} castShadow={mat !== m.glass} receiveShadow><boxGeometry args={size} /></mesh>;
  };
  if (kind === 'glass') return <>{seg(0, len, WALL_H, m.glass, WALL_H / 2, 0.04)}{seg(0, len, 0.04, m.dark, WALL_H)}</>;
  if (kind === 'rail') return <>{seg(0, len, 0.5, m.glass, 0.25, 0.03)}{seg(0, len, 0.025, m.gold, 0.51, 0.04)}</>;
  if (kind === 'door') {
    const gap = Math.min(1, len * 0.4);
    const side = (len - gap) / 2;
    return <>{seg(-(gap + side) / 2, side, WALL_H, m.wall)}{seg((gap + side) / 2, side, WALL_H, m.wall)}{seg(-(gap + side) / 2, side, 0.02, m.wallTop, WALL_H + 0.01)}{seg((gap + side) / 2, side, 0.02, m.wallTop, WALL_H + 0.01)}</>;
  }
  return <>{seg(0, len + T, WALL_H, m.wall)}{seg(0, len + T, 0.02, m.wallTop, WALL_H + 0.01)}</>;
}

function Furniture({ r, m }: { r: Room; m: IM }) {
  const cx = r.x + r.w / 2;
  const cz = r.z + r.d / 2;
  switch (r.type) {
    case 'living':
      return (
        <group position={[cx, 0, cz]}>
          <Box m={m.rug} p={[0, 0.03, 0]} s={[r.w * 0.62, 0.02, r.d * 0.6]} shadow={false} />
          <Box m={m.fabric} p={[0, 0.2, r.d * 0.22]} s={[r.w * 0.5, 0.36, 0.8]} />
          <Box m={m.fabric} p={[0, 0.42, r.d * 0.22 + 0.32]} s={[r.w * 0.5, 0.4, 0.18]} />
          <Box m={m.fabric} p={[-r.w * 0.25 - 0.1, 0.2, -0.1]} s={[0.8, 0.36, 1.5]} />
          <Box m={m.marble} p={[0.2, 0.17, -0.25]} s={[1.2, 0.06, 0.7]} />
          <Box m={m.dark} p={[0.2, 0.08, -0.25]} s={[0.9, 0.14, 0.4]} />
          <Box m={m.fabricDark} p={[r.w * 0.28, 0.22, -0.4]} s={[0.7, 0.4, 0.7]} />
          <Box m={m.oak} p={[0, 0.2, -r.d / 2 + 0.55]} s={[r.w * 0.45, 0.3, 0.35]} />
          <mesh material={m.lamp} position={[-r.w * 0.36, 0.95, r.d * 0.3]}><sphereGeometry args={[0.13, 12, 12]} /></mesh>
          <Box m={m.dark} p={[-r.w * 0.36, 0.42, r.d * 0.3]} s={[0.03, 0.84, 0.03]} />
          <mesh material={m.plant} position={[r.w * 0.38, 0.55, r.d * 0.34]} castShadow><icosahedronGeometry args={[0.3, 1]} /></mesh>
          <Box m={m.dark} p={[r.w * 0.38, 0.15, r.d * 0.34]} s={[0.25, 0.3, 0.25]} />
        </group>
      );
    case 'kitchen':
      return (
        <group position={[cx, 0, cz]}>
          <Box m={m.oak} p={[r.w / 2 - 0.36, 0.45, 0.4]} s={[0.6, 0.9, r.d * 0.6]} />
          <Box m={m.marble} p={[r.w / 2 - 0.36, 0.92, 0.4]} s={[0.64, 0.04, r.d * 0.6 + 0.04]} />
          <Box m={m.dark} p={[r.w / 2 - 0.36, 0.62, r.d * 0.3 + 0.75]} s={[0.6, 1.24, 0.6]} />
          <Box m={m.marble} p={[-0.1, 0.45, 0.9]} s={[1.9, 0.9, 0.8]} />
          <Box m={m.dark} p={[-0.1, 0.2, 0.9]} s={[1.7, 0.4, 0.6]} />
          <Box m={m.oak} p={[-0.2, 0.38, -1.0]} s={[1.9, 0.06, 0.9]} />
          <Box m={m.dark} p={[-0.2, 0.18, -1.0]} s={[1.2, 0.36, 0.1]} />
          {[-0.85, -0.2, 0.45].flatMap((x) => [-1.62, -0.38].map((z) => <Box key={`${x}${z}`} m={m.fabric} p={[x, 0.22, z]} s={[0.42, 0.44, 0.42]} />))}
          {[-0.5, 0.3].map((x) => <mesh key={x} material={m.lamp} position={[x, 1.2, 0.9]}><sphereGeometry args={[0.08, 10, 10]} /></mesh>)}
        </group>
      );
    case 'bedroom': {
      const bw = Math.min(1.9, r.w * 0.5);
      return (
        <group position={[cx, 0, cz]}>
          <Box m={m.rug} p={[0, 0.03, 0.1]} s={[bw + 1, 0.02, 2]} shadow={false} />
          <Box m={m.oak} p={[0, 0.14, 0.2]} s={[bw + 0.1, 0.28, 2.05]} />
          <Box m={m.bed} p={[0, 0.36, 0.25]} s={[bw, 0.2, 1.9]} />
          <Box m={m.fabricDark} p={[0, 0.48, -0.45]} s={[bw + 0.02, 0.06, 0.7]} />
          <Box m={m.fabric} p={[0, 0.5, r.d / 2 - 0.2 < 1.3 ? 1.15 : 1.22]} s={[bw + 0.3, 1.0, 0.1]} />
          {[-1, 1].map((s) => (
            <group key={s} position={[s * (bw / 2 + 0.35), 0, 0.95]}>
              <Box m={m.oak} p={[0, 0.2, 0]} s={[0.45, 0.4, 0.4]} />
              <mesh material={m.lamp} position={[0, 0.55, 0]}><sphereGeometry args={[0.09, 10, 10]} /></mesh>
            </group>
          ))}
          <Box m={m.oak} p={[-r.w / 2 + 0.38, 0.6, -r.d / 2 + 0.9]} s={[0.55, 1.2, Math.min(1.6, r.d * 0.4)]} />
        </group>
      );
    }
    case 'bath':
      return (
        <group position={[cx, 0, cz]}>
          <mesh material={m.marble} position={[0, 0.3, r.d * 0.2]} scale={[1, 0.5, 0.48]} castShadow><capsuleGeometry args={[0.36, Math.min(0.9, r.w * 0.3), 6, 14]} /></mesh>
          <Box m={m.oak} p={[0, 0.4, -r.d / 2 + 0.38]} s={[Math.min(1.8, r.w * 0.7), 0.5, 0.5]} />
          <Box m={m.marble} p={[0, 0.67, -r.d / 2 + 0.38]} s={[Math.min(1.84, r.w * 0.72), 0.04, 0.54]} />
          <Box m={m.gold} p={[0, 1.0, -r.d / 2 + 0.12]} s={[Math.min(1.5, r.w * 0.6), 0.5, 0.02]} />
        </group>
      );
    case 'terrace':
      return (
        <group position={[cx, 0, cz]}>
          {[-0.33, -0.2].map((f, i) => (
            <group key={i} position={[r.w * f, 0, 0]}>
              <Box m={m.oak} p={[0, 0.14, 0]} s={[1.7, 0.1, 0.6]} />
              <Box m={m.bed} p={[0, 0.22, 0]} s={[1.6, 0.07, 0.55]} />
            </group>
          ))}
          <Box m={m.oak} p={[r.w * 0.12, 0.36, 0]} s={[1.6, 0.05, 0.8]} />
          <Box m={m.dark} p={[r.w * 0.12, 0.17, 0]} s={[0.1, 0.34, 0.1]} />
          {[-0.5, 0.5].flatMap((x) => [-0.62, 0.62].map((z) => <Box key={`${x}${z}`} m={m.fabric} p={[r.w * 0.12 + x, 0.2, z]} s={[0.4, 0.4, 0.38]} />))}
          <Box m={m.water} p={[r.w * 0.36, 0.06, 0]} s={[2.4, 0.04, 1.1]} shadow={false} />
          {[-0.46, 0.46].map((f) => (
            <group key={f} position={[r.w * f, 0, -r.d * 0.25]}>
              <Box m={m.dark} p={[0, 0.2, 0]} s={[0.4, 0.4, 0.4]} />
              <mesh material={m.plant} position={[0, 0.66, 0]} castShadow><icosahedronGeometry args={[0.36, 1]} /></mesh>
            </group>
          ))}
        </group>
      );
    default:
      return (
        <group position={[cx, 0, cz]}>
          <Box m={m.oak} p={[r.w * 0.2, 0.38, -r.d * 0.2]} s={[0.35, 0.76, Math.min(1.2, r.d * 0.4)]} />
          <mesh material={m.lamp} position={[r.w * 0.2, 0.88, -r.d * 0.2]}><sphereGeometry args={[0.08, 10, 10]} /></mesh>
        </group>
      );
  }
}

/** World-space point above the centre of a room, for hotspots and camera moves. */
export const roomAnchor = (L: Layout, r: Room, y = 1.5): [number, number, number] => [(r.x + r.w / 2 - L.width / 2) * INTERIOR_SCALE, y * INTERIOR_SCALE, (r.z + r.d / 2 - L.depth / 2) * INTERIOR_SCALE];

interface Props {
  layout: LayoutKey;
  night: boolean;
}

/** Cutaway "dollhouse" model of a residence, generated from the same room data that draws the 2D floor plans. */
export default function Interior({ layout, night }: Props) {
  const L = LAYOUTS[layout];
  const m = useInteriorMaterials(night);
  return (
    <group scale={INTERIOR_SCALE} position={[(-L.width / 2) * INTERIOR_SCALE, 0, (-L.depth / 2) * INTERIOR_SCALE]}>
      <Box m={m.base} p={[L.width / 2, -0.16, L.depth / 2]} s={[L.width + 0.5, 0.3, L.depth + 0.5]} />
      <Box m={m.gold} p={[L.width / 2, -0.02, L.depth / 2]} s={[L.width + 0.54, 0.02, L.depth + 0.54]} shadow={false} />
      {L.rooms.map((r) => (
        <group key={r.id}>
          <mesh material={m.floor[r.type]} position={[r.x + r.w / 2, 0.005, r.z + r.d / 2]} receiveShadow><boxGeometry args={[r.w, 0.03, r.d]} /></mesh>
          <EdgeWall kind={r.edges.n} a={[r.x, r.z]} b={[r.x + r.w, r.z]} m={m} />
          <EdgeWall kind={r.edges.s} a={[r.x, r.z + r.d]} b={[r.x + r.w, r.z + r.d]} m={m} />
          <EdgeWall kind={r.edges.w} a={[r.x, r.z]} b={[r.x, r.z + r.d]} m={m} />
          <EdgeWall kind={r.edges.e} a={[r.x + r.w, r.z]} b={[r.x + r.w, r.z + r.d]} m={m} />
          <Furniture r={r} m={m} />
          {night && (r.type === 'living' || r.type === 'kitchen' || r.id === 'bed1') && (
            <pointLight position={[r.x + r.w / 2, 1.5, r.z + r.d / 2]} intensity={5} distance={7} color="#ffc98a" />
          )}
        </group>
      ))}
    </group>
  );
}
