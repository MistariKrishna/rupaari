'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PRODUCTS, WEAVES, FEATURED, IMG, inr, type Colour, type Occasion } from '@/lib/data';
import { C, F } from '@/lib/theme';
import { useSite } from '@/components/site/SiteProvider';
import { Parallax } from '@/components/ui/Parallax';
import { Reveal } from '@/components/ui/Reveal';
import { ProductCard } from '@/components/ui/ProductCard';

const MAX_PRICE = 130000;
const COLOURS: [Colour, string][] = [['Maroon', '#5A1520'], ['Ivory', '#EFE4CF'], ['Gold', '#C9A45C']];
const OCCASIONS: Occasion[] = ['Wedding', 'Festive', 'Everyday'];
type Sort = 'new' | 'low' | 'high';

export function CollectionView() {
  const { navigate } = useSite();
  const params = useSearchParams();
  const weaveParam = params.get('weave');
  const occParam = params.get('occ');

  const [fWeave, setFWeave] = useState<string[]>([]);
  const [fColour, setFColour] = useState<Colour[]>([]);
  const [fOcc, setFOcc] = useState<Occasion[]>([]);
  const [fPrice, setFPrice] = useState(MAX_PRICE);
  const [sort, setSort] = useState<Sort>('new');
  const [cols, setCols] = useState(3);

  useEffect(() => {
    setFWeave(weaveParam ? [weaveParam] : []);
    setFOcc(occParam && (OCCASIONS as string[]).includes(occParam) ? [occParam as Occasion] : []);
    setFColour([]);
    setFPrice(MAX_PRICE);
  }, [weaveParam, occParam]);

  const toggle = <T,>(list: T[], v: T, set: (x: T[]) => void) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const clear = () => { setFWeave([]); setFColour([]); setFOcc([]); setFPrice(MAX_PRICE); };

  const list = useMemo(() => {
    const out = PRODUCTS.filter(
      (p) => (!fWeave.length || fWeave.includes(p.coll)) && (!fColour.length || fColour.includes(p.colour)) && (!fOcc.length || fOcc.includes(p.occ)) && p.price <= fPrice,
    );
    if (sort === 'low') return [...out].sort((a, b) => a.price - b.price);
    if (sort === 'high') return [...out].sort((a, b) => b.price - a.price);
    return out;
  }, [fWeave, fColour, fOcc, fPrice, sort]);

  const title = fWeave.length === 1 ? fWeave[0]! : 'All Sarees';
  const fe = FEATURED.find((f) => f.weave === title);
  const hero = fe ? { img: fe.img, pos: fe.pos } : { img: IMG('collections'), pos: '60% 40%' };

  return (
    <>
      <section style={{ position: 'relative', height: 'clamp(380px,52vh,520px)', overflow: 'hidden', color: C.ivory, background: C.wine }}>
        <Parallax factor={0.16} inset="-14% 0" style={{ background: `url(${hero.img}) ${hero.pos}/cover` }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(59,13,20,.85),rgba(59,13,20,.3) 60%,rgba(59,13,20,.1)),linear-gradient(0deg,rgba(59,13,20,.5),transparent 40%)' }} />
        <div style={{ position: 'absolute', left: 'clamp(24px,5vw,80px)', bottom: 'clamp(40px,6vw,72px)', display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 640 }}>
          <Reveal as="span" style={{ font: `400 11.5px ${F.sans}`, letterSpacing: '.22em', color: C.goldLight }}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 0, padding: 0, color: 'inherit', font: 'inherit', letterSpacing: 'inherit' }}>HOME</button>  /  SAREES
          </Reveal>
          <Reveal as="h1" delay={80} style={{ margin: 0, font: `300 clamp(46px,6vw,88px)/.98 ${F.serif}` }}>{title}</Reveal>
          <Reveal as="p" delay={140} style={{ margin: 0, font: `300 17px/1.6 ${F.sans}`, color: C.sand }}>{fe ? fe.d : 'South Indian silk sarees, for every chapter of you.'}</Reveal>
        </div>
      </section>

      <div style={{ position: 'sticky', top: 68, zIndex: 20, background: 'rgba(246,238,226,.94)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${C.line}`, padding: '0 clamp(24px,5vw,80px)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, font: `400 12px ${F.sans}`, letterSpacing: '.14em', color: C.maroon }}>
        <span>{list.length} {list.length === 1 ? 'SAREE' : 'SAREES'}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            SORT
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} style={{ border: 0, background: 'transparent', color: C.maroon, font: `400 13px ${F.sans}`, padding: '6px 2px', outline: 'none', cursor: 'pointer' }}>
              <option value="new">New</option>
              <option value="low">Price low–high</option>
              <option value="high">Price high–low</option>
            </select>
          </label>
          <div className="hide-md" style={{ display: 'flex', gap: 4 }}>
            {[2, 3, 4].map((n) => (
              <button key={n} onClick={() => setCols(n)} style={{ width: 34, height: 34, border: `1px solid ${n === cols ? C.maroon : C.goldLight}`, background: n === cols ? C.maroon : 'transparent', color: n === cols ? C.ivory : C.maroon, font: `400 12px ${F.sans}`, transition: 'all .3s' }}>{n}</button>
            ))}
          </div>
        </div>
      </div>

      <section className="stack-md" style={{ display: 'grid', gridTemplateColumns: '240px minmax(0,1fr)', gap: 'clamp(24px,4vw,56px)', padding: '40px clamp(24px,5vw,80px) 110px', maxWidth: 1500, margin: '0 auto' }}>
        <aside style={{ position: 'sticky', top: 148, alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: 30 }}>
          <FilterGroup title="WEAVE">
            {WEAVES.map((n) => {
              const on = fWeave.includes(n);
              return (
                <button key={n} onClick={() => toggle(fWeave, n, setFWeave)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 0, padding: '3px 0', textAlign: 'left', font: `400 14px ${F.sans}`, color: C.ink }}>
                  <span style={{ width: 15, height: 15, border: `1px solid ${C.maroon}`, background: on ? C.maroon : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.ivory, fontSize: 10, transition: 'background .25s' }}>{on ? '✓' : ''}</span>
                  {n}
                </button>
              );
            })}
          </FilterGroup>
          <FilterGroup title="COLOUR">
            <div style={{ display: 'flex', gap: 12 }}>
              {COLOURS.map(([n, hex]) => (
                <button key={n} title={n} aria-label={n} onClick={() => toggle(fColour, n, setFColour)} style={{ width: 30, height: 30, borderRadius: '50%', background: hex, border: `2px solid ${C.cream}`, boxShadow: `0 0 0 1px ${fColour.includes(n) ? C.maroon : C.goldLight}`, transition: 'box-shadow .3s' }} />
              ))}
            </div>
          </FilterGroup>
          <FilterGroup title="OCCASION">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {OCCASIONS.map((n) => {
                const on = fOcc.includes(n);
                return (
                  <button key={n} onClick={() => toggle(fOcc, n, setFOcc)} style={{ padding: '8px 14px', border: `1px solid ${C.maroon}`, background: on ? C.maroon : 'transparent', color: on ? C.ivory : C.maroon, font: `400 13px ${F.sans}`, borderRadius: 2, transition: 'all .3s' }}>{n}</button>
                );
              })}
            </div>
          </FilterGroup>
          <FilterGroup title="PRICE UP TO">
            <input type="range" min={8000} max={MAX_PRICE} step={1000} value={fPrice} onChange={(e) => setFPrice(Number(e.target.value))} />
            <span style={{ font: `400 14px ${F.sans}`, color: C.maroon }}>{inr(fPrice)}</span>
          </FilterGroup>
          <button onClick={clear} style={{ width: 'max-content', background: 'none', border: 0, borderBottom: `1px solid ${C.goldLight}`, padding: '6px 0', font: `500 11px ${F.sans}`, letterSpacing: '.2em', color: C.maroon }}>CLEAR ALL</button>
        </aside>

        <div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill,minmax(max(200px, calc((100% - ${(cols - 1) * 24}px) / ${cols})),1fr))`, gap: 'clamp(16px,2vw,28px) clamp(14px,1.6vw,24px)' }}>
            {list.map((p, i) => <ProductCard key={p.id} p={p} delay={(i % 4) * 90} showLine />)}
          </div>
          {!list.length && (
            <div style={{ padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
              <span style={{ font: `300 40px ${F.serif}`, color: C.maroon }}>This thread has come loose.</span>
              <span style={{ font: `300 16px ${F.sans}` }}>No sarees match these filters. Try fewer, or let a stylist help.</span>
              <button className="cta cta-dark" onClick={clear}>CLEAR FILTERS</button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span style={{ font: `500 11px ${F.sans}`, letterSpacing: '.22em', color: C.gold }}>{title}</span>
      {children}
    </div>
  );
}
