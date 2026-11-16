import Image from 'next/image';
import Link from 'next/link';
import { Stats } from '@/components/home/HomeSections';
import PageHeader from '@/components/ui/PageHeader';
import Reveal, { SectionHeading } from '@/components/ui/Reveal';
import { getContent } from '@/lib/repo';

export const metadata = { title: 'About Us' };

const VALUES = [
  ['Site first', 'Every project starts with a year of studying the plot: its light, its wind, its neighbours. The building comes second.'],
  ['Fewer, better', 'We limit ourselves to a handful of developments at a time so that the founders can walk every floor before handover.'],
  ['Made by hand', 'Stone is selected slab by slab in Carrara. Joinery is built in our own workshop in Al Quoz.'],
  ['After the keys', 'Aurelia Residence Services manages each building for life, with the same team that built it.'],
];
const TIMELINE = [
  ['2008', 'Founded in Dubai by two architects and a stonemason.'], ['2013', 'First tower completed in Business Bay; sold out before topping out.'],
  ['2019', 'Palm Crest Villas begins on the western crescent.'], ['2024', 'Named Developer of the Year at the Gulf Property Awards.'],
  ['2026', 'Sahara Terraces handed over; Marina Helix launched.'],
];
const TEAM = [['Nadia Al Rahman', 'Founder & Chief Executive'], ['Tomás Ferreira', 'Design Director'], ['Hana Okafor', 'Head of Residences'], ['Elias Brandt', 'Construction Director']];

export default function AboutPage() {
  const content = getContent();
  return (
    <>
      <PageHeader eyebrow="About Aurelia" title={content['about.headline']} image="/images/aurelia-tower-dusk.jpg" />
      <section className="shell grid gap-14 py-20 lg:grid-cols-2 lg:gap-24 lg:py-32">
        <Reveal>
          <p className="eyebrow">Our story</p>
          <p className="mt-6 font-serif text-[clamp(1.4rem,2.3vw,2rem)] font-light leading-relaxed text-ivory/90">{content['about.body']}</p>
          <p className="lede mt-8">We have never built more than four projects at once. That restraint is the point: it lets the same small team choose the stone, draw the joinery, and stand behind the building twenty years later.</p>
          <Link href="/projects" className="btn-outline mt-10">See our developments</Link>
        </Reveal>
        <Reveal delay={0.15} className="relative aspect-[4/5] overflow-hidden">
          <Image src="/images/palm-crest-close.jpg" alt="Palm Crest villa, detail of the cantilevered terrace" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
        </Reveal>
      </section>
      <Stats content={content} />
      <section className="shell py-20 lg:py-32">
        <SectionHeading eyebrow="How we work" title="Four principles we do not negotiate" />
        <div className="mt-14 grid gap-px bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(([h, d], i) => (
            <Reveal key={h} delay={i * 0.08} className="bg-ink p-8 transition-colors duration-500 hover:bg-ink-800">
              <p className="font-serif text-5xl font-light text-gold/40">0{i + 1}</p>
              <h3 className="mt-8 font-serif text-2xl">{h}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ivory/55">{d}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="border-y border-white/[0.07] bg-ink-800 py-20 lg:py-28">
        <div className="shell grid gap-14 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeading eyebrow="Milestones" title="Eighteen years, told briefly" />
          <ol className="relative border-l border-white/10 pl-8">
            {TIMELINE.map(([y, d], i) => (
              <Reveal as="li" key={y} delay={i * 0.06} className="relative pb-10 last:pb-0">
                <span className="absolute -left-[37px] top-2 h-2.5 w-2.5 rotate-45 bg-gold" />
                <p className="font-serif text-3xl text-gold">{y}</p>
                <p className="mt-2 text-ivory/70">{d}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
      <section className="shell py-20 lg:py-32">
        <SectionHeading eyebrow="Leadership" title="The people who sign the drawings" />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map(([name, role], i) => (
            <Reveal key={name} delay={i * 0.08}>
              <div className="flex aspect-[4/5] items-end bg-gradient-to-br from-ink-600 to-ink-800 p-6 ring-1 ring-inset ring-white/[0.07]">
                <span className="font-serif text-7xl font-light text-gold/30">{name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</span>
              </div>
              <h3 className="mt-5 font-serif text-2xl">{name}</h3>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wide2 text-gold">{role}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
