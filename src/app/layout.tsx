import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import MobileNav from "@/components/MobileNav";
import SiteFooter from "@/components/SiteFooter";
import BagDrawer from "@/components/BagDrawer";
import Header from "@/components/Header";
import { StoreProvider } from "@/components/StoreProvider";
import PageTransition from "@/components/PageTransition";
import Preloader from "@/components/Preloader";
import SmoothScroll from "@/components/SmoothScroll";

// Cinzel is the design system's designated fallback for Trajan Pro (licensed).
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-cinzel", display: "swap" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap" });
const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "RUPAARI | Pure silk. Honest zari.", template: "%s | RUPAARI" },
  description: "RUPAARI: heirloom spirit, contemporary ease. South Indian silk sarees. Rediscover Yourself.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4A0B13",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${montserrat.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <head>
        {/* Runs before paint: marks JS as available and skips the intro on repeat visits / reduced motion. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var d=document.documentElement;d.classList.add('js');var skip=false;try{skip=!!sessionStorage.getItem('rp_pre')}catch(e){}if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)skip=true;if(skip){d.classList.add('skip-pre');d.setAttribute('data-ready','')}})();",
          }}
        />
      </head>
      <body>
        {/* Without JS the scroll-reveal elements must still be visible. */}
        <noscript>
          <style>{`.preloader,.curtain{display:none!important}.rv,.hero-in,.line-mask>span,.sc,.menu-item{opacity:1!important;transform:none!important;clip-path:none!important;animation:none!important}`}</style>
        </noscript>
        <a href="#main" className="absolute left-[-999px] top-0 z-[100] bg-burgundy px-4 py-3 text-ivory focus:left-0">
          Skip to content
        </a>
        <Preloader />
        <PageTransition />
        <SmoothScroll />
        <StoreProvider>
          <Header />
          <main id="main">{children}</main>
          <SiteFooter />
          <MobileNav />
          <BagDrawer />
        </StoreProvider>
      </body>
    </html>
  );
}