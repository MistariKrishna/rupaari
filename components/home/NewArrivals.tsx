'use client';
import { useRef, type MouseEvent } from 'react';
import { PRODUCTS, inr, type Product } from '@/lib/data';
import { C, F } from '@/lib/theme';
import { useRaf } from '@/hooks/useRaf';
import { useSite } from '@/components/site/SiteProvider';
import { Eyebrow } from '@/components/ui/Eyebrow';

const RADII = ['999px 999px 0 0', '2px', '2px'];
const LOOP: Product[] = [...PRODUCTS, ...PRODUCTS];

/** Endless, draggable new-arrivals strip with 3D tilt + silk shine on each card. */
export function NewArrivals() {
  const { navigate, addToBag, calm } = useSite();
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const S = useRef({ off: 0, paused: false, drag: null as null | { x: number; o: number }, dragged: false });

  useRaf((_t, dt) => {
    const tr = trackRef.current;
    if (!tr) return;
    const st = S.current;
    const half = tr.scrollWidth / 2 || 1;
    if (!st.drag && !st.paused) st.off += 38 * dt * (calm ? 0.25 : 1);
    st.off = ((st.off % half) + half) % half;
    tr.style.transform = `translate3d(${-st.off}px,0,0)`;
    if (barRef.current) barRef.current.style.left = `${(st.off / half) * 86}%`;
  });

  const tilt = (e: MouseEvent<HTMLDivElement>) => {
    if (calm) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg) translateY(-8px)`;
    const sh = el.querySelector<HTMLElement>('[data-shine]');
    if (sh) {
      sh.style.opacity = '1';
      sh.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,240,210,.85), transparent 55%)`;
    }
  };
  const untilt = (e: MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.transform = 'none';
    const sh = el.querySelector<HTMLElement>('[data-shine]');
    if (sh) sh.style.opacity = '0';
  };

  return (
    <section style={{ background: C.ivory, padding: 'clamp(72px,8vw,110px) 0 clamp(56px,6vw,80px)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap', margin: '0 clamp(24px,5vw,80px) 28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Eyebrow>JUST OFF THE LOOM</Eyebrow>
          <h3 style={{ margin: 0, font: `300 clamp(40px,4.4vw,64px)/1 ${F.serif}`, color: C.maroon }}>NEW ARRIVALS</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <span className="hide-md" style={{ display: 'flex', alignItems: 'center', gap: 10, font: `400 10.5px ${F.sans}`, letterSpacing: '.22em', color: C.muted }}>
            <span style={{ width: 28, height: 28, border: `1px solid ${C.goldLight}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: C.maroon }}>⟷</span>
            DRAG TO BROWSE
          </span>
          <button className="link-line" onClick={() => navigate('/sarees')}>VIEW ALL SAREES <span>→</span></button>
        </div>
      </div>

      <div
        data-drag=""
        onPointerDown={(e) => { S.current.drag = { x: e.clientX, o: S.current.off }; S.current.dragged = false; }}
        onPointerMove={(e) => { const d = S.current.drag; if (!d) return; const dx = e.clientX - d.x; if (Math.abs(dx) > 6) S.current.dragged = true; S.current.off = d.o - dx; }}
        onPointerUp={() => { S.current.drag = null; window.setTimeout(() => { S.current.dragged = false; }, 30); }}
        onMouseEnter={() => { S.current.paused = true; }}
        onMouseLeave={() => { S.current.paused = false; S.current.drag = null; }}
        style={{ cursor: 'grab', touchAction: 'pan-y', userSelect: 'none' }}
      >
        <div ref={trackRef} style={{ display: 'flex', gap: 28, width: 'max-content', padding: '24px 0 30px', willChange: 'transform' }}>
          {LOOP.map((p, i) => (
            <ArrivalCard
              key={i}
              p={p}
              radius={RADII[i % 3]!}
              onTilt={tilt}
              onUntilt={untilt}
              onOpen={() => { if (!S.current.dragged) navigate(`/sarees/${p.slug}`); }}
              onAdd={(el) => addToBag(p.id, el)}
            />
          ))}
        </div>
      </div>
      <div style={{ margin: '10px clamp(24px,5vw,80px) 0', height: 1, background: C.line, position: 'relative' }}>
        <div ref={barRef} style={{ position: 'absolute', left: 0, top: -1, height: 3, width: '14%', background: C.maroon }} />
      </div>
    </section>
  );
}

function ArrivalCard({ p, radius, onTilt, onUntilt, onOpen, onAdd }: {
  p: Product; radius: string;
  onTilt: (e: MouseEvent<HTMLDivElement>) => void; onUntilt: (e: MouseEvent<HTMLDivElement>) => void;
  onOpen: () => void; onAdd: (el: HTMLElement | null) => void;
}) {
  const media = useRef<HTMLDivElement>(null);
  return (
    <div onMouseMove={onTilt} onMouseLeave={onUntilt} style={{ width: 'clamp(240px,21vw,310px)', flex: 'none', display: 'flex', flexDirection: 'column', gap: 14, transition: 'transform .6s cubic-bezier(.2,.7,.1,1)' }}>
      <div ref={media} className="card-media" data-img="" onClick={onOpen} style={{ borderRadius: radius, boxShadow: '0 24px 50px rgba(59,13,20,.12)' }}>
        <div style={{ position: 'absolute', inset: 0, background: `url(${p.img}) ${p.pos}/cover`, pointerEvents: 'none' }} />
        <div className="card-alt" style={{ background: `url(${p.img2}) ${p.pos2}/cover` }}>
          <button className="quick-add" onClick={(e) => { e.stopPropagation(); onAdd(media.current); }}>QUICK ADD +</button>
        </div>
        <div data-shine="" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'soft-light', opacity: 0, transition: 'opacity .4s' }} />
        {p.tag && (
          <span style={{ position: 'absolute', top: 12, left: 12, background: C.ivory, color: C.maroon, font: `500 10px ${F.sans}`, letterSpacing: '.2em', padding: '6px 10px', pointerEvents: 'none' }}>{p.tag.toUpperCase()}</span>
        )}
      </div>
      <div onClick={onOpen} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, cursor: 'pointer' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ font: `400 10.5px ${F.sans}`, letterSpacing: '.2em', color: C.gold }}>{p.coll.toUpperCase()}</span>
          <span style={{ font: `400 21px/1.15 ${F.serif}`, color: C.maroon }}>{p.name}</span>
        </div>
        <span style={{ font: `400 14px ${F.sans}`, whiteSpace: 'nowrap', paddingTop: 18 }}>{inr(p.price)}</span>
      </div>
    </div>
  );
}
