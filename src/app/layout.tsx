import '@fontsource/cormorant-garamond/300.css';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/300-italic.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource-variable/manrope';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'Aurelia Estates — Luxury Residences in Dubai', template: '%s — Aurelia Estates' },
  description: 'Penthouses, residences and beachfront villas in Dubai’s most coveted addresses. Explore every home in interactive 3D.',
};
export const viewport: Viewport = { themeColor: '#0d0d0f', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
