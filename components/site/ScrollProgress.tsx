'use client';
import { useRef } from 'react';
import { useRaf } from '@/hooks/useRaf';

export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  const cache = useRef({ h: 0, at: 0 });
  useRaf((_t, _dt, now) => {
    if (!bar.current) return;
    if (now - cache.current.at > 1000) cache.current = { h: document.documentElement.scrollHeight - window.innerHeight, at: now };
    const H = cache.current.h;
    bar.current.style.transform = `scaleX(${H > 0 ? window.scrollY / H : 0})`;
  });
  return (
    <div
      ref={bar}
      aria-hidden
      style={{ position: 'fixed', left: 0, top: 0, height: 2, width: '100%', zIndex: 85, background: 'linear-gradient(90deg,#B08A4E,#F1E7D8,#B08A4E)', transformOrigin: '0 50%', transform: 'scaleX(0)', pointerEvents: 'none' }}
    />
  );
}
