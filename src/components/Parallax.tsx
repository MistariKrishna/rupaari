"use client";

import { useRef, type ReactNode } from "react";
import { prefersReducedMotion, useScrollFrame } from "@/lib/motion";

/** Frame that clips its child and drifts it against the scroll (child should fill it). */
export default function Parallax({ speed = 0.12, className = "", children }: { speed?: number; className?: string; children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useScrollFrame(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i || prefersReducedMotion()) return;
    const r = o.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.bottom < -200 || r.top > vh + 200) return;
    const offset = r.top + r.height / 2 - vh / 2;
    i.style.transform = `translate3d(0, ${(-offset * speed).toFixed(1)}px, 0)`;
  });

  return (
    <div ref={outer} className={`relative overflow-hidden ${className}`.trim()}>
      <div ref={inner} className="absolute inset-x-0 -inset-y-[14%] will-change-transform">
        {children}
      </div>
    </div>
  );
}