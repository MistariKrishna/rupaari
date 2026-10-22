'use client';
import { useEffect, useState } from 'react';
import { C, F } from '@/lib/theme';

export function Loader() {
  const [go, setGo] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const a = window.setTimeout(() => setGo(true), 60);
    const b = window.setTimeout(() => setDone(true), 1900);
    return () => { window.clearTimeout(a); window.clearTimeout(b); };
  }, []);

  return (
    <div
      aria-hidden={done}
      style={{
        position: 'fixed', inset: 0, zIndex: 300, background: C.cream,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28,
        opacity: done ? 0 : 1, pointerEvents: done ? 'none' : 'auto', transition: 'opacity .9s ease',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/logo.png"
        alt="Rupaari"
        style={{ width: 220, height: 220, objectFit: 'contain', mixBlendMode: 'multiply', transform: `scale(${go ? 1 : 0.92})`, transition: 'transform 1.8s cubic-bezier(.2,.7,.1,1)' }}
      />
      <div style={{ width: 160, height: 1, background: 'rgba(176,138,78,.25)', overflow: 'hidden' }}>
        <div style={{ height: 1, background: C.gold, width: go ? '100%' : '0%', transition: 'width 1.6s cubic-bezier(.6,0,.2,1)' }} />
      </div>
      <span style={{ font: `400 9px ${F.sans}`, letterSpacing: '.34em', color: C.gold }}>REDISCOVER YOURSELF</span>
    </div>
  );
}
