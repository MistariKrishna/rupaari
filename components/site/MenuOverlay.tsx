'use client';
import { collHref } from '@/lib/data';
import { C, F, EASE, EASE_IO } from '@/lib/theme';
import { useSite } from './SiteProvider';

export function MenuOverlay() {
  const { menuOpen: open, navigate, toast } = useSite();
  const items: [string, () => void][] = [
    ['Sarees', () => navigate('/sarees')],
    ['Collections', () => navigate(collHref('Kanjivaram Heritage'))],
    ['Occasions', () => navigate('/sarees?occ=Wedding')],
    ['Our Story', () => navigate('/#story')],
    ['Our Craft', () => navigate('/#craft')],
    ['Journal', () => navigate('/#journal')],
    ['Consultation', () => toast('Book a video consultation — coming soon')],
    ['Contact', () => toast('Contact — coming soon')],
  ];

  return (
    <div
      aria-hidden={!open}
      className="stack-md"
      style={{
        position: 'fixed', inset: 0, zIndex: 70, background: C.wine, color: C.cream,
        transform: `translateY(${open ? '0%' : '-100%'})`, transition: `transform .8s ${EASE_IO}`,
        display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)', gap: 48,
        padding: '120px clamp(24px,6vw,96px) 48px', overflowY: 'auto',
      }}
    >
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
        {items.map(([label, go], i) => {
          const delay = 200 + i * 60;
          return (
            <button
              key={label}
              onClick={go}
              className="menu-item"
              tabIndex={open ? 0 : -1}
              style={{
                display: 'flex', alignItems: 'baseline', gap: 22, background: 'none', border: 0, color: C.cream, textAlign: 'left', padding: '4px 0',
                opacity: open ? 1 : 0, transform: `translateY(${open ? 0 : 40}px)`,
                transition: `opacity .6s ease ${delay}ms, transform .8s ${EASE} ${delay}ms, color .3s`,
              }}
            >
              <span style={{ font: `400 11px ${F.sans}`, letterSpacing: '.2em', color: C.gold, width: 24 }}>0{i + 1}</span>
              <span style={{ font: `300 clamp(34px,4.6vw,62px)/1.05 ${F.serif}`, letterSpacing: '.02em' }}>{label}</span>
            </button>
          );
        })}
      </nav>
      <div className="hide-md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28, opacity: open ? 1 : 0, transition: 'opacity .8s ease .5s' }}>
        <div style={{ aspectRatio: '4/5', maxHeight: '56vh', borderRadius: '999px 999px 0 0', overflow: 'hidden', background: 'url(/assets/img-portrait.png) center/cover' }} />
        <div style={{ font: `400 30px/1.2 ${F.script}`, color: C.goldLight }}>Same roots. New dreams.</div>
        <div style={{ display: 'flex', gap: 24, font: `400 11px ${F.sans}`, letterSpacing: '.2em', color: C.goldLight, flexWrap: 'wrap' }}>
          <span>INSTAGRAM</span><span>WHATSAPP</span><span>PINTEREST</span><span>EN · தமிழ் · తెలుగు</span>
        </div>
      </div>
    </div>
  );
}
