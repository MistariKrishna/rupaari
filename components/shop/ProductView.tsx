'use client';
import { useEffect, useRef, useState } from 'react';
import { PRODUCTS, IMG, SWATCHES, TRUST, ACCORDION_TITLES, accordionBody, inr } from '@/lib/data';
import { C, F, EASE } from '@/lib/theme';
import { useRaf } from '@/hooks/useRaf';
import { useSite } from '@/components/site/SiteProvider';
import { Parallax } from '@/components/ui/Parallax';
import { Reveal } from '@/components/ui/Reveal';
import { ProductCard } from '@/components/ui/ProductCard';

export function ProductView({ id }: { id: number }) {
  const p = PRODUCTS[id]!;
  const { navigate, addToBag, toggleWish, wish, bag, setBagOpen } = useSite();
  const [gal, setGal] = useState(0);
  const [sw, setSw] = useState(0);
  const [acc, setAcc] = useState(0);
  const [adding, setAdding] = useState(false);
  const [pin, setPin] = useState('');
  const [pinRes, setPinRes] = useState('');
  const zoomRef = useRef<HTMLDivElement>(null);
  const stockDot = useRef<HTMLSpanElement>(null);
  const { toast } = useSite();

  useEffect(() => { setGal(0); setSw(0); setAcc(0); setPinRes(''); }, [id]);

  useRaf((t) => {
    if (!stockDot.current) return;
    const k = (t % 1.6) / 1.6;
    stockDot.current.style.boxShadow = `0 0 0 ${k * 9}px rgba(176,138,78,${(1 - k) * 0.5})`;
  });

  const gallery = [
    { img: p.img, pos: p.pos },
    { img: p.img2, pos: p.pos2 },
    { img: IMG('loom'), pos: '30% 50%' },
    { img: IMG('arch'), pos: 'center' },
  ];
  const main = gallery[gal]!;
  const inBag = bag.includes(p.id);
  const saved = !!wish[p.id];
  const town = p.region.split(',')[0]!;
  const related = PRODUCTS.filter((x) => x.id !== p.id && (x.coll === p.coll || x.occ === p.occ)).slice(0, 4);
  const bodies = accordionBody(p);

  const onAdd = () => {
    if (adding) return;
    setAdding(true);
    window.setTimeout(() => {
      addToBag(p.id, zoomRef.current?.parentElement ?? null);
      setAdding(false);
    }, 380);
  };
  const buyNow = () => {
    if (!inBag) addToBag(p.id);
    setBagOpen(true);
  };
  const checkPin = () => {
    if (pin.length !== 6) { setPinRes(''); toast('Enter a 6-digit pincode'); return; }
    const d = new Date(Date.now() + 4 * 864e5).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    setPinRes(`Delivered by ${d} · Free shipping · COD available`);
  };

  return (
    <>
      <section style={{ padding: '104px clamp(20px,4vw,64px) 80px', maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ font: `400 11px ${F.sans}`, letterSpacing: '.2em', color: C.muted, marginBottom: 24, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 0, padding: 0, font: 'inherit', letterSpacing: 'inherit', color: 'inherit' }}>HOME</button>/
          <button onClick={() => navigate('/sarees')} style={{ background: 'none', border: 0, padding: 0, font: 'inherit', letterSpacing: 'inherit', color: 'inherit' }}>SAREES</button>/
          <span style={{ color: C.maroon }}>{p.name.toUpperCase()}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,440px),1fr))', gap: 'clamp(32px,5vw,80px)', alignItems: 'start' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '76px minmax(0,1fr)', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {gallery.map((g, i) => (
                <button key={i} aria-label={`Image ${i + 1}`} onClick={() => setGal(i)} style={{ aspectRatio: '4/5', padding: 0, border: `1px solid ${i === gal ? C.maroon : 'transparent'}`, background: `url(${g.img}) ${g.pos}/cover`, opacity: i === gal ? 1 : 0.6, transition: 'opacity .3s, border-color .3s' }} />
              ))}
            </div>
            <div
              data-img=""
              onMouseMove={(e) => {
                const z = zoomRef.current;
                if (!z) return;
                const r = e.currentTarget.getBoundingClientRect();
                z.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
                z.style.transform = 'scale(1.9)';
              }}
              onMouseLeave={() => { if (zoomRef.current) zoomRef.current.style.transform = 'scale(1)'; }}
              style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden', background: C.beige, cursor: 'zoom-in' }}
            >
              <div ref={zoomRef} style={{ position: 'absolute', inset: 0, background: `url(${main.img}) ${main.pos}/cover`, transition: `transform .5s ${EASE}` }} />
              <span style={{ position: 'absolute', left: 14, bottom: 14, background: 'rgba(251,247,240,.92)', color: C.maroon, font: `500 10px ${F.sans}`, letterSpacing: '.18em', padding: '7px 11px', pointerEvents: 'none' }}>TRUE COLOUR IN DAYLIGHT</span>
            </div>
          </div>

          <div style={{ position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 22 }}>
            <Reveal as="span" style={{ font: `400 11.5px ${F.sans}`, letterSpacing: '.22em', color: C.gold }}>{p.coll.toUpperCase()} · {p.region.toUpperCase()}</Reveal>
            <Reveal as="h1" delay={60} style={{ margin: 0, font: `300 clamp(40px,4vw,58px)/1 ${F.serif}`, color: C.maroon }}>{p.name}</Reveal>
            <Reveal as="p" delay={100} style={{ margin: 0, font: `italic 300 22px/1.4 ${F.serif}`, color: C.wine }}>{p.line}</Reveal>
            <Reveal delay={140} style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span style={{ font: `400 26px ${F.sans}`, color: C.ink }}>{inr(p.price)}</span>
              <span style={{ font: `400 12px ${F.sans}`, color: C.muted }}>Inclusive of all taxes</span>
            </Reveal>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, font: `400 14px ${F.sans}`, color: C.maroon }}>
              <span ref={stockDot} style={{ width: 8, height: 8, borderRadius: '50%', background: C.gold }} />
              Only 1 piece — woven for you
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ font: `400 11px ${F.sans}`, letterSpacing: '.2em', color: C.muted }}>COLOUR — <span style={{ color: C.maroon }}>{SWATCHES[sw]!.n}</span></span>
              <div style={{ display: 'flex', gap: 12 }}>
                {SWATCHES.map((s, i) => (
                  <button key={s.n} aria-label={s.n} onClick={() => setSw(i)} style={{ width: 34, height: 34, borderRadius: '50%', background: s.c, border: `3px solid ${C.cream}`, boxShadow: `0 0 0 1px ${i === sw ? C.maroon : C.goldLight}`, transition: 'box-shadow .3s' }} />
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) 52px', gap: 10 }}>
              <button className="cta cta-dark" data-mag="" onClick={onAdd} style={{ width: '100%', height: 54, justifyContent: 'center' }}>
                {adding ? 'ADDING…' : inBag ? 'IN YOUR BAG ✓' : 'ADD TO BAG'}
              </button>
              <button className="cta cta-ghost" onClick={buyNow} style={{ width: '100%', height: 54, justifyContent: 'center', borderColor: C.maroon }}>BUY NOW</button>
              <button aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'} onClick={() => toggleWish(p.id)} style={{ height: 54, background: 'transparent', border: `1px solid ${C.goldLight}`, color: saved ? C.maroon : C.gold, fontSize: 20 }}>{saved ? '♥' : '♡'}</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 18, background: C.ivory, border: `1px solid ${C.beige}` }}>
              <span style={{ font: `400 11px ${F.sans}`, letterSpacing: '.2em', color: C.muted }}>CHECK DELIVERY</span>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  value={pin}
                  onChange={(e) => { setPin(e.target.value.replace(/\D/g, '').slice(0, 6)); setPinRes(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && checkPin()}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter pincode"
                  style={{ flex: 1, minWidth: 0, height: 46, border: `1px solid ${C.goldLight}`, background: '#fff', padding: '0 14px', font: `400 15px ${F.sans}`, outline: 'none', color: C.ink, letterSpacing: '.1em' }}
                />
                <button onClick={checkPin} style={{ height: 46, padding: '0 20px', background: 'transparent', border: `1px solid ${C.maroon}`, color: C.maroon, font: `500 11px ${F.sans}`, letterSpacing: '.2em' }}>CHECK</button>
              </div>
              {pinRes && <span style={{ font: `400 14px/1.5 ${F.sans}`, color: C.green }}>{pinRes}</span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 8, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, padding: '16px 0' }}>
              {TRUST.map((t) => (
                <div key={t} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
                  <span style={{ width: 8, height: 8, border: `1px solid ${C.gold}`, transform: 'rotate(45deg)' }} />
                  <span style={{ font: `400 11.5px/1.4 ${F.sans}`, color: C.maroon }}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {ACCORDION_TITLES.map((title, i) => {
                const open = i === acc;
                return (
                  <div key={title} style={{ borderBottom: `1px solid ${C.line}` }}>
                    <button onClick={() => setAcc(open ? -1 : i)} aria-expanded={open} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 0, padding: '18px 0', font: `500 12px ${F.sans}`, letterSpacing: '.2em', color: C.maroon }}>
                      {title}
                      <span style={{ fontSize: 18, transform: `rotate(${open ? 45 : 0}deg)`, transition: 'transform .35s' }}>+</span>
                    </button>
                    <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: `grid-template-rows .45s ${EASE}` }}>
                      <div style={{ overflow: 'hidden' }}>
                        <p style={{ margin: '0 0 18px', font: `300 15px/1.7 ${F.sans}`, color: C.ink }}>{bodies[i]}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="stack-md" style={{ position: 'relative', overflow: 'hidden', background: C.wine, color: C.ivory, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))' }}>
        <div style={{ position: 'relative', minHeight: 420, overflow: 'hidden' }}>
          <Parallax factor={0.1} inset="-14% 0" style={{ background: `url(${IMG('loom')}) 40% 50%/cover` }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22, padding: 'clamp(56px,6vw,96px)' }}>
          <Reveal as="span" style={{ font: `400 11.5px ${F.sans}`, letterSpacing: '.22em', color: C.goldLight }}>THE STORY</Reveal>
          <Reveal as="h2" delay={80} style={{ margin: 0, font: `300 clamp(36px,3.6vw,54px)/1.02 ${F.serif}` }}>WOVEN IN<br />{town.toUpperCase()}.</Reveal>
          <Reveal as="p" delay={140} style={{ margin: 0, font: `300 17px/1.7 ${F.sans}`, color: C.sand, maxWidth: 440 }}>
            Each piece in {p.coll} is woven by a single family of weavers on a pit loom. The border and body are woven separately and interlocked by hand — a technique passed from parent to child.
          </Reveal>
          <Reveal as="span" delay={200} style={{ font: `400 34px ${F.script}`, color: C.goldLight }}>More than a saree, it’s a feeling.</Reveal>
        </div>
      </section>

      {!!related.length && (
        <section style={{ padding: 'clamp(64px,7vw,110px) clamp(24px,5vw,80px)', maxWidth: 1440, margin: '0 auto' }}>
          <Reveal as="h3" style={{ margin: '0 0 32px', font: `300 clamp(30px,3vw,44px)/1 ${F.serif}`, color: C.maroon }}>MORE FROM THE LOOM</Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 'clamp(16px,2vw,28px)' }}>
            {related.map((r, i) => <ProductCard key={r.id} p={r} delay={i * 90} />)}
          </div>
        </section>
      )}
    </>
  );
}
