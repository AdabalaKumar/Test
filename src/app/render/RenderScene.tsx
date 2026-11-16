'use client';

import { useBuildingMaterials } from '@/components/three/common';
import Interior from '@/components/three/Interior';
import MasterPlan from '@/components/three/MasterPlan';
import { CameraRig, Exterior, SceneCanvas, type Vec3 } from '@/components/three/Stage';
import type { LayoutKey, ModelConfig, Project } from '@/lib/types';

function Plan({ projects, night }: { projects: Project[]; night: boolean }) {
  const m = useBuildingMaterials(night);
  return <MasterPlan projects={projects} m={m} selected={null} onSelect={() => {}} />;
}

export default function RenderScene({ scene, model, projects, night, layout, position, target, fov }: {
  scene: 'exterior' | 'interior' | 'masterplan'; model: ModelConfig; projects: Project[]; night: boolean; layout: LayoutKey; position: Vec3; target: Vec3; fov: number;
}) {
  return (
    <SceneCanvas night={night} fov={fov}>
      {scene === 'exterior' && <Exterior model={model} night={night} />}
      {scene === 'interior' && <Interior layout={layout} night={night} />}
      {scene === 'masterplan' && <Plan projects={projects} night={night} />}
      <CameraRig view={{ position, target }} zoom={false} />
    </SceneCanvas>
  );
}
