'use client';
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { SLIDES, collHref } from '@/lib/data';
import { C, F, EASE, EASE_IO } from '@/lib/theme';
import { useRaf } from '@/hooks/useRaf';
import { useSite } from '@/components/site/SiteProvider';

const N = SLIDES.length;
const DURATION = 6500;
type Spark = { x: number; y: number; s: number; v: number; ph: number; d: number };

function ribbon(t: number, W: number, base: number, amp: number, thick: number, ph: number) {
  const steps = 56;
  const top: string[] = [];
  const bot: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const x = W * u;
    const y = base + amp * Math.sin(u * Math.PI * 2.1 + t * 0.55 + ph) + amp * 0.42 * Math.sin(u * Math.PI * 4.6 - t * 0.8 + ph) - u * 60;
    const th = thick * (0.3 + 0.7 * Math.abs(Math.sin(u * Math.PI * 1.3 + t * 0.35 + ph)));
    top.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    bot.push(`${x.toFixed(1)},${(y + th).toFixed(1)}`);
  }
  return { d: `M${top.join(' L')} L${bot.reverse().join(' L')} Z`, e: `M${top.join(' L')}` };
}

export function Hero() {
  const { navigate, calm } = useSite();
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const slideRef = useRef(0);
  const pausedRef = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ribA = useRef<SVGPathElement>(null);
  const ribB = useRef<SVGPathElement>(null);
  const ribEdge = useRef<SVGPathElement>(null);
  const gradRef = useRef<SVGLinearGradientElement>(null);
  const timer = useRef({ start: 0, held: 0 });
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0, cx: -1e4, cy: -1e4 });
  const downX = useRef<number | null>(null);
  const dragged = useRef(false);
  const sparks = useRef<Spark[] | null>(null);

  useEffect(() => { slideRef.current = slide; }, [slide]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  const go = (i: number) => {
    timer.current = { start: performance.now(), held: 0 };
    setSlide(((i % N) + N) % N);
  };

  useEffect(() => {
    wordRef.current?.animate(
      calm ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, letterSpacing: '.22em', filter: 'blur(8px)' }, { opacity: 1, letterSpacing: '.06em', filter: 'blur(0px)' }],
      { duration: 1400, easing: EASE },
    );
    textRef.current?.querySelectorAll<HTMLElement>('[data-line]').forEach((n, i) =>
      n.animate(
        calm ? [{ opacity: 0 }, { opacity: 1 }] : [{ transform: 'translateY(110%)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
        { duration: 1000, delay: i * 90, easing: EASE, fill: 'backwards' },
      ),
    );
  }, [slide, calm]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (window.scrollY > 300) return;
      const tg = e.target as HTMLElement | null;
      if (tg?.closest?.('input,textarea,select')) return;
      if (e.key === 'ArrowRight') go(slideRef.current + 1);
      if (e.key === 'ArrowLeft') go(slideRef.current - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useRaf((t, dt, now) => {
    const sec = sectionRef.current;
    if (!sec) return;
    const T = timer.current;
    if (!T.start) T.start = now;
    const r = sec.getBoundingClientRect();
    if (r.bottom < 0) { T.start = now - T.held; return; }
    const sp = calm ? 0.25 : 1;

    if (ribA.current && ribB.current && ribEdge.current) {
      const a = ribbon(t * sp, 1440, 150, 46, 80, 0);
      const b = ribbon(t * sp * 0.8, 1440, 120, 36, 60, 2.2);
      ribA.current.setAttribute('d', a.d);
      ribEdge.current.setAttribute('d', a.e);
      ribB.current.setAttribute('d', b.d);
      gradRef.current?.setAttribute('gradientTransform', `translate(${(t * sp * 60) % 1440} 0)`);
    }
    if (badgeRef.current) badgeRef.current.style.transform = `rotate(${t * 18 * sp}deg)`;
    if (trackRef.current) {
      const M = mouse.current;
      const k = calm ? 0 : 1;
      M.tx += (M.x * k - M.tx) * 0.06;
      M.ty += (M.y * k - M.ty) * 0.06;
      trackRef.current.style.transform = `rotateY(${M.tx * 8}deg) rotateX(${-M.ty * 6}deg) translateY(${Math.sin(t * 0.8) * 6 * sp}px)`;
    }

    if (pausedRef.current) T.start = now - T.held;
    else T.held = now - T.start;
    const p = Math.min(1, T.held / DURATION);
    if (fillRef.current) fillRef.current.style.width = `${p * 100}%`;
    if (!pausedRef.current && p >= 1) go(slideRef.current + 1);

    const cv = canvasRef.current;
    if (cv) {
      const W = Math.round(r.width);
      const H = Math.round(r.height);
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
      if (!sparks.current) {
        sparks.current = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), s: 0.4 + Math.random() * 1.6, v: 0.008 + Math.random() * 0.025, ph: Math.random() * 6.28, d: (Math.random() - 0.5) * 0.01 }));
      }
      const c = cv.getContext('2d');
      if (!c) return;
      c.clearRect(0, 0, W, H);
      c.fillStyle = 'rgb(232,205,150)';
      const mxn = (mouse.current.cx - r.left) / r.width;
      const myn = (mouse.current.cy - r.top) / r.height;
      for (const s of sparks.current) {
        s.y -= s.v * dt * sp;
        s.x += (s.d + Math.sin(t * 0.5 + s.ph) * 0.004) * dt * sp;
        if (s.y < -0.02) { s.y = 1.02; s.x = Math.random(); }
        const dx = s.x - mxn;
        const dy = s.y - myn;
        if (dx * dx + dy * dy < 0.01) { s.x += dx * 0.04; s.y += dy * 0.04; }
        const a = (0.35 + 0.65 * Math.abs(Math.sin(t * 1.6 + s.ph))) * 0.75;
        const rr = s.s * (1 + 0.5 * Math.sin(t * 2 + s.ph));
        c.globalAlpha = a * 0.25;
        c.beginPath(); c.arc(s.x * W, s.y * H, rr * 3.2, 0, Math.PI * 2); c.fill();
        c.globalAlpha = a;
        c.beginPath(); c.arc(s.x * W, s.y * H, rr, 0, Math.PI * 2); c.fill();
      }
      c.globalAlpha = 1;
    }
  });

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mouse.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    mouse.current.cx = e.clientX;
    mouse.current.cy = e.clientY;
  };
  const onDown = (e: PointerEvent<HTMLElement>) => { downX.current = e.clientX; dragged.current = false; };
  const onUp = (e: PointerEvent<HTMLElement>) => {
    if (downX.current == null) return;
    const dx = e.clientX - downX.current;
    downX.current = null;
    if (Math.abs(dx) > 50) {
      dragged.current = true;
      go(slideRef.current + (dx < 0 ? 1 : -1));
      window.setTimeout(() => { dragged.current = false; }, 50);
    }
  };

  const cur = SLIDES[slide]!;

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMove}
      onPointerDown={onDown}
      onPointerUp={onUp}
      style={{ position: 'relative', zIndex: 3, height: '100vh', minHeight: 720, color: C.ivory, touchAction: 'pan-y', userSelect: 'none' }}
    >
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: C.deep }}>
        {SLIDES.map((s, i) => (
          <div key={i} style={{ position: 'absolute', inset: -80, background: `url(${s.img}) ${s.pos}/cover`, filter: 'blur(42px) saturate(1.25)', opacity: i === slide ? 1 : 0, transform: `scale(${i === slide ? 1 : 1.12})`, transition: 'opacity 1.4s ease, transform 8s ease' }} />
        ))}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 52%,rgba(59,13,20,.15),rgba(42,8,13,.94) 78%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg,rgba(217,194,147,.06) 0 1px,transparent 1px 12.5%)' }} />
      </div>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 4, pointerEvents: 'none' }} />
      <div
        ref={wordRef}
        aria-hidden
        style={{ position: 'absolute', left: 0, right: 0, top: '47%', transform: 'translateY(-50%)', textAlign: 'center', font: `300 clamp(110px,17vw,300px)/1 ${F.serif}`, letterSpacing: '.06em', color: 'transparent', WebkitTextStroke: '1px rgba(217,194,147,.5)', whiteSpace: 'nowrap', pointerEvents: 'none', overflow: 'hidden' }}
      >
        {cur.word}
      </div>

      <div style={{ position: 'absolute', inset: 0, perspective: 1600, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 30, pointerEvents: 'none' }}>
        <div ref={trackRef} style={{ position: 'relative', width: 'clamp(200px,min(23vw,40vh),360px)', aspectRatio: '3/4.3', transformStyle: 'preserve-3d', pointerEvents: 'auto' }}>
          {SLIDES.map((s, i) => {
            let d = (i - slide + N) % N;
            if (d > N / 2) d -= N;
            const a = Math.abs(d);
            const on = d === 0;
            return (
              <div
                key={i}
                data-img=""
                onClick={(e) => {
                  e.stopPropagation();
                  if (dragged.current) return;
                  if (on) navigate(collHref(s.weave));
                  else go(i);
                }}
                style={{
                  position: 'absolute', inset: 0, cursor: 'pointer', zIndex: 10 - a,
                  transform: `translateX(${d * 82}%) translateZ(${-a * 260}px) rotateY(${-d * 24}deg) scale(${1 - a * 0.1})`,
                  opacity: a >= 2 ? 0.35 : 1, filter: `brightness(${1 - a * 0.32}) saturate(${1 - a * 0.25})`,
                  transition: `transform 1.2s ${EASE_IO}, opacity 1.2s ease, filter 1.2s ease`,
                }}
              >
                <div style={{ position: 'absolute', inset: '-16px -16px 0', border: `1px solid ${C.goldLight}`, borderBottom: 0, borderRadius: '999px 999px 0 0', opacity: on ? 1 : 0, transition: 'opacity .9s ease .3s' }} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: '999px 999px 0 0', overflow: 'hidden', background: C.maroon, boxShadow: '0 50px 90px rgba(0,0,0,.5)' }}>
                  <div style={{ position: 'absolute', inset: '-6%', background: `url(${s.img}) ${s.pos}/cover`, transform: `scale(${on ? 1 : 1.12})`, transition: 'transform 8s cubic-bezier(.2,.6,.2,1)' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(42,8,13,.75),transparent 42%)' }} />
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: on ? 1 : 0, transition: 'opacity .8s ease .4s' }}>
                    <span style={{ font: `400 10px ${F.sans}`, letterSpacing: '.28em', color: C.goldLight }}>{s.region}</span>
                    <span style={{ font: `400 22px ${F.serif}`, letterSpacing: '.06em' }}>{s.cap}</span>
                  </div>
                </div>
              </div>
            );
          })}
          <button className="badge-btn" aria-label="Explore sarees" onClick={() => navigate('/sarees')} style={{ position: 'absolute', top: -34, right: -74, zIndex: 20, width: 128, height: 128, border: 0, padding: 0, background: 'none', color: C.goldLight }}>
            <svg ref={badgeRef} viewBox="0 0 128 128" style={{ position: 'absolute', inset: 0, width: 128, height: 128 }}>
              <defs><path id="badgeCircle" d="M64,64 m-50,0 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0" /></defs>
              <text style={{ font: `500 9.5px ${F.sans}`, letterSpacing: '2.4px', fill: C.goldLight }}>
                <textPath href="#badgeCircle">REDISCOVER YOURSELF · SAME ROOTS · </textPath>
              </text>
            </svg>
            <span className="badge-core" style={{ position: 'absolute', left: '50%', top: '50%', width: 46, height: 46, margin: '-23px 0 0 -23px', borderRadius: '50%', background: C.ivory, color: C.maroon, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>→</span>
          </button>
        </div>
      </div>

      <div ref={textRef} style={{ position: 'absolute', left: 'clamp(24px,5vw,80px)', bottom: 'clamp(80px,13vh,140px)', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 18, zIndex: 12 }}>
        <div style={{ overflow: 'hidden' }}>
          <div data-line="" style={{ display: 'flex', alignItems: 'center', gap: 12, font: `400 11.5px ${F.sans}`, letterSpacing: '.26em', color: C.goldLight }}>
            <span style={{ width: 7, height: 7, background: C.gold, transform: 'rotate(45deg)' }} />
            {cur.eyebrow}
          </div>
        </div>
        <h1 style={{ margin: 0, font: `300 clamp(40px,4.6vw,72px)/.98 ${F.serif}`, letterSpacing: '.02em', textShadow: '0 4px 30px rgba(42,8,13,.6)' }}>
          {cur.lines.map((l) => (
            <span key={l} style={{ display: 'block', overflow: 'hidden', paddingBottom: '.04em' }}>
              <span data-line="" style={{ display: 'block' }}>{l}</span>
            </span>
          ))}
        </h1>
        <div style={{ overflow: 'hidden' }}>
          <p data-line="" style={{ margin: 0, font: `300 16px/1.6 ${F.sans}`, color: C.sand, maxWidth: 340 }}>{cur.sub}</p>
        </div>
        <div style={{ overflow: 'hidden', padding: '4px 0' }}>
          <div data-line="">
            <button className="cta cta-light" data-mag="" onClick={() => navigate(collHref(cur.weave))}>SHOP THE EDIT <span>→</span></button>
          </div>
        </div>
      </div>

      <div className="hide-md" style={{ position: 'absolute', right: 'clamp(24px,5vw,80px)', bottom: 'clamp(80px,13vh,140px)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 18, zIndex: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontFamily: F.serif }}>
          <span style={{ fontWeight: 300, fontSize: 64, lineHeight: 1 }}>0{slide + 1}</span>
          <span style={{ fontSize: 18, color: C.goldLight }}>/ 0{N}</span>
        </div>
        <div style={{ width: 220, height: 1, background: 'rgba(251,247,240,.25)', position: 'relative' }}>
          <div ref={fillRef} style={{ position: 'absolute', left: 0, top: -1, height: 3, width: 0, background: 'linear-gradient(90deg,#B08A4E,#F1E7D8)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setPaused((p) => !p)} style={{ height: 48, padding: '0 14px', background: 'none', border: 0, color: C.sand, font: `400 10.5px ${F.sans}`, letterSpacing: '.22em' }}>
            {paused ? 'PLAY' : 'PAUSE'}
          </button>
          <button className="circle-btn" aria-label="Previous slide" onClick={() => go(slide - 1)}>←</button>
          <button className="circle-btn" aria-label="Next slide" onClick={() => go(slide + 1)}>→</button>
        </div>
      </div>

      <div style={{ position: 'absolute', left: '50%', bottom: 30, transform: 'translateX(-50%)', display: 'flex', gap: 10, zIndex: 12 }}>
        {SLIDES.map((_, i) => (
          <button key={i} aria-label={`Go to slide ${i + 1}`} onClick={() => go(i)} style={{ height: 2, width: i === slide ? 48 : 18, padding: 0, border: 0, background: i === slide ? C.ivory : 'rgba(251,247,240,.35)', transition: `width .6s ${EASE_IO}, background .4s` }} />
        ))}
      </div>

      <svg viewBox="0 0 1440 300" preserveAspectRatio="none" aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: -150, width: '100%', height: 300, zIndex: 5, pointerEvents: 'none', overflow: 'visible' }}>
        <defs>
          <linearGradient id="silkA" ref={gradRef} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="720" y2="0" spreadMethod="reflect">
            <stop offset="0" stopColor="#3B0D14" />
            <stop offset=".35" stopColor="#7E1F2D" />
            <stop offset=".55" stopColor="#A8394A" />
            <stop offset=".7" stopColor="#6A1824" />
            <stop offset="1" stopColor="#3B0D14" />
          </linearGradient>
        </defs>
        <path ref={ribB} fill="url(#silkA)" style={{ opacity: 0.55 }} />
        <path ref={ribA} fill="url(#silkA)" style={{ opacity: 0.94 }} />
        <path ref={ribEdge} fill="none" style={{ stroke: C.goldLight, strokeWidth: 1, opacity: 0.7 }} />
      </svg>
    </section>
  );
}
