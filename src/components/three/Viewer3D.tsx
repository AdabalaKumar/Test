'use client';

import dynamic from 'next/dynamic';

export const ViewerSkeleton = ({ label = 'Loading 3D experience' }: { label?: string }) => (
  <div className="skeleton flex h-full min-h-[420px] w-full items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <span className="h-10 w-10 animate-spin rounded-full border border-gold/20 border-t-gold" />
      <span className="text-[10px] font-semibold uppercase tracking-luxe text-ivory/50">{label}</span>
    </div>
  </div>
);

/** Client-only entry points: WebGL scenes are never rendered on the server. */
export const PropertyViewer = dynamic(() => import('./PropertyViewer'), { ssr: false, loading: () => <ViewerSkeleton /> });
export const MasterPlanViewer = dynamic(() => import('./MasterPlanViewer'), { ssr: false, loading: () => <ViewerSkeleton label="Loading master plan" /> });
export const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false, loading: () => null });
