"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion, useScrollFrame } from "@/lib/motion";

/** Huge outlined ticker. It drifts on its own and surges when you scroll. */
export default function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const x = useRef(0);
  const half = useRef(0);
  const still = useRef(false);

  useEffect(() => {
    still.current = prefersReducedMotion();
    const measure = () => {
      if (track.current) half.current = track.current.scrollWidth / 2;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useScrollFrame((_y, v) => {
    const t = track.current;
    if (!t || still.current || !half.current) return;
    x.current -= 0.8 + Math.min(Math.abs(v), 70) * 0.32;
    if (x.current <= -half.current) x.current += half.current;
    t.style.transform = `translate3d(${x.current.toFixed(1)}px, 0, 0)`;
  });

  const row = [...items, ...items];
  return (
    <div className={`marquee ${className}`.trim()} aria-hidden="true">
      <div ref={track} className="marquee-track">
        {row.map((t, i) => (
          <span key={i} className="marquee-item">
            {t}
            <i className="marquee-dot" />
          </span>
        ))}
      </div>
    </div>
  );
}