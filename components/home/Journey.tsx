'use client';
import { useRef } from 'react';
import { JOURNAL } from '@/lib/data';
import { C, F, clamp01, easeInOut } from '@/lib/theme';
import { useRaf } from '@/hooks/useRaf';
import { useSite } from '@/components/site/SiteProvider';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal } from '@/components/ui/Reveal';

/** Photo-filled "STORIES" wordmark + journal cards that fan out of a stack on scroll. */
export function Journey() {
  const { toast, calm } = useSite();
  const sectionRef = useRef<HTMLElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);

  useRaf((t) => {
    const sec = sectionRef.current;
    if (!sec) return;
    const vh = window.innerHeight;
    const r = sec.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const sp = calm ? 0.25 : 1;
    const p = clamp01((vh - r.top) / (r.height + vh * 0.2));
    if (wordRef.current) wordRef.current.style.backgroundPosition = `${30 + p * 40}% ${30 + p * 30}%`;
    const e = easeInOut(clamp01((p - 0.35) / 0.4));
    cards.current.forEach((c, idx) => {
      if (!c) return;
      const i = idx - 1;
      const w = c.offsetWidth + Math.min(48, window.innerWidth * 0.03);
      c.style.transform = `translate(${i * w * e}px,${(1 - e) * Math.abs(i) * 18 + Math.sin(t * 1.1 + i) * 4 * sp}px) rotate(${i * 9 * (1 - e)}deg)`;
      c.style.zIndex = i === 0 ? '3' : '2';
    });
  });

  const openJournal = () => toast('Journal — coming soon');
  const cardW = 'clamp(260px,27vw,370px)';

  return (
    <section id="journal" ref={sectionRef} style={{ position: 'relative', overflow: 'hidden', background: C.wine, color: C.ivory, padding: 'clamp(90px,10vw,140px) clamp(24px,5vw,80px) clamp(80px,8vw,120px)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg,rgba(217,194,147,.05) 0 1px,transparent 1px 12.5%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Eyebrow color={C.goldLight}>THE JOURNEY</Eyebrow>
        <div
          ref={wordRef}
          aria-hidden
          style={{ font: `500 clamp(110px,21vw,340px)/.86 ${F.serif}`, letterSpacing: '-.01em', background: 'url(/assets/img-journal.png) 50% 40%/120% auto', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', marginTop: 14, whiteSpace: 'nowrap' }}
        >
          STORIES
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32, flexWrap: 'wrap', marginTop: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 520 }}>
            <Reveal as="h2" style={{ margin: 0, font: `300 clamp(36px,4vw,58px)/1 ${F.serif}` }}>BEYOND THE SAREE.</Reveal>
            <Reveal as="p" delay={80} style={{ margin: 0, font: `300 17px/1.65 ${F.sans}`, color: C.sand }}>
              From the hands of skilled artisans to the hearts of modern women — this is a journey of tradition, craft and you.
            </Reveal>
            <Reveal delay={140}>
              <button className="link-line on-dark" onClick={openJournal}>EXPLORE OUR JOURNAL <span>→</span></button>
            </Reveal>
          </div>
          <Reveal delay={200} style={{ font: `400 clamp(40px,4vw,62px)/1.05 ${F.script}`, color: C.goldLight, transform: 'rotate(-5deg)', textAlign: 'right' }}>
            Same roots.<br />New dreams.
          </Reveal>
        </div>
      </div>

      <div style={{ position: 'relative', height: 'clamp(440px,52vw,560px)', marginTop: 'clamp(48px,6vw,80px)' }}>
        {JOURNAL.map((j, i) => (
          <button
            key={j.t}
            ref={(el) => { cards.current[i] = el; }}
            onClick={openJournal}
            className="zoom-host"
            style={{ position: 'absolute', left: '50%', top: 0, width: cardW, marginLeft: `calc(${cardW} / -2)`, display: 'flex', flexDirection: 'column', background: C.ivory, color: C.ink, border: 0, padding: 0, textAlign: 'left', boxShadow: '0 30px 70px rgba(0,0,0,.4)', willChange: 'transform' }}
          >
            <div style={{ aspectRatio: '4/3.2', overflow: 'hidden', position: 'relative', width: '100%' }}>
              <div className="zoom-target" style={{ position: 'absolute', inset: 0, background: `url(${j.img}) ${j.pos}/cover` }} />
            </div>
            <div style={{ padding: '20px 22px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ font: `400 10.5px ${F.sans}`, letterSpacing: '.22em', color: C.gold }}>{j.cat} · {j.min}</span>
              <span style={{ font: `400 25px/1.15 ${F.serif}`, color: C.maroon }}>{j.t}</span>
              <span style={{ font: `500 11px ${F.sans}`, letterSpacing: '.2em', color: C.maroon }}>READ →</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
