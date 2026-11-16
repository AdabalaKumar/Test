'use client';

import { Environment, Lightformer, Stars } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

import { STATUS_COLOR } from '@/lib/status';

export { STATUS_COLOR };

/** Stable pseudo-random in [0,1) for procedural detail that must not change between renders. */
export function rnd(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const SKY = {
  day: { top: '#5b8cc2', mid: '#ece4d8', bottom: '#c9bda8' },
  night: { top: '#05070d', mid: '#2b2230', bottom: '#0d0d0f' },
};

/** Gradient sky dome: cheaper and more art-directable than a physical sky model. */
export function SkyDome({ night, radius = 90 }: { night: boolean; radius?: number }) {
  const material = useMemo(() => {
    const c = night ? SKY.night : SKY.day;
    return new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: new THREE.Color(c.top) }, mid: { value: new THREE.Color(c.mid) }, bottom: { value: new THREE.Color(c.bottom) } },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; varying vec3 vP;
        void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(mid, top, smoothstep(0.0, 0.75, h)) : mix(mid, bottom, clamp(-h*4.0,0.0,1.0));
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
        }`,
    });
  }, [night]);
  return (
    <mesh material={material} renderOrder={-10}>
      <sphereGeometry args={[radius, 32, 16]} />
    </mesh>
  );
}

/** Lighting rig plus a self-contained reflection environment (no HDR downloads). */
export function SceneLights({ night, backdrop = true, shadowSize = 14 }: { night: boolean; backdrop?: boolean; shadowSize?: number }) {
  return (
    <>
      {backdrop && <SkyDome night={night} />}
      {backdrop && <fog attach="fog" args={[night ? '#15121a' : '#e9dfd0', 38, 95]} />}
      {night ? (
        <>
          {backdrop && <Stars radius={70} depth={20} count={1800} factor={3} saturation={0} fade speed={0.4} />}
          <ambientLight intensity={0.5} color="#8ea2d0" />
          <directionalLight position={[-9, 12, -6]} intensity={0.75} color="#9db4e8" />
          <pointLight position={[0, 1.2, 5.5]} intensity={22} distance={16} color="#ffc27a" />
          <pointLight position={[-5, 1, -4]} intensity={12} distance={14} color="#ffb060" />
        </>
      ) : (
        <>
          <hemisphereLight args={['#dfeaff', '#a8957a', 0.6]} />
          <directionalLight
            position={[9, 15, 7]} intensity={2.7} color="#fff3df" castShadow
            shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.03}
            shadow-camera-left={-shadowSize} shadow-camera-right={shadowSize} shadow-camera-top={shadowSize} shadow-camera-bottom={-shadowSize} shadow-camera-far={50}
          />
        </>
      )}
      <Environment key={night ? 'n' : 'd'} resolution={256} frames={1} environmentIntensity={night ? 0.55 : 1}>
        <SkyDome night={night} radius={40} />
        {night ? (
          <>
            <Lightformer form="rect" intensity={2.2} color="#ffb870" position={[0, 1, 12]} scale={[18, 1.2, 1]} />
            <Lightformer form="rect" intensity={1.2} color="#7f9cff" position={[-12, 8, -4]} rotation-y={Math.PI / 2} scale={[14, 6, 1]} />
            <Lightformer form="ring" intensity={1.5} color="#ffd6a0" position={[10, 6, 6]} scale={3} />
          </>
        ) : (
          <>
            <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 14, 0]} rotation-x={Math.PI / 2} scale={[20, 20, 1]} />
            <Lightformer form="rect" intensity={2.2} color="#fff1d6" position={[12, 5, 6]} rotation-y={-Math.PI / 2} scale={[16, 8, 1]} />
            <Lightformer form="rect" intensity={1} color="#cfe3ff" position={[-12, 5, -6]} rotation-y={Math.PI / 2} scale={[16, 8, 1]} />
          </>
        )}
      </Environment>
    </>
  );
}

/** Curtain-wall texture pair: mullion grid for colour, randomly lit panes for night emission. */
export function useFacadeTextures() {
  return useMemo(() => {
    const make = (lit: boolean) => {
      const c = document.createElement('canvas');
      c.width = 256; c.height = 64;
      const g = c.getContext('2d')!;
      g.fillStyle = lit ? '#000' : '#fff';
      g.fillRect(0, 0, 256, 64);
      for (let i = 0; i < 8; i++) {
        if (lit) {
          const v = rnd(i * 3.7 + 1);
          g.fillStyle = v > 0.3 ? `rgba(255,${190 + Math.round(v * 40)},${120 + Math.round(v * 50)},${0.35 + v * 0.65})` : 'rgba(255,200,140,0.06)';
          g.fillRect(i * 32 + 2, 10, 28, 50);
        } else {
          g.fillStyle = '#2a2d31';
          g.fillRect(i * 32, 0, 2, 64);
        }
      }
      g.fillStyle = lit ? '#000' : '#3a3d42';
      g.fillRect(0, 0, 256, 8);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      return t;
    };
    return { map: make(false), lit: make(true) };
  }, []);
}

export function useBuildingMaterials(night: boolean, accent = '#c9a96e') {
  const tex = useFacadeTextures();
  return useMemo(() => {
    const glass = [0.12, 1.0, 2.1].map((e) => new THREE.MeshPhysicalMaterial({
      color: night ? '#141b24' : '#56758c', metalness: 0.9, roughness: 0.1, map: tex.map, envMapIntensity: night ? 0.8 : 1.5,
      emissive: new THREE.Color('#ffc480'), emissiveMap: tex.lit, emissiveIntensity: night ? e : 0,
    }));
    const flat = (color: string, o: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...o });
    const glow = (color: string, intensity: number) => flat(color, { emissive: new THREE.Color(color), emissiveIntensity: intensity, roughness: 0.4 });
    return {
      glass,
      plainGlass: new THREE.MeshPhysicalMaterial({ color: night ? '#1a222c' : '#88a6ba', metalness: 0.9, roughness: 0.08, envMapIntensity: night ? 0.8 : 1.5, emissive: new THREE.Color('#ffc480'), emissiveIntensity: night ? 0.9 : 0 }),
      ghost: new THREE.MeshStandardMaterial({ color: '#9fb0c2', transparent: true, opacity: 0.13, depthWrite: false, roughness: 0.4 }),
      ghostSlab: new THREE.MeshStandardMaterial({ color: '#e8e2d8', transparent: true, opacity: 0.2, depthWrite: false }),
      hover: glow('#e2cb9d', 0.75),
      selected: glow('#f0d9a8', 1.3),
      status: { available: glow(STATUS_COLOR.available, 0.55), reserved: glow(STATUS_COLOR.reserved, 0.55), sold: glow(STATUS_COLOR.sold, 0.5) },
      slab: flat(night ? '#8d8a86' : '#f1ece3', { roughness: 0.8 }),
      rail: new THREE.MeshPhysicalMaterial({ color: '#cfe0ea', transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.2, depthWrite: false }),
      gold: new THREE.MeshStandardMaterial({ color: accent, metalness: 1, roughness: 0.28, envMapIntensity: 1.6, emissive: new THREE.Color(accent), emissiveIntensity: night ? 0.18 : 0 }),
      goldGlow: glow(accent, night ? 2.2 : 0.3),
      dark: flat(night ? '#17171a' : '#3b3835', { roughness: 0.6 }),
      stone: flat(night ? '#6e6a64' : '#e4ddd0'),
      wood: flat(night ? '#4a3626' : '#8a6642', { roughness: 0.65 }),
      water: new THREE.MeshPhysicalMaterial({ color: night ? '#16546e' : '#3fa7c4', roughness: 0.06, metalness: 0.3, envMapIntensity: 2, emissive: new THREE.Color('#2bb8e0'), emissiveIntensity: night ? 0.5 : 0.05 }),
      lawn: flat(night ? '#2b4034' : '#5f7648', { roughness: 1 }),
      leaf: flat(night ? '#2c4a34' : '#3f6238', { roughness: 0.9 }),
      trunk: flat(night ? '#2d241c' : '#6d5540'),
      lamp: glow('#ffd9a0', night ? 3 : 0),
    };
  }, [night, accent, tex]);
}
export type BuildingMaterials = ReturnType<typeof useBuildingMaterials>;

export function Tree({ position, scale = 1, m, palm = false, seed = 1 }: { position: [number, number, number]; scale?: number; m: BuildingMaterials; palm?: boolean; seed?: number }) {
  if (palm) {
    return (
      <group position={position} scale={scale} rotation-y={seed * 2.3}>
        <mesh material={m.trunk} position={[0, 0.8, 0]} rotation-z={0.06} castShadow><cylinderGeometry args={[0.045, 0.07, 1.6, 6]} /></mesh>
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} material={m.leaf} position={[Math.cos((i / 7) * 6.283) * 0.33, 1.56, Math.sin((i / 7) * 6.283) * 0.33]} rotation={[0, -(i / 7) * 6.283, -0.5]} scale={[1, 0.12, 0.34]} castShadow>
            <sphereGeometry args={[0.42, 8, 6]} />
          </mesh>
        ))}
      </group>
    );
  }
  return (
    <group position={position} scale={scale}>
      <mesh material={m.trunk} position={[0, 0.3, 0]} castShadow><cylinderGeometry args={[0.035, 0.05, 0.6, 6]} /></mesh>
      <mesh material={m.leaf} position={[0, 0.82, 0]} scale={[1, 1.15 + rnd(seed) * 0.3, 1]} castShadow><icosahedronGeometry args={[0.36, 1]} /></mesh>
    </group>
  );
}

/** The presentation plinth every exterior model sits on: stone base, lawn, plaza, planting and lamps. */
export function Site({ m, night, radius = 10, palms = false, plaza = 4.6 }: { m: BuildingMaterials; night: boolean; radius?: number; palms?: boolean; plaza?: number }) {
  const trees = useMemo(() => Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2 + rnd(i) * 0.25;
    const r = plaza + 1.1 + rnd(i + 40) * (radius - plaza - 2);
    return { p: [Math.cos(a) * r, 0, Math.sin(a) * r] as [number, number, number], s: 0.85 + rnd(i + 9) * 0.6, seed: i };
  }), [radius, plaza]);
  return (
    <group>
      <mesh material={m.dark} position={[0, -0.36, 0]} receiveShadow><cylinderGeometry args={[radius + 0.25, radius + 0.6, 0.5, 72]} /></mesh>
      <mesh material={m.lawn} position={[0, -0.1, 0]} receiveShadow><cylinderGeometry args={[radius, radius, 0.06, 72]} /></mesh>
      <mesh material={m.stone} position={[0, -0.07, 0]} receiveShadow><cylinderGeometry args={[plaza, plaza, 0.07, 64]} /></mesh>
      <mesh material={m.gold} position={[0, -0.075, 0]} rotation-x={-Math.PI / 2}><ringGeometry args={[radius + 0.02, radius + 0.12, 96]} /></mesh>
      {trees.map((t) => <Tree key={t.seed} position={t.p} scale={t.s} m={m} palm={palms && t.seed % 2 === 0} seed={t.seed} />)}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(a) * (plaza + 0.25), -0.03, Math.sin(a) * (plaza + 0.25)]}>
            <mesh material={m.dark} position={[0, 0.12, 0]}><cylinderGeometry args={[0.012, 0.012, 0.24, 5]} /></mesh>
            <mesh material={m.lamp} position={[0, 0.26, 0]}><sphereGeometry args={[0.04, 8, 8]} /></mesh>
          </group>
        );
      })}
      {night && <pointLight position={[0, 0.6, 0]} intensity={6} distance={9} color="#ffcf90" />}
    </group>
  );
}
