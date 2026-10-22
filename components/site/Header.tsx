'use client';
import { useEffect, useState, type CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { C, F, EASE } from '@/lib/theme';
import { useSite } from './SiteProvider';

export function Header() {
  const s = useSite();
  const pathname = usePathname();
  const home = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - last;
      last = y;
      setScrolled(y > 40);
      setHidden((h) => (y < 500 || dy < -4 ? false : dy > 4 ? true : h));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const open = s.menuOpen;
  const solid = !home || scrolled;
  const compact = solid && !open;
  const ink = open ? C.sand : solid ? C.maroon : C.ivory;
  const hide = hidden && !open && !s.searchOpen;
  const plain: CSSProperties = { background: 'none', border: 0, color: 'inherit', padding: '12px 0' };
  const bar = (t: string, o = 1): CSSProperties => ({ height: 1, background: 'currentColor', transform: t, opacity: o, transition: 'transform .4s, opacity .3s' });

  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 80,
        transform: `translateY(${hide ? '-100%' : '0'})`,
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
        padding: '0 clamp(16px,3vw,44px)', height: compact ? 68 : 88,
        background: open ? 'transparent' : solid ? 'rgba(246,238,226,.92)' : 'transparent',
        color: ink, borderBottom: `1px solid ${compact ? 'rgba(176,138,78,.28)' : 'transparent'}`,
        backdropFilter: compact ? 'blur(10px)' : 'none',
        transition: `background .5s ease, height .4s ease, color .4s ease, border-color .5s ease, transform .5s ${EASE}`,
      }}
    >
      <button
        onClick={() => { s.setMenuOpen(!open); s.setSearchOpen(false); }}
        aria-expanded={open}
        style={{ ...plain, justifySelf: 'start', display: 'flex', alignItems: 'center', gap: 12, font: `400 12px ${F.sans}`, letterSpacing: '.2em' }}
      >
        <span style={{ display: 'flex', flexDirection: 'column', gap: 5, width: 20 }}>
          <span style={bar(open ? 'translateY(6px) rotate(45deg)' : 'none')} />
          <span style={bar('none', open ? 0 : 1)} />
          <span style={bar(open ? 'translateY(-6px) rotate(-45deg)' : 'none')} />
        </span>
        <span>{open ? 'CLOSE' : 'MENU'}</span>
      </button>

      <button onClick={() => s.navigate('/')} style={{ ...plain, padding: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <span style={{ font: `400 28px/1 ${F.serif}`, letterSpacing: '.24em', paddingLeft: '.24em' }}>RUPAARI</span>
        <span style={{ font: `400 8px/1 ${F.sans}`, letterSpacing: '.34em', paddingLeft: '.34em', opacity: 0.85 }}>REDISCOVER YOURSELF</span>
      </button>

      <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: 'clamp(14px,2vw,30px)', font: `400 11.5px ${F.sans}`, letterSpacing: '.18em' }}>
        <button onClick={() => { s.setSearchOpen(true); s.setMenuOpen(false); }} style={{ ...plain, font: 'inherit', letterSpacing: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 11, height: 11, border: '1.25px solid currentColor', borderRadius: '50%', display: 'inline-block' }} />
          <span className="hide-md">SEARCH</span>
        </button>
        <button className="hide-md" onClick={() => s.toast('Sign in with mobile OTP — coming soon')} style={{ ...plain, font: 'inherit', letterSpacing: 'inherit' }}>
          ACCOUNT
        </button>
        <button ref={s.bagIconRef} onClick={() => { s.setBagOpen(true); s.setMenuOpen(false); s.setSearchOpen(false); }} style={{ ...plain, font: 'inherit', letterSpacing: 'inherit' }}>
          BAG (<span ref={s.bagCountRef} style={{ display: 'inline-block' }}>{s.bag.length}</span>)
        </button>
      </div>
    </header>
  );
}
