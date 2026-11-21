"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { prefersReducedMotion, useScrollFrame } from "@/lib/motion";

/** Pins the section while vertical scrolling slides the panels sideways. */
export default function HorizontalScroll({ children, label }: { children: ReactNode; label: string }) {
  const outer = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const dist = useRef(0);

  useEffect(() => {
    const measure = () => {
      const o = outer.current;
      const t = track.current;
      if (!o || !t) return;
      if (prefersReducedMotion()) {
        o.setAttribute("data-static", "");
        o.style.height = "";
        dist.current = 0;
        return;
      }
      dist.current = Math.max(0, t.scrollWidth - window.innerWidth);
      o.style.height = `${dist.current + window.innerHeight}px`;
    };
    measure();
    window.addEventListener("resize", measure);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (ro && track.current) ro.observe(track.current);
    return () => {
      window.removeEventListener("resize", measure);
      ro?.disconnect();
    };
  }, []);

  useScrollFrame(() => {
    const o = outer.current;
    const t = track.current;
    if (!o || !t || !dist.current) return;
    const p = Math.min(1, Math.max(0, -o.getBoundingClientRect().top / dist.current));
    t.style.transform = `translate3d(${(-p * dist.current).toFixed(1)}px, 0, 0)`;
    if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
  });

  return (
    <section ref={outer} className="hs on-dark bg-wine text-ivory" aria-label={label}>
      <div className="hs-sticky">
        <div ref={track} className="hs-track">
          {children}
        </div>
        <div className="hs-progress" aria-hidden="true">
          <span ref={bar} />
        </div>
      </div>
    </section>
  );
}