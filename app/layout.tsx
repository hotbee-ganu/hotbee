import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import './globals.css';
import { StoreProvider } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';

const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), {
  ssr: false,
});

/**
 * Self-hosted at build time by next/font: no runtime request to
 * fonts.googleapis.com, and `display: swap` means text paints immediately.
 */
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['700', '800'],
  variable: '--font-jakarta',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hotbee.netlify.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'HOTBEE | Premium Print-on-Demand Streetwear',
    template: '%s | HOTBEE',
  },
  description:
    'Heavyweight 240 GSM combed cotton oversized tees, fleece hoodies and accessories. Printed on demand and shipped across India with express delivery.',
  keywords: [
    'HOTBEE',
    'Streetwear India',
    'Oversized Tees',
    'Premium Hoodies',
    'Print on Demand',
    'Qikink',
  ],
  openGraph: {
    title: 'HOTBEE | Premium Print-on-Demand Streetwear',
    description: 'Luxury print-on-demand streetwear and apparel, delivered across India.',
    images: ['/logo-og.jpg'],
    type: 'website',
  },
  formatDetection: { telephone: true },
  other: { 'format-detection': 'telephone=yes' },
};

export const viewport: Viewport = {
  themeColor: '#0a0c10',
  width: 'device-width',
  initialScale: 1,
  // Never block a customer from zooming in on a size chart.
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jakarta.variable}`}>
      <head>
        {/* Warm up image CDN, database, and scripts */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://ughdrvnjkccdtwdoxtrz.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://ughdrvnjkccdtwdoxtrz.supabase.co" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
      </head>
      <body className="bg-hotbee-dark text-gray-100 antialiased min-h-screen flex flex-col selection:bg-hotbee-500 selection:text-black">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-hotbee-500 focus:text-black focus:font-bold focus:text-xs"
        >
          Skip to content
        </a>

        <ThreeBackground />
        <StoreProvider>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <CartDrawer />
          <main id="main-content" className="flex-grow">
            {children}
          </main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
