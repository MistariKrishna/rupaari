'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PRODUCTS, inr } from '@/lib/data';
import { C, F, EASE_IO } from '@/lib/theme';
import { useSite } from './SiteProvider';

const SUGGEST = ['Kanjivaram', 'Ivory', 'Wedding', 'Kasavu', 'Bridal'];

export function SearchOverlay() {
  const { searchOpen: open, setSearchOpen, navigate } = useSite();
  const [q, setQ] = useState('');
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => input.current?.focus(), 350);
    return () => window.clearTimeout(t);
  }, [open]);

  const query = q.trim().toLowerCase();
  const results = useMemo(
    () =>
      query
        ? PRODUCTS.filter((p) => `${p.name} ${p.coll} ${p.colour} ${p.occ} ${p.region}`.toLowerCase().includes(query)).slice(0, 6)
        : PRODUCTS.slice(0, 4),
    [query],
  );

  return (
    <div
      aria-hidden={!open}
      style={{
        position: 'fixed', left: 0, right: 0, top: 0, zIndex: 90, background: C.ivory,
        transform: `translateY(${open ? '0%' : '-105%'})`, transition: `transform .6s ${EASE_IO}`,
        boxShadow: '0 30px 80px rgba(59,13,20,.18)', padding: '36px clamp(24px,6vw,96px) 44px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', font: `400 11px ${F.sans}`, letterSpacing: '.2em', color: C.gold }}>
        <span>SEARCH RUPAARI</span>
        <button onClick={() => setSearchOpen(false)} style={{ background: 'none', border: 0, font: 'inherit', letterSpacing: 'inherit', color: C.maroon, padding: '10px 0' }}>CLOSE ✕</button>
      </div>
      <input
        ref={input}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Kanjivaram, ivory, wedding…"
        style={{ width: '100%', marginTop: 18, border: 0, borderBottom: `1px solid ${C.goldLight}`, background: 'transparent', font: `300 clamp(32px,4vw,52px)/1.3 ${F.serif}`, color: C.maroon, outline: 'none', padding: '6px 0 14px' }}
      />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
        {SUGGEST.map((l) => (
          <button key={l} className="chip" onClick={() => setQ(l)} style={{ border: `1px solid ${C.goldLight}`, background: 'transparent', color: C.maroon, padding: '9px 16px', font: `400 13px ${F.sans}`, borderRadius: 2 }}>
            {l}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 18, marginTop: 28 }}>
        {results.map((p) => (
          <button key={p.id} className="slide-x" onClick={() => navigate(`/sarees/${p.slug}`)} style={{ display: 'flex', gap: 14, alignItems: 'center', background: 'none', border: 0, textAlign: 'left', padding: 0 }}>
            <span style={{ width: 60, height: 75, flex: 'none', background: `url(${p.img}) ${p.pos}/cover` }} />
            <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ font: `400 19px/1.1 ${F.serif}`, color: C.maroon }}>{p.name}</span>
              <span style={{ font: `400 13px ${F.sans}`, color: C.soft }}>{inr(p.price)}</span>
            </span>
          </button>
        ))}
      </div>
      {query && !results.length && (
        <p style={{ font: `400 15px/1.6 ${F.sans}`, color: C.soft, margin: '20px 0 0' }}>
          No sarees match yet. Our stylists can find one for you on WhatsApp.
        </p>
      )}
    </div>
  );
}
