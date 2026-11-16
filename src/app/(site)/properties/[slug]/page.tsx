import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MapEmbed from '@/components/property/MapEmbed';
import PropertyDetail from '@/components/property/PropertyDetail';
import { getContent, getProject, getProperty, listProperties } from '@/lib/repo';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProperty((await params).slug);
  return p ? { title: p.title, description: p.tagline, openGraph: { images: p.images.slice(0, 1) } } : { title: 'Property not found' };
}

export default async function PropertyPage({ params }: Props) {
  const p = getProperty((await params).slug);
  if (!p) notFound();
  const related = listProperties().filter((r) => r.id !== p.id && (r.community === p.community || r.type === p.type)).slice(0, 3);
  return (
    <PropertyDetail
      p={p} project={getProject(p.projectSlug)} related={related} whatsapp={getContent()['contact.whatsapp'] ?? ''}
      map={<MapEmbed lat={p.lat} lng={p.lng} label={p.title} className="h-[440px]" />}
    />
  );
}
