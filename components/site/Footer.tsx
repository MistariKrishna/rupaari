'use client';
import { useRef, useState } from 'react';
import { collHref } from '@/lib/data';
import { C, F, clamp01 } from '@/lib/theme';
import { useRaf } from '@/hooks/useRaf';
import { useSite } from './SiteProvider';

const LETTERS = 'RUPAARI'.split('');
const SOCIALS = ['IG', 'FB', 'PIN', 'YT', 'WA'];

export function Footer() {
  const { navigate, toast, calm } = useSite();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const footRef = useRef<HTMLElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const clockRef = useRef<HTMLSpanElement>(null);
  const loomMsgRef = useRef<HTMLSpanElement>(null);
  const loomDotRef = useRef<HTMLSpanElement>(null);
  const lastClock = useRef(0);

  const cols: { h: string; links: [string, () => void][] }[] = [
    { h: 'SHOP', links: [
      ['All Sarees', () => navigate('/sarees')],
      ['Kanjivaram', () => navigate(collHref('Kanjivaram Heritage'))],
      ['Bridal Edit', () => navigate(collHref('Bridal Edit'))],
      ['Kerala Kasavu', () => navigate(collHref('Kerala Kasavu'))],
      ['New Arrivals', () => navigate('/sarees')],
    ] },
    { h: 'THE HOUSE', links: [
      ['Our Story', () => navigate('/#story')],
      ['Our Craft', () => navigate('/#craft')],
      ['Journal', () => navigate('/#journal')],
      ['Consultation', () => toast('Book a video consultation — coming soon')],
    ] },
    { h: 'HELP', links: [
      ['Track Order', () => toast('Order tracking — coming soon')],
      ['Shipping', () => toast('Shipping policy')],
      ['Returns', () => toast('7-day returns policy')],
      ['Care Guide', () => toast('Silk care guide')],
      ['Contact', () => toast('Contact — coming soon')],
    ] },
  ];

  useRaf((t, _dt, now) => {
    const ft = footRef.current;
    if (!ft) return;
    const vh = window.innerHeight;
    const r = ft.getBoundingClientRect();
    if (r.top >= vh) return;
    const sp = calm ? 0.25 : 1;
    const p = clamp01((vh - r.top) / (Math.min(r.height, vh) * 0.9));
    letterRefs.current.forEach((l, i) => {
      if (!l) return;
      const q = clamp01(p * 1.6 - i * 0.08);
      l.style.transform = `translateY(${Math.pow(1 - q, 3) * 105}%)`;
      l.style.backgroundPosition = `${(t * 12 * sp + i * 14) % 300}% 0`;
    });
    if (clockRef.current && loomMsgRef.current && now - lastClock.current > 1000) {
      lastClock.current = now;
      const d = new Date();
      const ist = new Date(d.getTime() + (d.getTimezoneOffset() + 330) * 60000);
      const hh = ist.getHours();
      clockRef.current.textContent = ist.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      loomMsgRef.current.textContent = hh >= 7 && hh < 19 ? 'the looms are working' : 'the looms are resting for the night';
    }
    if (loomDotRef.current) {
      const k = (t % 1.8) / 1.8;
      loomDotRef.current.style.boxShadow = `0 0 0 ${k * 10}px rgba(217,194,147,${(1 - k) * 0.5})`;
    }
  });

  const subscribe = () => {
    if (!/\S+@\S+\.\S+/.test(email)) return toast('Please enter a valid email');
    setSubscribed(true);
  };
  const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer ref={footRef} style={{ position: 'relative', overflow: 'hidden', background: C.deep, color: C.sand }}>
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg,rgba(217,194,147,.05) 0 1px,transparent 1px 12.5%)', pointerEvents: 'none' }} />
      <div className="stack-md" style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)', gap: 'clamp(40px,6vw,96px)', padding: 'clamp(72px,8vw,110px) clamp(24px,5vw,80px) 48px', maxWidth: 1500, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <span style={{ font: `400 11.5px ${F.sans}`, letterSpacing: '.26em', color: C.goldLight }}>JOIN OUR JOURNEY</span>
          <h3 style={{ margin: 0, font: `300 clamp(38px,4.4vw,66px)/1 ${F.serif}`, color: C.ivory }}>New weaves, loom stories<br />and private previews.</h3>
          {subscribed ? (
            <span style={{ font: `400 44px ${F.script}`, color: C.goldLight }}>Welcome to the journey.</span>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid rgba(217,194,147,.5)', maxWidth: 560, marginTop: 10 }}>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && subscribe()}
                placeholder="Your email address"
                type="email"
                style={{ flex: 1, minWidth: 0, height: 62, border: 0, background: 'transparent', color: C.ivory, font: `300 22px ${F.serif}`, outline: 'none', letterSpacing: '.02em' }}
              />
              <button className="pill-sub" data-mag="" onClick={subscribe}>SUBSCRIBE <span>→</span></button>
            </div>
          )}
          <span style={{ font: `300 12px ${F.sans}`, color: 'rgba(241,231,216,.7)' }}>Prefer WhatsApp? Add your number at checkout. We write twice a month, never more.</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14, padding: '16px 18px', border: '1px solid rgba(217,194,147,.25)', width: 'max-content', maxWidth: '100%' }}>
            <span ref={loomDotRef} style={{ width: 8, height: 8, borderRadius: '50%', background: C.goldLight, flex: 'none' }} />
            <span style={{ font: `400 12.5px ${F.sans}`, color: C.sand }}>
              It is <span ref={clockRef} style={{ color: C.ivory, fontWeight: 500 }}>--:--</span> in Kanchipuram — <span ref={loomMsgRef}>the looms are working</span>.
            </span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 28 }}>
          {cols.map((c) => (
            <div key={c.h} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span style={{ font: `500 10.5px ${F.sans}`, letterSpacing: '.24em', color: C.gold }}>{c.h}</span>
              {c.links.map(([n, go]) => (
                <button key={n} className="foot-link" onClick={go}><span className="bar" />{n}</button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap', padding: '24px clamp(24px,5vw,80px)', maxWidth: 1500, margin: '0 auto', borderTop: '1px solid rgba(176,138,78,.25)' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {SOCIALS.map((s) => <a key={s} href="#" className="social">{s}</a>)}
        </div>
        <span style={{ font: `400 34px ${F.script}`, color: C.goldLight }}>More than a saree, it’s a feeling.</span>
        <span style={{ font: `400 10.5px ${F.sans}`, letterSpacing: '.18em', color: C.goldLight }}>UPI · VISA · MASTERCARD · RUPAY · COD</span>
      </div>

      <div onClick={toTop} title="Back to the beginning" style={{ position: 'relative', cursor: 'pointer', padding: '0 clamp(16px,3vw,48px)', marginTop: 10, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', font: `300 clamp(80px,19.5vw,330px)/.8 ${F.serif}`, paddingTop: '.08em' }}>
          {LETTERS.map((c, i) => (
            <span key={i} style={{ display: 'block', overflow: 'hidden', paddingBottom: '.04em' }}>
              <span
                ref={(el) => { letterRefs.current[i] = el; }}
                style={{
                  display: 'block', transform: 'translateY(105%)',
                  background: 'linear-gradient(100deg,#5A1520 0%,#B08A4E 30%,#F1E7D8 45%,#B08A4E 60%,#5A1520 100%)',
                  backgroundSize: '300% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                }}
              >
                {c}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '18px clamp(24px,5vw,80px) 26px', font: `300 12px ${F.sans}`, color: 'rgba(241,231,216,.7)' }}>
        <span>© {new Date().getFullYear()} Rupaari. All rights reserved.</span>
        <span style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}><span>Shipping</span><span>Returns</span><span>Privacy</span><span>Terms</span><span>Authenticity</span></span>
        <button onClick={toTop} style={{ background: 'none', border: 0, padding: 0, color: C.goldLight, font: `500 11px ${F.sans}`, letterSpacing: '.22em' }}>BACK TO THE BEGINNING ↑</button>
      </div>
    </footer>
  );
}
