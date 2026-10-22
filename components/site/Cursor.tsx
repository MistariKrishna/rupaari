'use client';
import { useEffect, useRef } from 'react';
import { C, F } from '@/lib/theme';
import { useRaf } from '@/hooks/useRaf';
import { useSite } from './SiteProvider';

/** Gold ring cursor (fine pointers only) + magnetic pull on [data-mag] elements. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const { calm } = useSite();
  const calmRef = useRef(calm);
  calmRef.current = calm;
  const st = useRef({ mx: -100, my: -100, rx: -100, ry: -100, fine: false, l: '', a: false, mag: null as HTMLElement | null });

  useEffect(() => {
    const S = st.current;
    S.fine = window.matchMedia('(pointer:fine)').matches;
    if (!S.fine) return;
    const onMove = (e: MouseEvent) => {
      S.mx = e.clientX;
      S.my = e.clientY;
      const el = e.target as HTMLElement | null;
      if (!el || typeof el.closest !== 'function') return;
      const lab = el.closest('[data-drag]') ? 'DRAG' : el.closest('[data-img]') ? 'VIEW' : '';
      const act = !lab && !!el.closest('button,a,[data-cursor]');
      const r = ring.current;
      if (r && (S.l !== lab || S.a !== act)) {
        S.l = lab;
        S.a = act;
        const sz = lab ? 84 : act ? 58 : 38;
        r.style.width = r.style.height = `${sz}px`;
        r.style.margin = `${-sz / 2}px 0 0 ${-sz / 2}px`;
        r.style.background = lab ? 'rgba(90,21,32,.88)' : act ? 'rgba(176,138,78,.12)' : 'transparent';
        if (label.current) label.current.textContent = lab;
      }
      if (r) r.style.opacity = '1';
      if (dot.current) dot.current.style.opacity = '1';

      const mg = el.closest<HTMLElement>('[data-mag]');
      if (S.mag && S.mag !== mg) {
        S.mag.style.transform = '';
        S.mag = null;
      }
      if (mg && !calmRef.current) {
        const b = mg.getBoundingClientRect();
        mg.style.transform = `translate(${(e.clientX - b.left - b.width / 2) * 0.22}px,${(e.clientY - b.top - b.height / 2) * 0.32}px)`;
        S.mag = mg;
      }
    };
    const onLeave = () => {
      if (ring.current) ring.current.style.opacity = '0';
      if (dot.current) dot.current.style.opacity = '0';
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  useRaf(() => {
    const S = st.current;
    if (!S.fine || !ring.current || !dot.current) return;
    S.rx += (S.mx - S.rx) * 0.18;
    S.ry += (S.my - S.ry) * 0.18;
    ring.current.style.transform = `translate(${S.rx}px,${S.ry}px)`;
    dot.current.style.transform = `translate(${S.mx}px,${S.my}px)`;
  });

  return (
    <>
      <div
        ref={ring}
        aria-hidden
        style={{
          position: 'fixed', left: 0, top: 0, zIndex: 400, width: 38, height: 38, margin: '-19px 0 0 -19px', borderRadius: '50%',
          border: `1px solid ${C.gold}`, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          font: `500 9.5px ${F.sans}`, letterSpacing: '.2em', color: C.ivory, opacity: 0,
          transition: 'width .35s cubic-bezier(.2,.7,.1,1), height .35s cubic-bezier(.2,.7,.1,1), margin .35s cubic-bezier(.2,.7,.1,1), background .35s, opacity .3s',
        }}
      >
        <span ref={label} />
      </div>
      <div ref={dot} aria-hidden style={{ position: 'fixed', left: 0, top: 0, zIndex: 401, width: 6, height: 6, margin: '-3px 0 0 -3px', borderRadius: '50%', background: C.gold, pointerEvents: 'none', opacity: 0, transition: 'opacity .3s' }} />
    </>
  );
}
