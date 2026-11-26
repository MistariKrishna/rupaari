"use client";

import { useEffect, useRef } from "react";

type FrameCallback = (scrollY: number, velocity: number) => void;

const subscribers = new Set<FrameCallback>();
let raf = 0;
let lastY = 0;

function loop() {
  const y = window.scrollY;
  const v = y - lastY;
  lastY = y;
  subscribers.forEach((cb) => cb(y, v));
  raf = requestAnimationFrame(loop);
}

/** One shared requestAnimationFrame loop for every scroll-driven effect on the page. */
export function useScrollFrame(cb: FrameCallback) {
  const ref = useRef(cb);
  ref.current = cb;

  useEffect(() => {
    const fn: FrameCallback = (y, v) => ref.current(y, v);
    subscribers.add(fn);
    if (subscribers.size === 1) {
      lastY = window.scrollY;
      raf = requestAnimationFrame(loop);
    }
    return () => {
      subscribers.delete(fn);
      if (subscribers.size === 0) cancelAnimationFrame(raf);
    };
  }, []);
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
