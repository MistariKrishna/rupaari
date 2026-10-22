'use client';
import { useRef } from 'react';
import type { Product } from '@/lib/data';
import { inr } from '@/lib/data';
import { C, F } from '@/lib/theme';
import { useSite } from '@/components/site/SiteProvider';
import { Reveal } from './Reveal';

export function ProductCard({ p, delay = 0, showLine = false }: { p: Product; delay?: number; showLine?: boolean }) {
  const { navigate, addToBag, toggleWish, wish } = useSite();
  const media = useRef<HTMLDivElement>(null);
  const open = () => navigate(`/sarees/${p.slug}`);
  const saved = !!wish[p.id];

  return (
    <Reveal delay={delay} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div ref={media} className="card-media" data-img="" onClick={open}>
        <div style={{ position: 'absolute', inset: 0, background: `url(${p.img}) ${p.pos}/cover` }} />
        <div className="card-alt" style={{ background: `url(${p.img2}) ${p.pos2}/cover` }}>
          <button className="quick-add" onClick={(e) => { e.stopPropagation(); addToBag(p.id, media.current); }}>
            QUICK ADD +
          </button>
        </div>
        {p.tag && (
          <span style={{ position: 'absolute', top: 12, left: 12, background: C.ivory, color: C.maroon, font: `500 10px ${F.sans}`, letterSpacing: '.2em', padding: '6px 10px', pointerEvents: 'none' }}>
            {p.tag.toUpperCase()}
          </span>
        )}
        <button
          className="grow"
          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          onClick={(e) => { e.stopPropagation(); toggleWish(p.id); }}
          style={{ position: 'absolute', top: 8, right: 8, width: 40, height: 40, border: 0, background: 'transparent', color: saved ? C.maroon : C.ivory, fontSize: 20 }}
        >
          {saved ? '♥' : '♡'}
        </button>
      </div>
      <div onClick={open} style={{ display: 'flex', flexDirection: 'column', gap: 5, cursor: 'pointer' }}>
        <span style={{ font: `400 10.5px ${F.sans}`, letterSpacing: '.2em', color: C.gold }}>{p.coll.toUpperCase()}</span>
        <span style={{ font: `400 22px/1.15 ${F.serif}`, color: C.maroon }}>{p.name}</span>
        {showLine && <span style={{ font: `300 14px/1.4 ${F.sans}`, color: C.soft }}>{p.line}</span>}
        <span style={{ font: `400 14px ${F.sans}`, color: C.ink }}>{inr(p.price)}</span>
      </div>
    </Reveal>
  );
}
