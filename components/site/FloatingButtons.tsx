'use client';
import { useEffect, useRef, useState } from 'react';
import { C, F } from '@/lib/theme';
import { useRaf } from '@/hooks/useRaf';
import { useSite } from './SiteProvider';

export function FloatingButtons() {
  const { toast } = useSite();
  const wa = useRef<HTMLButtonElement>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const on = () => setShowTop(window.scrollY > 900);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useRaf((t) => {
    if (!wa.current) return;
    const k = (t % 2.4) / 2.4;
    wa.current.style.boxShadow = `0 10px 30px rgba(59,13,20,.35), 0 0 0 ${k * 14}px rgba(90,21,32,${(1 - k) * 0.35})`;
  });

  return (
    <>
      <button
        ref={wa}
        className="grow"
        aria-label="Chat on WhatsApp"
        onClick={() => toast('Opening WhatsApp with a Rupaari stylist…')}
        style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 60, width: 56, height: 56, borderRadius: '50%', background: C.maroon, color: C.ivory, border: 0, font: `500 10px ${F.sans}`, letterSpacing: '.12em' }}
      >
        CHAT
      </button>
      <button
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          position: 'fixed', right: 32, bottom: 92, zIndex: 60, width: 40, height: 40, borderRadius: '50%', background: C.ivory, color: C.maroon,
          border: `1px solid ${C.goldLight}`, fontSize: 16, opacity: showTop ? 1 : 0, transform: `translateY(${showTop ? 0 : 12}px)`,
          pointerEvents: showTop ? 'auto' : 'none', transition: 'opacity .4s, transform .4s',
        }}
      >
        ↑
      </button>
    </>
  );
}
