import type { Metadata } from 'next';
import { Cormorant_Garamond, Jost, Allura } from 'next/font/google';
import './globals.css';
import { SiteProvider } from '@/components/site/SiteProvider';
import { SiteChrome } from '@/components/site/SiteChrome';

const serif = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500'], style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });
const sans = Jost({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-sans', display: 'swap' });
const script = Allura({ subsets: ['latin'], weight: '400', variable: '--font-script', display: 'swap' });

export const metadata: Metadata = {
  title: 'Rupaari — Rediscover Yourself',
  description: 'South Indian silk sarees, for every chapter of you. Kanjivaram, Mysore silk, Kasavu and more — woven by hand.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${script.variable}`}>
      <body>
        <SiteProvider>
          <SiteChrome>{children}</SiteChrome>
        </SiteProvider>
      </body>
    </html>
  );
}
