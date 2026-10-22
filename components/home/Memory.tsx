'use client';
import { useRef } from 'react';
import { MEMORIES, type Memory as MemoryT } from '@/lib/data';
import { C, F, clamp01 } from '@/lib/theme';
import { useRaf } from '@/hooks/useRaf';
import { useSite } from '@/components/site/SiteProvider';
import { Eyebrow } from '@/components/ui/Eyebrow';

const COL_A = [0, 2, 4, 0, 2, 4].map((i) => MEMORIES[i]!);
const COL_B = [1, 3, 5, 1, 3, 5].map((i) => MEMORIES[i]!);

const LINES = [
  { text: 'THE SILK.', grad: 'linear-gradient(90deg,#5A1520 50%,rgba(90,21,32,.16) 50%)' },
  { text: 'THE COLOUR.', grad: 'linear-gradient(90deg,#5A1520 0%,#1F4D4A 15%,#B8862E 32%,#7A2A36 50%,rgba(90,21,32,.16) 50%)' },
  { text: 'THE MEMORY.', grad: 'linear-gradient(90deg,#5A1520 50%,rgba(90,21,32,.16) 50%)' },
];

function MemCard({ m }: { m: MemoryT }) {
  return (
    <div style={{ background: C.ivory, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 18px 40px rgba(59,13,20,.08)', border: `1px solid ${C.beige}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 52, height: 60, flex: 'none', borderRadius: '999px 999px 0 0', background: `url(${m.img}) ${m.pos}/cover` }} />
        <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ font: `500 11px ${F.sans}`, letterSpacing: '.18em', color: C.maroon }}>{m.who}</span>
          <span style={{ font: `400 11px ${F.sans}`, color: C.gold }}>Wore {m.saree}</span>
        </span>
      </div>
      <p style={{ margin: 0, font: `italic 400 20px/1.4 ${F.serif}`, color: C.wine }}>“{m.q}”</p>
    </div>
  );
}

export function Memory() {
  const { toast, calm } = useSite();
  const sectionRef = useRef<HTMLElement>(null);
  const leafRef = useRef<HTMLDivElement>(null);
  const colA = useRef<HTMLDivElement>(null);
  const colB = useRef<HTMLDivElement>(null);
  const lines = useRef<(HTMLSpanElement | null)[]>([]);
  const off = useRef({ a: 0, b: 0 });

  useRaf((t, dt) => {
    const sec = sectionRef.current;
    if (!sec) return;
    const vh = window.innerHeight;
    const r = sec.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const sp = calm ? 0.25 : 1;
    const p = clamp01((vh - r.top) / (vh * 0.95));
    lines.current.forEach((l, i) => { if (l) l.style.backgroundPosition = `${100 - clamp01(p * 1.7 - i * 0.3) * 100}% 0`; });
    if (leafRef.current) leafRef.current.style.transform = `rotate(${Math.sin(t * 0.6) * 1.6 * sp}deg) translateX(${Math.sin(t * 0.4) * 14 * sp}px) skewX(${Math.sin(t * 0.5) * 1.2 * sp}deg)`;
    const step = (el: HTMLDivElement | null, key: 'a' | 'b', v: number) => {
      if (!el) return;
      const half = el.scrollHeight / 2 || 1;
      off.current[key] = (off.current[key] + v * dt * sp + half) % half;
      el.style.transform = `translateY(${-off.current[key]}px)`;
    };
    step(colA.current, 'a', 26);
    step(colB.current, 'b', -20);
  });

  return (
    <section ref={sectionRef} className="stack-md" style={{ position: 'relative', overflow: 'hidden', background: C.sand, height: 'min(100vh,880px)', minHeight: 640, display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)', gap: 'clamp(24px,4vw,72px)', padding: '0 clamp(24px,5vw,80px)' }}>
      <div ref={leafRef} style={{ position: 'absolute', left: '-6%', top: '-12%', width: '62%', height: '130%', background: 'url(/assets/img-leaf.png) center/cover', opacity: 0.4, mixBlendMode: 'multiply', transformOrigin: '20% 0', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28 }}>
        <Eyebrow>REAL WOMEN · REAL STORIES</Eyebrow>
        <h2 style={{ margin: 0, font: `300 clamp(48px,min(6.4vw,11vh),104px)/.98 ${F.serif}`, letterSpacing: '.01em' }}>
          {LINES.map((l, i) => (
            <span
              key={l.text}
              ref={(el) => { lines.current[i] = el; }}
              style={{ display: 'block', background: l.grad, backgroundSize: '200% 100%', backgroundPosition: '100% 0', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
            >
              {l.text}
            </span>
          ))}
        </h2>
        <p style={{ margin: 0, font: `300 17px/1.6 ${F.sans}`, maxWidth: 380 }}>Real women. Real stories.<br />A celebration of the many you.</p>
        <button className="link-line" onClick={() => toast('Share your Rupaari story — coming soon')}>SHARE YOUR STORY <span>→</span></button>
      </div>
      <div
        className="hide-md"
        style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20, height: '100%', overflow: 'hidden', maskImage: 'linear-gradient(transparent,#000 14%,#000 86%,transparent)', WebkitMaskImage: 'linear-gradient(transparent,#000 14%,#000 86%,transparent)' }}
      >
        <div ref={colA} style={{ display: 'flex', flexDirection: 'column', gap: 20, willChange: 'transform' }}>
          {COL_A.map((m, i) => <MemCard key={i} m={m} />)}
        </div>
        <div ref={colB} style={{ display: 'flex', flexDirection: 'column', gap: 20, willChange: 'transform', paddingTop: 60 }}>
          {COL_B.map((m, i) => <MemCard key={i} m={m} />)}
        </div>
      </div>
    </section>
  );
}
