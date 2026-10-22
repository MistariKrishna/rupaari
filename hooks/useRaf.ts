'use client';
import { useEffect, useRef } from 'react';

/** Runs `cb(seconds, deltaSeconds, nowMs)` every animation frame while mounted. */
export function useRaf(cb: (t: number, dt: number, now: number) => void) {
  const ref = useRef(cb);
  useEffect(() => {
    ref.current = cb;
  });
  useEffect(() => {
    let id = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!document.hidden) ref.current(now / 1000, dt, now);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);
}
