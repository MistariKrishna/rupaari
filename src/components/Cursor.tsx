"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Soft gold follower. Grows over links, and over anything with data-cursor="Label"
 * it becomes a burgundy disc carrying that label (e.g. "View"). Fine pointers only.
 */
export default function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = root.current;
    if (!el) return;
    let tx = -100;
    let ty = -100;
    let x = tx;
    let y = ty;
    let shown = false;
    let raf = 0;

    const move = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!shown) {
        shown = true;
        x = tx;
        y = ty;
        el.setAttribute("data-show", "");
      }
    };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const c = t?.closest<HTMLElement>("[data-cursor]");
      if (c) {
        el.setAttribute("data-m", "view");
        if (label.current) label.current.textContent = c.dataset.cursor ?? "";
      } else if (t?.closest("a, button, input, textarea, select, label")) {
        el.setAttribute("data-m", "link");
      } else {
        el.removeAttribute("data-m");
      }
    };
    const leave = () => {
      shown = false;
      el.removeAttribute("data-show");
    };
    const tick = () => {
      x += (tx - x) * 0.17;
      y += (ty - y) * 0.17;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <div ref={root} className="cur" aria-hidden="true">
      <div className="cur-dot">
        <span ref={label} />
      </div>
    </div>
  );
}
