'use client';
import { useEffect, useState } from 'react';
import { LIVE, PRODUCTS } from '@/lib/data';
import { C, F, EASE } from '@/lib/theme';
import { useSite } from './SiteProvider';

/** "Someone just reserved…" social-proof card. Demo data — wire to real orders or remove. */
export function LivePopup() {
  const { navigate, bagOpen } = useSite();
  const [idx, setIdx] = useState(0);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const timers: number[] = [];
    const show = () => {
      setOn(true);
      timers.push(window.setTimeout(() => setOn(false), 5200));
    };
    timers.push(window.setTimeout(show, 9000));
    const iv = window.setInterval(() => {
      setIdx((i) => (i + 1) % LIVE.length);
      show();
    }, 19000);
    return () => {
      window.clearInterval(iv);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const live = LIVE[idx]!;
  const p = PRODUCTS[live.id]!;
  const name = /^the /i.test(p.name) ? p.name : `the ${p.name}`;
  const visible = on && !bagOpen;

  return (
    <div
      onClick={() => navigate(`/sarees/${p.slug}`)}
      style={{
        position: 'fixed', left: 24, bottom: 24, zIndex: 62, display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 18px 12px 12px', background: C.ivory, border: `1px solid ${C.line}`, boxShadow: '0 20px 50px rgba(59,13,20,.18)',
        transform: `translateY(${visible ? 0 : 30}px)`, opacity: visible ? 1 : 0, transition: `transform .7s ${EASE}, opacity .5s`,
        pointerEvents: visible ? 'auto' : 'none', cursor: 'pointer', maxWidth: 340,
      }}
    >
      <span style={{ width: 46, height: 56, flex: 'none', borderRadius: '999px 999px 0 0', background: `url(${p.img}) ${p.pos}/cover` }} />
      <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, font: `500 10px ${F.sans}`, letterSpacing: '.18em', color: C.green }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green }} />
          JUST NOW · {live.city}
        </span>
        <span style={{ font: `400 13.5px/1.35 ${F.sans}`, color: C.ink }}>
          Someone just reserved <span style={{ color: C.maroon, fontWeight: 500 }}>{name}</span>
        </span>
      </span>
    </div>
  );
}
