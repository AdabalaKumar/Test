import ToursClient from '@/components/three/ToursClient';
import Reveal from '@/components/ui/Reveal';
import { listProjects } from '@/lib/repo';

export const metadata = { title: '3D Virtual Tours' };

export default function ToursPage() {
  return (
    <>
      <header className="shell pb-10 pt-32 lg:pt-40">
        <Reveal>
          <p className="eyebrow flex items-center gap-4"><span className="h-px w-10 bg-gold" />3D virtual tours</p>
          <h1 className="mt-5 font-serif text-[clamp(2.2rem,4.6vw,4rem)] font-light leading-[1.05]">Every building. Every floor. Every room.</h1>
        </Reveal>
      </header>
      <ToursClient projects={listProjects()} />
    </>
  );
}
