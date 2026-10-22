'use client';
import { useRef } from 'react';
import { CRAFT_STEPS } from '@/lib/data';
import { C, F, clamp01, easeInOut } from '@/lib/theme';
import { useRaf } from '@/hooks/useRaf';
import { useSite } from '@/components/site/SiteProvider';

/** Pinned section: six loom-to-drape steps travel horizontally as you scroll. */
export function Craft() {
  const { toast, calm } = useSite();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const shuttleRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLSpanElement>(null);
  const weftRef = useRef<HTMLDivElement>(null);

  useRaf(() => {
    const cr = sectionRef.current;
    const tr = trackRef.current;
    if (!cr || !tr) return;
    const vh = window.innerHeight;
    const r = cr.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const p = clamp01(-r.top / (cr.offsetHeight - vh));
    const e = easeInOut(p);
    const max = Math.max(0, tr.scrollWidth - window.innerWidth);
    tr.style.transform = `translate3d(${-e * max}px,0,0)`;
    if (!calm) {
      tr.querySelectorAll<HTMLElement>('[data-cimg]').forEach((im) => {
        const b = im.parentElement!.getBoundingClientRect();
        im.style.transform = `translateX(${(b.left + b.width / 2 - window.innerWidth / 2) * -0.08}px)`;
      });
    }
    if (barRef.current) barRef.current.style.width = `${p * 100}%`;
    if (shuttleRef.current) shuttleRef.current.style.left = `${p * 100}%`;
    if (weftRef.current) weftRef.current.style.clipPath = `inset(0 ${100 - p * 100}% 0 0)`;
    if (dayRef.current) {
      const d = String(Math.max(1, Math.round(p * 42))).padStart(2, '0');
      if (dayRef.current.textContent !== d) dayRef.current.textContent = d;
    }
  });

  return (
    <section id="craft" ref={sectionRef} style={{ position: 'relative', height: '520vh', background: C.deep }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', color: C.ivory }}>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg,rgba(217,194,147,.09) 0 1px,transparent 1px 28px)' }} />
        <div ref={weftRef} style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg,rgba(176,138,78,.07) 0 1px,transparent 1px 28px)', clipPath: 'inset(0 100% 0 0)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 70% at 50% 50%,rgba(90,21,32,.35),rgba(42,8,13,.96) 80%)' }} />

        <div style={{ position: 'absolute', top: 'clamp(96px,13vh,130px)', left: 'clamp(24px,5vw,80px)', right: 'clamp(24px,5vw,80px)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, zIndex: 3, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ width: 28, height: 1, background: C.gold }} />
              <span style={{ font: `400 11.5px ${F.sans}`, letterSpacing: '.26em', color: C.goldLight }}>OUR CRAFT · FROM LOOM TO DRAPE</span>
            </div>
            <h2 style={{ margin: 0, font: `300 clamp(36px,min(4.4vw,7.4vh),68px)/.98 ${F.serif}` }}>CRAFTED WITH INTENTION.</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, fontFamily: F.serif }}>
            <span ref={dayRef} style={{ fontWeight: 300, fontSize: 'clamp(48px,7vh,72px)', lineHeight: 1, color: C.goldLight }}>01</span>
            <span style={{ font: `400 11px ${F.sans}`, letterSpacing: '.22em', color: C.sand }}>OF 42 DAYS<br />ON THE LOOM</span>
          </div>
        </div>

        <div ref={trackRef} style={{ position: 'absolute', left: 0, top: 'clamp(220px,32vh,300px)', bottom: 'clamp(70px,11vh,110px)', display: 'flex', alignItems: 'stretch', gap: 'clamp(28px,3vw,48px)', padding: '0 clamp(24px,5vw,80px)', willChange: 'transform' }}>
          {CRAFT_STEPS.map((c, i) => {
            const n = `0${i + 1}`;
            return (
              <article key={c.t} style={{ flex: 'none', width: 'clamp(300px,min(30vw,52vh),440px)', display: 'flex', flexDirection: 'column', gap: 'clamp(12px,2vh,20px)' }}>
                <div style={{ position: 'relative', flex: 1, minHeight: 0, borderRadius: c.radius, overflow: 'hidden', background: C.maroon, boxShadow: '0 30px 70px rgba(0,0,0,.45)' }}>
                  <div data-cimg="" style={{ position: 'absolute', inset: '-4% -12%', background: `url(${c.img}) ${c.pos}/cover`, filter: c.filter }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(42,8,13,.7),transparent 45%)' }} />
                  <span style={{ position: 'absolute', left: 18, bottom: 12, font: `300 clamp(60px,10vh,96px)/1 ${F.serif}`, color: 'transparent', WebkitTextStroke: '1px rgba(241,231,216,.8)' }}>{n}</span>
                  <span style={{ position: 'absolute', right: 16, top: 16, font: `400 10px ${F.sans}`, letterSpacing: '.22em', padding: '6px 10px', background: 'rgba(42,8,13,.6)', color: C.goldLight }}>{c.days}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ font: `400 10.5px ${F.sans}`, letterSpacing: '.24em', color: C.gold }}>STEP {n}</span>
                  <span style={{ font: `300 clamp(26px,3.6vh,34px)/1.05 ${F.serif}` }}>{c.t}</span>
                  <span style={{ font: `300 14.5px/1.6 ${F.sans}`, color: C.sand, maxWidth: 360 }}>{c.b}</span>
                </div>
              </article>
            );
          })}
          <article style={{ flex: 'none', width: 'clamp(300px,30vw,420px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22, paddingRight: 'clamp(24px,5vw,80px)' }}>
            <span style={{ font: `400 clamp(40px,4vw,56px)/1.05 ${F.script}`, color: C.goldLight }}>From loom to drape, every thread carries a legacy.</span>
            <span style={{ font: `300 15px/1.65 ${F.sans}`, color: C.sand }}>Silk Mark certified. GI-tagged weaves. Every saree ships with the name of the family that wove it.</span>
            <button className="cta cta-light" data-mag="" onClick={() => toast('Our Craft page — coming soon')}>DISCOVER OUR CRAFT <span>→</span></button>
          </article>
        </div>

        <div style={{ position: 'absolute', left: 'clamp(24px,5vw,80px)', right: 'clamp(24px,5vw,80px)', bottom: 'clamp(24px,5vh,48px)', display: 'flex', alignItems: 'center', gap: 18, zIndex: 3 }}>
          <span style={{ font: `400 10.5px ${F.sans}`, letterSpacing: '.24em', color: C.goldLight }}>SILK</span>
          <div style={{ position: 'relative', flex: 1, height: 1, background: 'rgba(217,194,147,.3)' }}>
            <div ref={barRef} style={{ position: 'absolute', left: 0, top: -1, height: 3, width: 0, background: 'linear-gradient(90deg,#B08A4E,#F1E7D8)' }} />
            <div ref={shuttleRef} style={{ position: 'absolute', top: -5, left: 0, width: 22, height: 11, marginLeft: -11, borderRadius: '50%', background: C.goldLight, boxShadow: '0 0 18px rgba(217,194,147,.8)' }} />
          </div>
          <span style={{ font: `400 10.5px ${F.sans}`, letterSpacing: '.24em', color: C.goldLight }}>DRAPE</span>
        </div>
      </div>
    </section>
  );
}
