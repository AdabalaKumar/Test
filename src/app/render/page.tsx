import { Suspense } from 'react';
import { listProjects } from '@/lib/repo';
import RenderClient from './RenderClient';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false } };

export default function RenderPage() {
  return <Suspense><RenderClient projects={listProjects()} /></Suspense>;
}
