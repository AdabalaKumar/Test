'use client';

import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { ModelConfig } from '@/lib/types';
import { CameraRig, Exterior, SceneCanvas, View, defaultView } from './Stage';
import { towerHeight } from './Tower';

/** Wider framing than the viewer default so the whole building clears the navigation bar. */
function heroView(model: ModelConfig): View {
  const v = defaultView(model);
  const k = model.kind === 'tower' ? 1.3 : 1.12;
  return { position: [v.position[0] * k, v.position[1] * 0.9, v.position[2] * k], target: [v.target[0], v.target[1] * 1.04, v.target[2]] };
}

/** Cinematic crane move each time the featured model changes: starts low and close, pulls back and up. */
function Intro({ model }: { model: ModelConfig }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const group = useRef<THREE.Group>(null);
  const portrait = size.width < size.height;
  useEffect(() => {
    // On portrait screens the rig's own fit handles framing; the crane move is a desktop flourish.
    if (portrait) return;
    const to = heroView(model).position;
    const tall = model.kind === 'tower' ? towerHeight(model.floors ?? 22) : 3;
    const ctx = gsap.context(() => {
      gsap.fromTo(camera.position, { x: to[0] * 0.42, y: tall * 0.12 + 0.6, z: to[2] * 0.5 }, { x: to[0], y: to[1], z: to[2], duration: 3.6, ease: 'power3.out' });
      if (group.current) {
        gsap.fromTo(group.current.rotation, { y: -0.9 }, { y: 0, duration: 3.6, ease: 'power3.out' });
        gsap.fromTo(group.current.scale, { x: 0.94, y: 0.94, z: 0.94 }, { x: 1, y: 1, z: 1, duration: 2.4, ease: 'power2.out' });
      }
    });
    return () => ctx.revert();
  }, [model, camera, portrait]);
  // A slow vertical drift keeps the frame alive between interactions.
  useFrame(({ clock }) => { if (group.current) group.current.position.y = Math.sin(clock.elapsedTime * 0.35) * 0.06; });
  return <group ref={group}><Exterior model={model} night /></group>;
}

export default function HeroScene({ model }: { model: ModelConfig }) {
  const view = heroView(model);
  return (
    <div className="canvas-wrap h-full w-full cursor-grab active:cursor-grabbing [@media(pointer:coarse)]:pointer-events-none">
      <SceneCanvas night transparent fov={30}>
        <Intro key={`${model.kind}-${model.variant}-${model.floors}`} model={model} />
        <CameraRig view={view} zoom={false} autoRotate duration={0.01} />
      </SceneCanvas>
    </div>
  );
}
