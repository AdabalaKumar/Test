import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import EnquiryForm from '@/components/property/EnquiryForm';
import Gallery from '@/components/property/Gallery';
import MapEmbed from '@/components/property/MapEmbed';
import PropertyCard from '@/components/property/PropertyCard';
import { PropertyViewer, ViewerSkeleton } from '@/components/three/Viewer3D';
import LazyMount from '@/components/ui/LazyMount';
import PageHeader from '@/components/ui/PageHeader';
import Reveal, { SectionHeading } from '@/components/ui/Reveal';
import { getProject, listProperties, listUnits } from '@/lib/repo';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProject((await params).slug);
  return p ? { title: p.name, description: p.tagline } : { title: 'Project not found' };
}

export default async function ProjectPage({ params }: Props) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const properties = listProperties({ project: project.slug });
  const units = listUnits(project.slug);
  const available = units.filter((u) => u.status === 'available').length;
  const facts = [
    ['Location', project.location], ['Status', project.status], ['Completion', project.completion],
    units.length ? ['Availability', `${available} of ${units.length} residences`] : ['Residences', project.highlights[0] ?? '—'],
  ];
  return (
    <>
      <PageHeader eyebrow={`${project.location} · ${project.status}`} title={project.name} lede={project.tagline} image={project.images[0]} />
      <section className="shell grid gap-14 py-20 lg:grid-cols-[1.2fr_1fr] lg:py-28">
        <Reveal>
          <p className="font-serif text-[clamp(1.4rem,2.3vw,2rem)] font-light leading-relaxed text-ivory/90">{project.description}</p>
          <ul className="mt-10 grid gap-x-10 sm:grid-cols-2">
            {project.highlights.map((h) => <li key={h} className="flex items-center gap-4 border-b border-white/[0.06] py-4 text-sm text-ivory/80"><span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" />{h}</li>)}
          </ul>
        </Reveal>
        <Reveal delay={0.1}>
          <dl className="grid grid-cols-2 gap-px bg-white/[0.07]">
            {facts.map(([k, v]) => <div key={k} className="bg-ink px-6 py-7"><dt className="text-[9px] font-medium uppercase tracking-wide2 text-ivory/40">{k}</dt><dd className="mt-2 font-serif text-xl">{v}</dd></div>)}
          </dl>
        </Reveal>
      </section>

      <section className="border-y border-white/[0.07] bg-ink-800 py-20 lg:py-28">
        <div className="shell"><SectionHeading eyebrow="Interactive 3D" title="Choose your residence" lede="Rotate the building, pick a floor and select a residence to see its size, view, price and availability." /></div>
        <LazyMount className="shell mt-12 h-[80svh] min-h-[560px]" placeholder={<ViewerSkeleton />}>
          <PropertyViewer model={project.model} projectSlug={project.slug} projectName={project.name} layout={project.model.kind === 'villa' ? 'three' : 'two'} />
        </LazyMount>
      </section>

      <section className="shell py-20 lg:py-28">
        <SectionHeading eyebrow="Gallery" title="Renders from the model" />
        <div className="mt-12"><Gallery images={project.images} title={project.name} /></div>
      </section>

      {properties.length > 0 && (
        <section className="shell pb-20 lg:pb-28">
          <SectionHeading eyebrow="Residences" title={`Homes at ${project.name}`} />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{properties.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
        </section>
      )}

      <section className="border-t border-white/[0.07] bg-ink-800">
        <div className="shell grid gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <SectionHeading eyebrow="Location" title={project.location} />
            <MapEmbed lat={project.lat} lng={project.lng} label={project.name} className="mt-10 h-[420px]" />
          </div>
          <div className="card p-7 sm:p-10">
            <p className="eyebrow">Register your interest</p>
            <h2 className="mb-7 mt-2 font-serif text-3xl font-light">Request the {project.name} brochure</h2>
            <EnquiryForm defaultMessage={`Please send me the brochure and availability for ${project.name}.`} />
            <Link href="/projects" className="btn-ghost mt-6 text-[10px]">← All projects</Link>
          </div>
        </div>
      </section>
    </>
  );
}
