import { Suspense } from 'react';
import PropertiesExplorer from '@/components/property/PropertiesExplorer';
import PageHeader from '@/components/ui/PageHeader';
import { listProperties } from '@/lib/repo';

export const metadata = { title: 'Properties' };

export default function PropertiesPage() {
  const properties = listProperties();
  return (
    <>
      <PageHeader eyebrow="The collection" title="Residences, penthouses and villas" lede={`${properties.length} homes across four addresses. Filter by type, location and price, save your favourites, and compare up to three side by side.`} />
      <section className="shell py-14 lg:py-20">
        <Suspense><PropertiesExplorer properties={properties} /></Suspense>
      </section>
    </>
  );
}
