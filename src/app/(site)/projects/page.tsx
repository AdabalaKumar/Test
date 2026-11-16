import { ProjectShowcase } from '@/components/home/HomeSections';
import { MasterPlanViewer, ViewerSkeleton } from '@/components/three/Viewer3D';
import LazyMount from '@/components/ui/LazyMount';
import PageHeader from '@/components/ui/PageHeader';
import { SectionHeading } from '@/components/ui/Reveal';
import { listProjects } from '@/lib/repo';

export const metadata = { title: 'Projects' };

export default function ProjectsPage() {
  const projects = listProjects();
  return (
    <>
      <PageHeader eyebrow="Our developments" title="Four addresses. Each one singular." lede="We build slowly and in small numbers. Every Aurelia development begins with the site, and ends with a building that could only stand there." image="/images/masterplan-dusk.jpg" />
      <section className="shell py-20 lg:py-32"><ProjectShowcase projects={projects} /></section>
      <section className="border-t border-white/[0.07] bg-ink-800 py-20 lg:py-28">
        <div className="shell"><SectionHeading eyebrow="Interactive master plan" title="See how they sit together" lede="Orbit the district model and select a development to fly in." /></div>
        <LazyMount className="shell mt-12 h-[74svh] min-h-[540px]" placeholder={<ViewerSkeleton label="Loading master plan" />}><MasterPlanViewer projects={projects} /></LazyMount>
      </section>
    </>
  );
}
