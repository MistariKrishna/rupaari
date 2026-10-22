'use client';
import { useRef, useState } from 'react';
import { COLLECTIONS, collHref } from '@/lib/data';
import { C, F, EASE, EASE_IO } from '@/lib/theme';
import { useRaf } from '@/hooks/useRaf';
import { useSite } from '@/components/site/SiteProvider';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal } from '@/components/ui/Reveal';

const N = COLLECTIONS.length;
const CYCLE = 5200;

/** Expanding-panel collection gallery: auto-advances with a timer bar, hover takes control. */
export function Collections() {
  const { navigate } = useSite();
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const hover = useRef(false);
  const timer = useRef({ start: 0, held: 0 });
  const sectionRef = useRef<HTMLElement>(null);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);

  const select = (i: number) => { activeRef.current = i; setActive(i); };

  useRaf((_t, _dt, now) => {
    const sec = sectionRef.current;
    if (!sec) return;
    const T = timer.current;
    if (!T.start) T.start = now;
    const r = sec.getBoundingClientRect();
    const vis = r.bottom > 0 && r.top < window.innerHeight;
    if (!vis || hover.current) T.start = now - T.held;
    else T.held = now - T.start;
    const prog = Math.min(1, T.held / CYCLE);
    bars.current.forEach((b, i) => { if (b) b.style.width = `${i === activeRef.current && !hover.current ? prog * 100 : 0}%`; });
    if (vis && !hover.current && prog >= 1) {
      timer.current = { start: now, held: 0 };
      select((activeRef.current + 1) % N);
    }
  });

  return (
    <section ref={sectionRef} style={{ background: C.wine, color: C.ivory, padding: 'clamp(80px,9vw,120px) clamp(24px,5vw,80px)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: '32px 64px', alignItems: 'end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Eyebrow color={C.goldLight}>OUR COLLECTIONS</Eyebrow>
          <Reveal as="h2" delay={60} style={{ margin: 0, font: `300 clamp(42px,4.8vw,72px)/1 ${F.serif}` }}>SAREES THAT HEAL,<br />EMPOWER &amp; CELEBRATE YOU.</Reveal>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, justifySelf: 'end', maxWidth: 440 }}>
          <Reveal as="p" delay={100} style={{ margin: 0, font: `300 17px/1.65 ${F.sans}`, color: C.sand }}>More than just sarees — they are emotions, milestones and new beginnings.</Reveal>
          <Reveal delay={140} style={{ display: 'flex', gap: 24, flexWrap: 'wrap', font: `400 10.5px ${F.sans}`, letterSpacing: '.22em', color: C.goldLight }}>
            <span>TRADITIONAL CRAFTSMANSHIP</span><span>PREMIUM FABRICS</span><span>TIMELESS ELEGANCE</span>
          </Reveal>
        </div>
      </div>

      <div
        onMouseLeave={() => { hover.current = false; timer.current = { start: performance.now(), held: 0 }; }}
        style={{ display: 'flex', gap: 12, height: 'clamp(440px,64vh,620px)', marginTop: 56 }}
      >
        {COLLECTIONS.map((c, i) => {
          const on = i === active;
          const n = `0${i + 1}`;
          return (
            <div
              key={c.name}
              data-img=""
              onMouseEnter={() => { hover.current = true; if (!on) select(i); }}
              onClick={() => navigate(collHref(c.weave))}
              style={{ position: 'relative', flex: on ? '6 1 0%' : '1 1 0%', minWidth: 64, overflow: 'hidden', borderRadius: on ? '220px 220px 0 0' : 2, cursor: 'pointer', transition: `flex 1.1s ${EASE_IO}, border-radius 1.1s ${EASE_IO}` }}
            >
              <div style={{ position: 'absolute', inset: '-6%', background: `url(${c.img}) ${c.pos}/cover`, transform: `scale(${on ? 1 : 1.25})`, filter: `brightness(${on ? 0.95 : 0.55}) saturate(${on ? 1.05 : 0.6})`, transition: `transform 2.4s ${EASE}, filter 1s` }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(42,8,13,.85),rgba(42,8,13,.1) 55%)' }} />
              <span style={{ position: 'absolute', left: 0, top: 0, height: 2, width: '100%', background: 'rgba(251,247,240,.15)' }}>
                <span ref={(el) => { bars.current[i] = el; }} style={{ position: 'absolute', left: 0, top: 0, height: 2, width: 0, background: C.goldLight }} />
              </span>
              <div style={{ position: 'absolute', left: '50%', bottom: 28, transform: 'translateX(-50%) rotate(180deg)', writingMode: 'vertical-rl', display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap', font: `400 12px ${F.sans}`, letterSpacing: '.26em', opacity: on ? 0 : 1, transition: 'opacity .5s' }}>
                <span style={{ color: C.goldLight }}>{n}</span>{c.name.toUpperCase()}
              </div>
              <div style={{ position: 'absolute', left: 'clamp(20px,2.4vw,36px)', right: 'clamp(20px,2.4vw,36px)', bottom: 'clamp(20px,2.4vw,36px)', display: 'flex', flexDirection: 'column', gap: 12, minWidth: 280, opacity: on ? 1 : 0, transform: `translateY(${on ? 0 : 24}px)`, transition: `opacity .6s ease ${on ? '.45s' : '0s'}, transform .9s ${EASE} ${on ? '.45s' : '0s'}` }}>
                <span style={{ font: `400 11px ${F.sans}`, letterSpacing: '.24em', color: C.goldLight }}>{n} · {c.region}</span>
                <span style={{ font: `300 clamp(36px,3.6vw,54px)/1 ${F.serif}` }}>{c.name}</span>
                <span style={{ font: `300 15px/1.6 ${F.sans}`, color: C.sand, maxWidth: 360 }}>{c.d}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 12, font: `500 11.5px ${F.sans}`, letterSpacing: '.22em', marginTop: 6 }}>EXPLORE THE COLLECTION <span>→</span></span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
