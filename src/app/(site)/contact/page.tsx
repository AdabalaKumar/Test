import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { WhatsAppIcon } from '@/components/layout/WhatsAppFab';
import { whatsappLink } from '@/lib/whatsapp';
import EnquiryForm from '@/components/property/EnquiryForm';
import MapEmbed from '@/components/property/MapEmbed';
import PageHeader from '@/components/ui/PageHeader';
import Reveal from '@/components/ui/Reveal';
import { getContent } from '@/lib/repo';

export const metadata = { title: 'Contact Us' };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ unit?: string }> }) {
  const content = getContent();
  const unit = (await searchParams).unit?.slice(0, 120);
  const rows = [
    [Phone, 'Call', content['contact.phone'], `tel:${content['contact.phone']?.replace(/\s/g, '')}`],
    [Mail, 'Email', content['contact.email'], `mailto:${content['contact.email']}`],
    [MapPin, 'Visit', content['contact.address'], undefined],
    [Clock, 'Hours', content['contact.hours'], undefined],
  ] as const;
  return (
    <>
      <PageHeader eyebrow="Contact us" title="Begin with a conversation" lede="Visit the Aurelia Gallery in Downtown Dubai, or tell us what you are looking for and a residence advisor will be in touch within one business day." />
      <section className="shell grid gap-12 py-16 lg:grid-cols-[1fr_1.15fr] lg:gap-20 lg:py-24">
        <Reveal>
          <ul className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {rows.map(([Icon, label, value, href]) => (
              <li key={label} className="flex gap-6 py-7">
                <Icon size={20} strokeWidth={1.2} className="mt-1 shrink-0 text-gold" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide2 text-ivory/40">{label}</p>
                  {href ? <a href={href} className="link-underline mt-1.5 inline-block font-serif text-2xl" dir="ltr">{value}</a> : <p className="mt-1.5 max-w-sm font-serif text-xl leading-snug">{value}</p>}
                </div>
              </li>
            ))}
          </ul>
          <a href={whatsappLink(content['contact.whatsapp'] ?? '', unit ? `Hello, I am interested in ${unit}.` : 'Hello Aurelia Estates, I would like to speak to an advisor.')} target="_blank" rel="noopener noreferrer"
            className="btn mt-8 w-full border border-[#1f8f5f]/60 text-[#5fd3a0] hover:bg-[#1f8f5f] hover:text-white sm:w-auto"><WhatsAppIcon size={16} /> Chat on WhatsApp</a>
        </Reveal>
        <Reveal delay={0.1} className="card p-7 sm:p-10">
          <p className="eyebrow">Enquiry</p>
          <h2 className="mb-7 mt-2 font-serif text-3xl font-light">{unit ? `Enquire about ${unit}` : 'How can we help?'}</h2>
          <EnquiryForm type={unit ? 'enquiry' : 'contact'} allowViewing={!!unit} defaultMessage={unit ? `I would like more information about ${unit}.` : ''} />
        </Reveal>
      </section>
      <section className="shell pb-24"><MapEmbed lat={25.1972} lng={55.2744} zoom={15} label="Aurelia Gallery, Downtown Dubai" className="h-[460px]" /></section>
    </>
  );
}
