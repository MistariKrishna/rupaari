'use client';
import { useEffect, useRef } from 'react';
import { MARQUEE_A, MARQUEE_B } from '@/lib/data';
import { C, F } from '@/lib/theme';
import { useRaf } from '@/hooks/useRaf';
import { useSite } from '@/components/site/SiteProvider';

/** Two counter-scrolling weave bands that speed up and lean with scroll velocity. */
export function Marquee() {
  const { calm } = useSite();
  const rowA = useRef<HTMLDivElement>(null);
  const rowB = useRef<HTMLDivElement>(null);
  const s = useRef({ vel: 0, a: 0, b: 0, wA: 1, wB: 1, at: 0 });

  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      s.current.vel += (y - last) * 0.35;
      last = y;
    };
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useRaf((_t, dt, now) => {
    const S = s.current;
    const sp = calm ? 0.25 : 1;
    if (now - S.at > 1000) {
      S.at = now;
      S.wA = (rowA.current?.scrollWidth ?? 2) / 2 || 1;
      S.wB = (rowB.current?.scrollWidth ?? 2) / 2 || 1;
    }
    S.vel *= 0.9;
    const v = Math.max(-40, Math.min(40, S.vel));
    S.a = (S.a + (50 + Math.abs(v) * 14) * dt * sp) % S.wA;
    S.b = (S.b + (36 + Math.abs(v) * 10) * dt * sp) % S.wB;
    if (rowA.current) rowA.current.style.transform = `translateX(${-S.a}px) skewX(${-v * 0.35 * sp}deg)`;
    if (rowB.current) rowB.current.style.transform = `translateX(${-S.wB + S.b}px) skewX(${v * 0.35 * sp}deg)`;
  });

  const a = [...MARQUEE_A, ...MARQUEE_A];
  const b = [...MARQUEE_B, ...MARQUEE_B];

  return (
    <div aria-hidden style={{ background: C.wine, overflow: 'hidden', padding: '18px 0', display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid rgba(176,138,78,.35)', borderBottom: '1px solid rgba(176,138,78,.35)' }}>
      <div ref={rowA} style={{ display: 'flex', gap: 40, whiteSpace: 'nowrap', willChange: 'transform', width: 'max-content' }}>
        {a.map((w, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 40, font: `italic 300 clamp(30px,3.4vw,48px)/1.1 ${F.serif}`, color: C.goldLight }}>
            {w}
            <span style={{ width: 8, height: 8, background: C.gold, transform: 'rotate(45deg)' }} />
          </span>
        ))}
      </div>
      <div ref={rowB} style={{ display: 'flex', gap: 40, whiteSpace: 'nowrap', willChange: 'transform', width: 'max-content' }}>
        {b.map((w, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 40, font: `400 clamp(30px,3.4vw,48px)/1.1 ${F.serif}`, letterSpacing: '.08em', color: 'transparent', WebkitTextStroke: '1px rgba(217,194,147,.55)' }}>
            {w}
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.rose }} />
          </span>
        ))}
      </div>
    </div>
  );
}
