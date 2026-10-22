'use client';
import { useEffect, useRef, useState } from 'react';
import { CHAPTERS } from '@/lib/data';
import { C, F, EASE, clamp01 } from '@/lib/theme';
import { useRaf } from '@/hooks/useRaf';
import { useSite } from '@/components/site/SiteProvider';
import { Eyebrow } from '@/components/ui/Eyebrow';

const N = CHAPTERS.length;

/** Pinned, scroll-driven four-chapter brand story. */
export function Story() {
  const { toast, calm } = useSite();
  const [ch, setCh] = useState(0);
  const chRef = useRef(0);
  const first = useRef(true);
  const sectionRef = useRef<HTMLElement>(null);
  const leafRef = useRef<HTMLDivElement>(null);
  const threadA = useRef<SVGPathElement>(null);
  const threadB = useRef<SVGPathElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    textRef.current?.querySelectorAll<HTMLElement>('[data-sline]').forEach((n, i) =>
      n.animate(
        calm ? [{ opacity: 0 }, { opacity: 1 }] : [{ transform: 'translateY(105%)', opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: 900, delay: i * 70, easing: EASE, fill: 'backwards' },
      ),
    );
    numRef.current?.animate([{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }], { duration: 1100, easing: EASE });
  }, [ch, calm]);

  useRaf((t) => {
    const st = sectionRef.current;
    if (!st) return;
    const vh = window.innerHeight;
    const r = st.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const sp = calm ? 0.25 : 1;
    const p = clamp01(-r.top / (st.offsetHeight - vh));
    if (threadA.current) threadA.current.style.strokeDashoffset = String(1 - p);
    if (threadB.current) threadB.current.style.strokeDashoffset = String(1 - Math.max(0, p * 1.1 - 0.1));
    fills.current.forEach((f, i) => { if (f) f.style.width = `${clamp01(p * N - i) * 100}%`; });
    if (leafRef.current) leafRef.current.style.transform = `rotate(${Math.sin(t * 0.5) * 1.4 * sp}deg) translateY(${p * -60}px)`;
    if (orbitRef.current) orbitRef.current.style.transform = `rotate(${t * 14 * sp}deg)`;
    const next = Math.min(N - 1, Math.floor(p * N));
    if (next !== chRef.current) { chRef.current = next; setCh(next); }
  });

  const goChapter = (i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (span * (i + 0.5)) / N, behavior: 'smooth' });
  };

  const c = CHAPTERS[ch]!;

  return (
    <section id="story" ref={sectionRef} style={{ position: 'relative', height: '420vh', background: C.cream }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
        <div ref={leafRef} style={{ position: 'absolute', right: '-8%', top: '-10%', width: '55%', height: '120%', background: 'url(/assets/img-leaf.png) center/cover', opacity: 0.28, mixBlendMode: 'multiply', pointerEvents: 'none', transformOrigin: '80% 0' }} />
        <svg viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <path ref={threadA} d="M-20,780 C240,700 300,180 560,220 C820,260 760,700 1040,640 C1260,590 1300,240 1460,160" fill="none" pathLength={1} style={{ stroke: C.gold, strokeWidth: 1.25, strokeDasharray: 1, strokeDashoffset: 1, opacity: 0.85 }} />
          <path ref={threadB} d="M-20,800 C260,730 320,210 580,250 C840,290 780,730 1060,670 C1280,620 1320,270 1460,190" fill="none" pathLength={1} style={{ stroke: C.maroon, strokeWidth: 0.75, strokeDasharray: 1, strokeDashoffset: 1, opacity: 0.5 }} />
        </svg>

        <div style={{ position: 'absolute', top: 'clamp(96px,13vh,130px)', left: 'clamp(24px,5vw,80px)', right: 'clamp(24px,5vw,80px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, zIndex: 3 }}>
          <Eyebrow>THE HOUSE OF RUPAARI · OUR STORY</Eyebrow>
          <span className="hide-md" style={{ font: `400 11px ${F.sans}`, letterSpacing: '.22em', color: C.muted }}>SCROLL TO TURN THE PAGE</span>
        </div>

        <div className="stack-md" style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', alignItems: 'center', gap: 'clamp(32px,5vw,96px)', padding: 'clamp(130px,19vh,170px) clamp(24px,6vw,110px) clamp(90px,14vh,120px)' }}>
          <div className="hide-md" style={{ position: 'relative', justifySelf: 'center', width: 'min(100%,36vw,56vh)', aspectRatio: '1/1.08' }}>
            <div ref={orbitRef} style={{ position: 'absolute', inset: -26, border: '1px solid rgba(176,138,78,.5)', borderRadius: '50%', opacity: ch === 0 ? 1 : 0, transition: 'opacity .8s' }}>
              <span style={{ position: 'absolute', top: -5, left: '50%', width: 9, height: 9, marginLeft: -4, borderRadius: '50%', background: C.gold }} />
            </div>
            <div style={{ position: 'absolute', inset: 0, borderRadius: c.radius, overflow: 'hidden', background: C.beige, boxShadow: '0 40px 90px rgba(59,13,20,.22)', transition: 'border-radius 1.2s cubic-bezier(.7,0,.2,1)' }}>
              {CHAPTERS.map((x, i) => (
                <div key={x.n} style={{ position: 'absolute', inset: 0, opacity: i === ch ? 1 : 0, transition: 'opacity 1.1s ease' }}>
                  <div style={{ position: 'absolute', inset: '-8%', background: `url(${x.img}) ${x.pos}/cover`, transform: `scale(${i === ch ? 1 : 1.15})`, transition: `transform 3s ${EASE}` }} />
                </div>
              ))}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(59,13,20,.55),transparent 40%)' }} />
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 22, textAlign: 'center', font: `400 10.5px ${F.sans}`, letterSpacing: '.26em', color: C.sand }}>{c.caption}</div>
            </div>
            <div style={{ position: 'absolute', left: -18, top: '18%', writingMode: 'vertical-rl', transform: 'rotate(180deg)', font: `400 10.5px ${F.sans}`, letterSpacing: '.3em', color: C.gold }}>CHAPTER {c.word}</div>
          </div>

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 540 }}>
            <div ref={numRef} aria-hidden style={{ position: 'absolute', right: -10, top: -120, font: `300 clamp(160px,20vw,300px)/1 ${F.serif}`, color: 'transparent', WebkitTextStroke: '1px rgba(176,138,78,.55)', pointerEvents: 'none', zIndex: 0 }}>{c.n}</div>
            <div ref={textRef} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 'clamp(12px,2.4vh,22px)' }}>
              <div style={{ overflow: 'hidden' }}>
                <span data-sline="" style={{ display: 'block', font: `400 11.5px ${F.sans}`, letterSpacing: '.26em', color: C.gold }}>{c.n} — {c.label}</span>
              </div>
              <h2 style={{ margin: 0, font: `300 clamp(36px,min(5.2vw,8.4vh),80px)/.96 ${F.serif}`, color: C.maroon, letterSpacing: '.01em' }}>
                {c.lines.map((l) => (
                  <span key={l} style={{ display: 'block', overflow: 'hidden', paddingBottom: '.05em' }}>
                    <span data-sline="" style={{ display: 'block' }}>{l}</span>
                  </span>
                ))}
              </h2>
              <div style={{ overflow: 'hidden' }}>
                <p data-sline="" style={{ margin: 0, font: `300 clamp(15px,2.2vh,17px)/1.7 ${F.sans}`, color: C.ink, maxWidth: 440 }}>{c.body}</p>
              </div>
              {c.towns && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {c.towns.map((t) => (
                    <span key={t} data-sline="" style={{ padding: '8px 14px', border: `1px solid ${C.goldLight}`, font: `400 12.5px ${F.sans}`, color: C.maroon, background: 'rgba(251,247,240,.6)' }}>{t}</span>
                  ))}
                </div>
              )}
              {c.quote && (
                <div style={{ overflow: 'hidden' }}>
                  <div data-sline="" style={{ font: `400 clamp(34px,3vw,46px)/1.1 ${F.script}`, color: C.maroon }}>{c.quote}</div>
                </div>
              )}
              <div style={{ overflow: 'hidden' }}>
                <div data-sline="" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', paddingTop: 4 }}>
                  <button className="cta cta-dark" data-mag="" onClick={() => toast('Our Story page — coming soon')}>READ OUR STORY <span>→</span></button>
                  <button className="cta cta-ghost" onClick={() => toast('60-second brand film — awaiting footage')}>
                    <span style={{ width: 0, height: 0, borderLeft: `8px solid ${C.maroon}`, borderTop: '5px solid transparent', borderBottom: '5px solid transparent' }} />
                    WATCH THE FILM
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 'clamp(24px,5vw,80px)', right: 'clamp(24px,5vw,80px)', bottom: 'clamp(14px,3.5vh,36px)', display: 'grid', gridTemplateColumns: `repeat(${N},minmax(0,1fr))`, gap: 18, zIndex: 3 }}>
          {CHAPTERS.map((x, i) => (
            <button key={x.n} onClick={() => goChapter(i)} style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'none', border: 0, padding: '8px 0', textAlign: 'left', color: i <= ch ? C.maroon : '#B5A493', transition: 'color .4s' }}>
              <span style={{ position: 'relative', height: 1, width: '100%', background: C.goldLight, display: 'block' }}>
                <span ref={(el) => { fills.current[i] = el; }} style={{ position: 'absolute', left: 0, top: -1, height: 3, width: 0, background: C.maroon, display: 'block' }} />
              </span>
              <span style={{ font: `400 11px ${F.sans}`, letterSpacing: '.22em' }}>{x.n} · {x.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
