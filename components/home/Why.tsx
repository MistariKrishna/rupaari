'use client';
import { useRef, useState } from 'react';
import { PROMISES } from '@/lib/data';
import { C, F, EASE_IO } from '@/lib/theme';
import { useRaf } from '@/hooks/useRaf';
import { useSite } from '@/components/site/SiteProvider';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal } from '@/components/ui/Reveal';

/** Five arch tiles that flip in sequence to reveal each brand promise. */
export function Why() {
  const { toast, calm } = useSite();
  const [flip, setFlip] = useState(-1);
  const sectionRef = useRef<HTMLElement>(null);
  const sealRef = useRef<SVGSVGElement>(null);
  const S = useRef({ hover: false, last: 0 });

  useRaf((t, _dt, now) => {
    if (sealRef.current) sealRef.current.style.transform = `rotate(${t * 16 * (calm ? 0.25 : 1)}deg)`;
    const sec = sectionRef.current;
    if (!sec) return;
    const vh = window.innerHeight;
    const r = sec.getBoundingClientRect();
    const vis = r.top < vh * 0.7 && r.bottom > vh * 0.2;
    if (vis && !S.current.hover && now - S.current.last > 2600) {
      S.current.last = now;
      setFlip((f) => (f + 1) % PROMISES.length);
    }
  });

  const back = { position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', borderRadius: '999px 999px 2px 2px' } as const;

  return (
    <section ref={sectionRef} style={{ position: 'relative', overflow: 'hidden', background: C.sand, padding: 'clamp(80px,9vw,130px) clamp(24px,5vw,80px)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg,rgba(176,138,78,.08) 0 1px,transparent 1px 20%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32, flexWrap: 'wrap', marginBottom: 'clamp(40px,5vw,64px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Eyebrow>WHY RUPAARI · FIVE PROMISES</Eyebrow>
          <Reveal as="h2" delay={60} style={{ margin: 0, font: `300 clamp(44px,5vw,78px)/.98 ${F.serif}`, color: C.maroon }}>
            BECAUSE YOU<br />DESERVE <span style={{ font: `400 1.15em/1 ${F.script}`, color: C.gold, paddingLeft: '.1em' }}>more…</span>
          </Reveal>
        </div>
        <div style={{ position: 'relative', width: 150, height: 150, flex: 'none' }}>
          <svg ref={sealRef} viewBox="0 0 150 150" style={{ position: 'absolute', inset: 0, width: 150, height: 150 }}>
            <defs><path id="sealCircle" d="M75,75 m-58,0 a58,58 0 1,1 116,0 a58,58 0 1,1 -116,0" /></defs>
            <text style={{ font: `500 10px ${F.sans}`, letterSpacing: '2.6px', fill: C.maroon }}>
              <textPath href="#sealCircle">THE RUPAARI PROMISE · PURE SILK · REAL ZARI ·</textPath>
            </text>
          </svg>
          <span style={{ position: 'absolute', inset: 40, borderRadius: '50%', border: `1px solid ${C.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `300 36px ${F.serif}`, color: C.maroon, background: C.ivory }}>R</span>
        </div>
      </div>

      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 'clamp(12px,1.4vw,20px)' }}>
        {PROMISES.map((w, i) => {
          const n = `0${i + 1}`;
          return (
            <Reveal key={w.a} delay={i * 90}>
              <div
                data-cursor=""
                onMouseEnter={() => { S.current.hover = true; setFlip(i); }}
                onMouseLeave={() => { S.current.hover = false; S.current.last = performance.now(); setFlip(-1); }}
                onClick={() => toast(`${w.a} ${w.b} — policy page`)}
                style={{ perspective: 1200, aspectRatio: '3/4.1', cursor: 'pointer' }}
              >
                <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transform: `rotateY(${i === flip ? 180 : 0}deg)`, transition: `transform 1s ${EASE_IO}` }}>
                  <div style={{ ...back, background: C.ivory, border: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: 'clamp(40px,4vw,56px) 20px 28px', textAlign: 'center' }}>
                    <span style={{ font: `300 clamp(54px,5vw,76px)/1 ${F.serif}`, color: 'transparent', WebkitTextStroke: `1px ${C.gold}` }}>{n}</span>
                    <span style={{ position: 'relative', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ position: 'absolute', inset: 0, border: `1px solid ${C.goldLight}`, borderRadius: '50%' }} />
                      <span style={{ position: 'absolute', inset: 14, border: `1px solid ${C.gold}`, transform: 'rotate(45deg)' }} />
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.maroon }} />
                    </span>
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ font: `400 24px/1.1 ${F.serif}`, color: C.maroon }}>{w.a}</span>
                      <span style={{ font: `400 11px ${F.sans}`, letterSpacing: '.2em', color: C.muted }}>{w.b.toUpperCase()}</span>
                    </span>
                  </div>
                  <div style={{ ...back, transform: 'rotateY(180deg)', background: C.maroon, color: C.ivory, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 12, padding: '28px 24px' }}>
                    <div style={{ position: 'absolute', inset: 0, background: `url(${w.img}) ${w.pos}/cover`, opacity: 0.35 }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,#3B0D14 30%,rgba(59,13,20,.2))' }} />
                    <span style={{ position: 'relative', font: `400 10.5px ${F.sans}`, letterSpacing: '.22em', color: C.goldLight }}>{n} · PROMISE</span>
                    <span style={{ position: 'relative', font: `300 26px/1.1 ${F.serif}` }}>{w.a} {w.b}</span>
                    <span style={{ position: 'relative', font: `300 14px/1.6 ${F.sans}`, color: C.sand }}>{w.body}</span>
                    <span style={{ position: 'relative', font: `500 11px ${F.sans}`, letterSpacing: '.2em', color: C.goldLight }}>LEARN MORE →</span>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
