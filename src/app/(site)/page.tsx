import Hero, { HeroSlide } from '@/components/home/Hero';
import { CommunityGrid, ProjectShowcase, QuickSearch, Stats, THeading, TLink } from '@/components/home/HomeSections';
import EnquiryForm from '@/components/property/EnquiryForm';
import MortgageCalculator from '@/components/property/MortgageCalculator';
import PropertyCard from '@/components/property/PropertyCard';
import { MasterPlanViewer, PropertyViewer, ViewerSkeleton } from '@/components/three/Viewer3D';
import LazyMount from '@/components/ui/LazyMount';
import Reveal from '@/components/ui/Reveal';
import { communities } from '@/data/seed';
import { getContent, listProjects, listProperties } from '@/lib/repo';

export default function HomePage() {
  const content = getContent();
  const projects = listProjects();
  const featured = listProperties({ featured: true });
  const all = listProperties();
  const slides: HeroSlide[] = featured.slice(0, 4).flatMap((property) => {
    const project = projects.find((p) => p.slug === property.projectSlug);
    return project ? [{ property, model: project.model, project: project.name }] : [];
  });
  const showcase = projects.find((p) => p.model.kind === 'tower') ?? projects[0];
  const locations = [...new Set(all.map((p) => p.location))];

  return (
    <>
      <Hero slides={slides} content={content} />
      <QuickSearch locations={locations} />

      <section className="shell py-24 lg:py-36">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="eyebrow">Since 2008</p>
          <p className="mt-8 font-serif text-[clamp(1.7rem,3.4vw,3rem)] font-light leading-[1.25] text-ivory/90">{content['about.headline']}</p>
        </Reveal>
      </section>
      <Stats content={content} />

      <section className="shell py-24 lg:py-36">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <THeading eyebrow="home.featured" title="home.featured.title" />
          <TLink href="/properties" k="cta.viewAll" className="btn-outline btn-sm self-start md:self-auto" />
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {featured.slice(0, 3).map((p, i) => <Reveal key={p.id} delay={i * 0.1} className="h-full"><PropertyCard p={p} /></Reveal>)}
        </div>
      </section>

      {showcase && (
        <section className="border-y border-white/[0.07] bg-ink-800">
          <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)]">
            <div className="flex flex-col justify-center px-5 py-20 sm:px-8 lg:px-14 lg:py-28">
              <THeading eyebrow="home.experience" title="home.experience.title" lede="Every Aurelia home exists as a live 3D model. Rotate the building, lift a floor away, pick a residence and check its availability — then step inside and tour the rooms." />
              <ul className="mt-10 space-y-5">
                {[['360° exterior', 'Orbit and zoom the full building, by day or by night.'], ['Floor by floor', 'Select any level to see which residences are available.'], ['Step inside', 'Walk the interior with room-by-room hotspots and a guided tour.']].map(([h, d], i) => (
                  <Reveal as="li" key={h} delay={i * 0.1} className="flex gap-5 border-t border-white/[0.07] pt-5">
                    <span className="font-serif text-2xl text-gold">0{i + 1}</span>
                    <div><p className="font-serif text-xl">{h}</p><p className="mt-1 text-sm text-ivory/55">{d}</p></div>
                  </Reveal>
                ))}
              </ul>
              <TLink href="/tours" k="cta.tour" className="btn-gold mt-10 self-start" />
            </div>
            <LazyMount className="h-[78svh] min-h-[560px] lg:h-auto lg:min-h-[760px]" placeholder={<ViewerSkeleton />}>
              <PropertyViewer model={showcase.model} projectSlug={showcase.slug} projectName={showcase.name} layout="two" />
            </LazyMount>
          </div>
        </section>
      )}

      <section className="shell py-24 lg:py-36">
        <THeading eyebrow="home.projects" title="home.projects.title" />
        <div className="mt-16 lg:mt-24"><ProjectShowcase projects={projects} /></div>
      </section>

      <section className="border-y border-white/[0.07] bg-ink-800 py-24 lg:py-32">
        <div className="shell"><THeading eyebrow="home.masterplan" title="home.masterplan.title" lede="An interactive model of our four developments. Select a building to fly in and see what is available." align="center" /></div>
        <LazyMount className="shell mt-14 h-[74svh] min-h-[540px]" placeholder={<ViewerSkeleton label="Loading master plan" />}>
          <MasterPlanViewer projects={projects} />
        </LazyMount>
      </section>

      <section className="shell py-24 lg:py-36">
        <THeading eyebrow="home.communities" title="home.communities.title" />
        <div className="mt-14"><CommunityGrid communities={communities} /></div>
      </section>

      <section className="shell pb-24 lg:pb-36">
        <THeading eyebrow="home.mortgage" title="home.mortgage.title" />
        <Reveal className="mt-14"><MortgageCalculator /></Reveal>
      </section>

      <section className="relative overflow-hidden border-t border-white/[0.07] bg-ink-800">
        <div className="absolute inset-0 bg-[radial-gradient(50%_80%_at_15%_50%,rgba(201,169,110,.12),transparent)]" />
        <div className="shell relative grid gap-14 py-24 lg:grid-cols-2 lg:py-32">
          <div className="flex flex-col justify-center">
            <THeading eyebrow="nav.contact" title="home.cta.title" lede="Tell us what you are looking for and a residence advisor will arrange a private appointment at the Aurelia Gallery, or at the residence itself." />
            <dl className="mt-10 grid grid-cols-2 gap-8 border-t border-white/[0.07] pt-8 text-sm">
              <div><dt className="eyebrow">Call</dt><dd className="mt-2 font-serif text-2xl" dir="ltr">{content['contact.phone']}</dd></div>
              <div><dt className="eyebrow">Hours</dt><dd className="mt-2 text-ivory/70">{content['contact.hours']}</dd></div>
            </dl>
          </div>
          <Reveal className="card p-7 sm:p-10"><EnquiryForm type="callback" /></Reveal>
        </div>
      </section>
    </>
  );
}
