import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import SmoothScroll from '@/components/layout/SmoothScroll';
import WhatsAppFab from '@/components/layout/WhatsAppFab';
import CompareBar from '@/components/property/CompareBar';
import { getContent } from '@/lib/repo';

export const dynamic = 'force-dynamic';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const content = getContent();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-gold focus:px-4 focus:py-2 focus:text-ink">Skip to content</a>
      <SmoothScroll />
      <Navbar />
      <main id="main">{children}</main>
      <Footer content={content} />
      <CompareBar />
      <WhatsAppFab number={content['contact.whatsapp'] ?? ''} />
    </>
  );
}
