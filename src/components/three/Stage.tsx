'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { ReactNode, Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { ModelConfig, Unit } from '@/lib/types';
import { SceneLights, Site, useBuildingMaterials } from './common';
import Tower, { towerHeight } from './Tower';
import Villa from './Villa';

export type Vec3 = [number, number, number];
export interface View { position: Vec3; target: Vec3 }

/** Default framing for each model type, scaled to its height. */
export function defaultView(model: ModelConfig): View {
  if (model.kind === 'villa') return { position: [9.5, 5.2, 12.5], target: [0, 1.2, 0.4] };
  const h = towerHeight(model.floors ?? 22);
  return { position: [h * 1.05 + 4, h * 0.62, h * 1.25 + 5], target: [0, h * 0.46, 0] };
}

interface ExteriorProps {
  model: ModelConfig;
  night: boolean;
  units?: Unit[];
  interactive?: boolean;
  selectedFloor?: number | null;
  selectedUnit?: number | null;
  showAvailability?: boolean;
  onSelectUnit?: (unit: Unit) => void;
  onSelectLevel?: (level: number) => void;
}

/** A building on its landscaped plinth. Shared by the hero, the viewer and the image renderer. */
export function Exterior({ model, night, units, interactive, selectedFloor, selectedUnit, showAvailability, onSelectUnit, onSelectLevel }: ExteriorProps) {
  const m = useBuildingMaterials(night, model.accent);
  return (
    <group>
      <Site m={m} night={night} palms={model.kind === 'villa'} radius={model.kind === 'villa' ? 9.5 : 10} plaza={model.kind === 'villa' ? 7.4 : 4.6} />
      {model.kind === 'villa' ? (
        <group position={[0, -0.05, 0]}><Villa m={m} interactive={interactive} selectedLevel={selectedFloor} onSelectLevel={onSelectLevel} /></group>
      ) : (
        <Tower floors={model.floors} variant={model.variant} m={m} units={units} interactive={interactive} selectedFloor={selectedFloor} selectedUnit={selectedUnit} showAvailability={showAvailability} onSelectUnit={onSelectUnit} />
      )}
    </group>
  );
}

/** Orbit controls plus GSAP-driven camera moves whenever `view` changes. */
export function CameraRig({ view, zoom = true, autoRotate = false, minDistance = 5, maxDistance = 46, duration = 1.6, apiRef, shift = 0, shiftY = 0 }: {
  view: View; zoom?: boolean; autoRotate?: boolean; minDistance?: number; maxDistance?: number; duration?: number;
  /** Horizontal offset in pixels: moves the scene left so it clears an overlay panel on the right. */
  shift?: number;
  /** Vertical offset as a fraction of the canvas height: moves the scene up to clear a bottom sheet. */
  shiftY?: number;
  apiRef?: React.MutableRefObject<{ dolly: (factor: number) => void } | null>;
}) {
  const controls = useRef<OrbitControlsImpl>(null);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const shiftState = useRef({ v: 0, y: 0 });
  const first = useRef(true);
  // Portrait canvases see less horizontally, so the camera backs away to keep the model in frame.
  const aspect = size.width / Math.max(size.height, 1);
  const fit = aspect < 1.15 ? Math.min(2.3, 1.15 / aspect) : 1;
  const position: Vec3 = [
    view.target[0] + (view.position[0] - view.target[0]) * fit,
    view.target[1] + (view.position[1] - view.target[1]) * fit,
    view.target[2] + (view.position[2] - view.target[2]) * fit,
  ];
  const key = position.map((n) => n.toFixed(2)).join() + view.target.join();

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    if (first.current) {
      first.current = false;
      camera.position.set(...position);
      c.target.set(...view.target);
      c.update();
      return;
    }
    const tweens = [
      gsap.to(camera.position, { x: position[0], y: position[1], z: position[2], duration, ease: 'power3.inOut', onUpdate: () => c.update() }),
      gsap.to(c.target, { x: view.target[0], y: view.target[1], z: view.target[2], duration, ease: 'power3.inOut' }),
    ];
    return () => tweens.forEach((t) => t.kill());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const apply = () => {
      const { v, y } = shiftState.current;
      if (Math.abs(v) < 0.5 && Math.abs(y) < 0.002) cam.clearViewOffset();
      else cam.setViewOffset(size.width, size.height, v, y * size.height, size.width, size.height);
    };
    const tween = gsap.to(shiftState.current, { v: shift, y: shiftY, duration: 0.9, ease: 'power3.out', onUpdate: apply });
    apply();
    return () => { tween.kill(); };
  }, [shift, shiftY, size, camera]);

  useEffect(() => {
    if (!apiRef) return;
    apiRef.current = {
      dolly: (factor) => {
        const c = controls.current;
        if (!c) return;
        const offset = camera.position.clone().sub(c.target);
        const len = THREE.MathUtils.clamp(offset.length() * factor, minDistance, maxDistance);
        const next = c.target.clone().add(offset.setLength(len));
        gsap.to(camera.position, { x: next.x, y: next.y, z: next.z, duration: 0.7, ease: 'power2.out', onUpdate: () => c.update() });
      },
    };
  }, [apiRef, camera, minDistance, maxDistance]);

  return (
    <OrbitControls
      ref={controls} makeDefault enablePan={false} enableZoom={zoom} enableDamping dampingFactor={0.07}
      autoRotate={autoRotate} autoRotateSpeed={0.55} minDistance={minDistance} maxDistance={maxDistance * fit}
      minPolarAngle={0.25} maxPolarAngle={Math.PI / 2 - 0.04}
    />
  );
}

/** Canvas with the renderer settings every scene on the site shares. */
export function SceneCanvas({ children, night, transparent = false, fov = 32, className }: { children: ReactNode; night: boolean; transparent?: boolean; fov?: number; className?: string }) {
  return (
    <Canvas
      className={className} shadows dpr={[1, 1.75]} camera={{ fov, near: 0.5, far: 220, position: [14, 8, 18] }}
      gl={{ antialias: true, alpha: transparent, preserveDrawingBuffer: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; }}
    >
      <Suspense fallback={null}>
        <SceneLights night={night} backdrop={!transparent} />
        {children}
      </Suspense>
    </Canvas>
  );
}
