'use client';
import { useState } from 'react';
import { PRODUCTS, inr, FREE_SHIPPING_AT, GIFT_WRAP } from '@/lib/data';
import { C, F, EASE, EASE_IO } from '@/lib/theme';
import { useSite } from './SiteProvider';

export function BagDrawer() {
  const { bag, bagOpen: open, setBagOpen, removeFromBag, navigate, toast } = useSite();
  const [gift, setGift] = useState(false);
  const items = bag.map((id) => PRODUCTS[id]).filter((p): p is NonNullable<typeof p> => !!p);
  const subtotal = items.reduce((a, b) => a + b.price, 0) + (gift && items.length ? GIFT_WRAP : 0);
  const shipMsg = !items.length
    ? `Free express shipping above ${inr(FREE_SHIPPING_AT)}`
    : subtotal >= FREE_SHIPPING_AT
      ? 'You’ve unlocked free express shipping.'
      : `${inr(FREE_SHIPPING_AT - subtotal)} away from free express shipping`;

  return (
    <>
      <div
        onClick={() => setBagOpen(false)}
        style={{ position: 'fixed', inset: 0, zIndex: 95, background: 'rgba(43,20,20,.42)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .5s' }}
      />
      <aside
        aria-hidden={!open}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(100%,440px)', zIndex: 96, background: C.ivory,
          transform: `translateX(${open ? '0%' : '105%'})`, transition: `transform .6s ${EASE_IO}`,
          display: 'flex', flexDirection: 'column', boxShadow: '-30px 0 80px rgba(59,13,20,.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: `1px solid ${C.beige}` }}>
          <span style={{ font: `300 28px ${F.serif}`, color: C.maroon }}>Your Bag ({items.length})</span>
          <button onClick={() => setBagOpen(false)} style={{ background: 'none', border: 0, font: `500 11px ${F.sans}`, letterSpacing: '.2em', color: C.maroon, padding: '10px 0' }}>CLOSE ✕</button>
        </div>
        <div style={{ padding: '16px 28px', borderBottom: `1px solid ${C.beige}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ font: `400 13px ${F.sans}`, color: C.maroon }}>{shipMsg}</span>
          <div style={{ height: 2, background: C.beige }}>
            <div style={{ height: 2, background: C.gold, width: `${Math.min(100, (subtotal / FREE_SHIPPING_AT) * 100)}%`, transition: `width .8s ${EASE}` }} />
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 28px' }}>
          {items.map((b) => (
            <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '78px minmax(0,1fr)', gap: 16, padding: '18px 0', borderBottom: `1px solid ${C.beige}` }}>
              <div style={{ aspectRatio: '4/5', background: `url(${b.img}) ${b.pos}/cover` }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={{ font: `400 10px ${F.sans}`, letterSpacing: '.2em', color: C.gold }}>{b.coll.toUpperCase()}</span>
                <span style={{ font: `400 20px/1.1 ${F.serif}`, color: C.maroon }}>{b.name}</span>
                <span style={{ font: `400 14px ${F.sans}` }}>{inr(b.price)}</span>
                <button onClick={() => removeFromBag(b.id)} style={{ marginTop: 4, width: 'max-content', background: 'none', border: 0, borderBottom: `1px solid ${C.goldLight}`, padding: '2px 0', font: `400 11px ${F.sans}`, letterSpacing: '.16em', color: C.muted }}>
                  REMOVE
                </button>
              </div>
            </div>
          ))}
          {!items.length && (
            <div style={{ padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
              <span style={{ font: `300 30px ${F.serif}`, color: C.maroon }}>Your bag is waiting.</span>
              <span style={{ font: `300 15px ${F.sans}` }}>Every saree here is one of a kind.</span>
              <button className="cta cta-dark" onClick={() => navigate('/sarees')}>EXPLORE SAREES</button>
            </div>
          )}
        </div>
        {!!items.length && (
          <div style={{ padding: '20px 28px 28px', borderTop: `1px solid ${C.beige}`, display: 'flex', flexDirection: 'column', gap: 14, background: C.cream }}>
            <button onClick={() => setGift((g) => !g)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 0, padding: 0, font: `400 14px ${F.sans}`, color: C.ink }}>
              <span style={{ width: 16, height: 16, border: `1px solid ${C.maroon}`, background: gift ? C.maroon : 'transparent', color: C.ivory, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{gift ? '✓' : ''}</span>
              Gift wrap with a handwritten note
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', font: `400 15px ${F.sans}` }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 500 }}>{inr(subtotal)}</span>
            </div>
            <button className="cta cta-dark" data-mag="" onClick={() => toast('Checkout — mobile OTP, address, payment')} style={{ width: '100%', height: 54, justifyContent: 'center' }}>
              PROCEED TO CHECKOUT <span>→</span>
            </button>
            <span style={{ font: `300 12px ${F.sans}`, textAlign: 'center', color: C.muted }}>Secure payments · UPI, cards, netbanking, EMI</span>
          </div>
        )}
      </aside>
    </>
  );
}
