import Image from 'next/image';
import Link from 'next/link';
import MapEmbed from '@/components/property/MapEmbed';
import PageHeader from '@/components/ui/PageHeader';
import Reveal from '@/components/ui/Reveal';
import { communities } from '@/data/seed';
import { listProperties } from '@/lib/repo';

export const metadata = { title: 'Our Communities' };

export default function CommunitiesPage() {
  const properties = listProperties();
  return (
    <>
      <PageHeader eyebrow="Our communities" title="Four neighbourhoods, chosen with care" lede="We build only where we would live ourselves. Each of our communities offers something the others cannot." image="/images/masterplan-day.jpg" />
      <div className="divide-y divide-white/[0.07]">
        {communities.map((c, i) => {
          const homes = properties.filter((p) => p.community === c.slug);
          return (
            <section key={c.slug} id={c.slug} className="scroll-mt-24 py-20 lg:py-28">
              <div className={`shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20 ${i % 2 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
                <Reveal className="relative aspect-[5/4] overflow-hidden">
                  <Image src={c.image} alt={c.name} fill sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover" />
                  <span className="absolute left-5 top-5 font-serif text-6xl font-light text-white/30">0{i + 1}</span>
                </Reveal>
                <Reveal delay={0.1}>
                  <p className="eyebrow">{c.blurb}</p>
                  <h2 className="h-section mt-4">{c.name}</h2>
                  <p className="lede mt-6">{c.description}</p>
                  <dl className="mt-9 grid grid-cols-3 gap-px bg-white/[0.07]">
                    {c.stats.map((s) => <div key={s.label} className="bg-ink px-4 py-5"><dd className="font-serif text-2xl text-gold">{s.value}</dd><dt className="mt-1.5 text-[9px] font-medium uppercase tracking-wide2 text-ivory/45">{s.label}</dt></div>)}
                  </dl>
                  <ul className="mt-7 flex flex-wrap gap-2">{c.lifestyle.map((l) => <li key={l} className="chip">{l}</li>)}</ul>
                  <div className="mt-9 flex flex-wrap items-center gap-5">
                    <Link href={`/properties?location=${encodeURIComponent(c.name)}`} className="btn-gold btn-sm">View {homes.length} {homes.length === 1 ? 'residence' : 'residences'}</Link>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`} target="_blank" rel="noopener noreferrer" className="btn-ghost text-[10px]">Open in Google Maps ↗</a>
                  </div>
                </Reveal>
              </div>
            </section>
          );
        })}
      </div>
      <section className="shell pb-24">
        <MapEmbed lat={25.14} lng={55.2} zoom={11} label="Aurelia communities in Dubai" className="h-[480px]" />
      </section>
    </>
  );
}
