'use client';
import { useEffect, useRef, useState } from 'react';
import { FEATURED, PRODUCTS, collHref, inr } from '@/lib/data';
import { C, F, EASE } from '@/lib/theme';
import { useRaf } from '@/hooks/useRaf';
import { useSite } from '@/components/site/SiteProvider';

const LENS_R = 120;

/** Featured collection with a magnifying "zari lens" that follows the cursor (and drifts on its own). */
export function Featured() {
  const { navigate, calm } = useSite();
  const [feat, setFeat] = useState(0);
  const lensRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const L = useRef({ on: false, x: 0, y: 0, cx: 0, cy: 0 });

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    textRef.current?.animate([{ opacity: 0, transform: `translateY(${calm ? 0 : 24}px)` }, { opacity: 1, transform: 'none' }], { duration: 700, easing: EASE });
  }, [feat, calm]);

  useRaf((t) => {
    const lens = lensRef.current;
    const ring = ringRef.current;
    const box = lens?.parentElement?.getBoundingClientRect();
    if (!lens || !ring || !box || box.bottom < 0 || box.top > window.innerHeight) return;
    const S = L.current;
    if (!S.on) {
      S.x = box.width * (0.5 + 0.28 * Math.sin(t * 0.45));
      S.y = box.height * (0.5 + 0.25 * Math.sin(t * 0.7 + 1));
    }
    S.cx += (S.x - S.cx) * 0.12;
    S.cy += (S.y - S.cy) * 0.12;
    lens.style.transformOrigin = `${S.cx}px ${S.cy}px`;
    lens.style.clipPath = `circle(${LENS_R / 1.45}px at ${S.cx}px ${S.cy}px)`;
    ring.style.transform = `translate(${S.cx - LENS_R}px,${S.cy - LENS_R}px)`;
  });

  const f = FEATURED[feat]!;
  const inWeave = PRODUCTS.filter((p) => p.coll === f.weave);
  const count = String(inWeave.length || 3).padStart(2, '0');
  const from = inr(inWeave.length ? Math.min(...inWeave.map((p) => p.price)) : 14500);

  return (
    <section style={{ background: C.cream, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,460px),1fr))', minHeight: 'min(100vh,760px)' }}>
      <div
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); L.current.on = true; L.current.x = e.clientX - r.left; L.current.y = e.clientY - r.top; }}
        onMouseLeave={() => { L.current.on = false; }}
        style={{ position: 'relative', overflow: 'hidden', minHeight: 520, cursor: 'crosshair' }}
      >
        {FEATURED.map((x, i) => (
          <div key={x.weave} style={{ position: 'absolute', inset: 0, opacity: i === feat ? 1 : 0, transition: 'opacity 1s ease', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: `url(${x.img}) ${x.pos}/cover`, transform: `scale(${i === feat ? 1 : 1.1})`, filter: 'sepia(.55) saturate(.55) brightness(.62)', transition: 'transform 6s cubic-bezier(.2,.6,.2,1)' }} />
          </div>
        ))}
        <div ref={lensRef} style={{ position: 'absolute', inset: 0, background: `url(${f.img}) ${f.pos}/cover`, clipPath: 'circle(0px at 50% 50%)', transform: 'scale(1.45)', pointerEvents: 'none' }} />
        <div ref={ringRef} style={{ position: 'absolute', left: 0, top: 0, width: LENS_R * 2, height: LENS_R * 2, borderRadius: '50%', border: `1px solid ${C.goldLight}`, boxShadow: '0 0 0 10px rgba(217,194,147,.12)', pointerEvents: 'none', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 16, font: `400 9.5px ${F.sans}`, letterSpacing: '.26em', color: C.ivory }}>
          THE WEAVE · ×1.5
        </div>
        <div style={{ position: 'absolute', left: 24, bottom: 24, font: `400 10.5px ${F.sans}`, letterSpacing: '.22em', color: C.sand, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 18, height: 1, background: C.goldLight }} />MOVE TO SEE THE ZARI UP CLOSE
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 32, alignItems: 'center', padding: 'clamp(56px,6vw,96px) clamp(24px,5vw,80px)' }}>
        <div ref={textRef} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <span style={{ font: `400 11.5px ${F.sans}`, letterSpacing: '.24em', color: C.gold }}>FEATURED COLLECTION</span>
          <h2 style={{ margin: 0, font: `300 clamp(46px,5vw,76px)/.96 ${F.serif}`, color: C.maroon }}>{f.l1}<br />{f.l2}</h2>
          <p style={{ margin: 0, font: `300 17px/1.65 ${F.sans}`, maxWidth: 340 }}>{f.d}</p>
          <div style={{ display: 'flex', gap: 28 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ font: `300 32px/1 ${F.serif}`, color: C.maroon }}>{count}</span>
              <span style={{ font: `400 10.5px ${F.sans}`, letterSpacing: '.18em', color: C.muted }}>SAREES</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ font: `300 32px/1 ${F.serif}`, color: C.maroon }}>{from}</span>
              <span style={{ font: `400 10.5px ${F.sans}`, letterSpacing: '.18em', color: C.muted }}>STARTING AT</span>
            </div>
          </div>
          <button className="cta cta-dark" data-mag="" onClick={() => navigate(collHref(f.weave))}>VIEW COLLECTION <span>→</span></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', borderLeft: `1px solid ${C.goldLight}` }}>
          {FEATURED.map((x, i) => (
            <button
              key={x.weave}
              onClick={() => setFeat(i)}
              onMouseEnter={() => setFeat(i)}
              style={{ position: 'relative', background: 'none', border: 0, padding: '16px 0 16px 22px', textAlign: 'left', font: `400 15px ${F.serif}`, letterSpacing: '.12em', color: i === feat ? C.maroon : '#B5A493', transition: 'color .3s' }}
            >
              <span style={{ position: 'absolute', left: -1, top: 0, bottom: 0, width: 2, background: C.maroon, transform: `scaleY(${i === feat ? 1 : 0})`, transition: 'transform .4s' }} />
              0{i + 1}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
