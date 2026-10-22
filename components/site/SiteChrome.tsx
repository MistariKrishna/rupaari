'use client';
import { useEffect, type ReactNode } from 'react';
import { C, F } from '@/lib/theme';
import { useSite } from './SiteProvider';
import { Loader } from './Loader';
import { Header } from './Header';
import { MenuOverlay } from './MenuOverlay';
import { SearchOverlay } from './SearchOverlay';
import { BagDrawer } from './BagDrawer';
import { Toast } from './Toast';
import { Cursor } from './Cursor';
import { ScrollProgress } from './ScrollProgress';
import { LivePopup } from './LivePopup';
import { FloatingButtons } from './FloatingButtons';
import { Footer } from './Footer';

export function SiteChrome({ children }: { children: ReactNode }) {
  const { setMenuOpen, setSearchOpen, setBagOpen, wipeRef } = useSite();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMenuOpen(false);
      setSearchOpen(false);
      setBagOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setMenuOpen, setSearchOpen, setBagOpen]);

  return (
    <>
      <Loader />
      <div
        ref={wipeRef}
        aria-hidden
        style={{ position: 'fixed', inset: 0, zIndex: 250, background: C.wine, transform: 'translateY(100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}
      >
        <div style={{ font: `300 40px/1 ${F.serif}`, letterSpacing: '.3em', color: C.goldLight }}>RUPAARI</div>
      </div>
      <ScrollProgress />
      <Cursor />
      <LivePopup />
      <Header />
      <MenuOverlay />
      <SearchOverlay />
      <main style={{ position: 'relative', minHeight: '100vh' }}>{children}</main>
      <Footer />
      <BagDrawer />
      <FloatingButtons />
      <Toast />
    </>
  );
}
