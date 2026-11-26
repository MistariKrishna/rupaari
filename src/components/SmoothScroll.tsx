"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Inertial ("buttery") mouse-wheel scrolling, the same feel as Lenis on davaris.gr.
 * Touch devices and reduced-motion users keep native scrolling.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion() || window.matchMedia("(pointer: coarse)").matches) return;

    const html = document.documentElement;
    let target = window.scrollY;
    let current = target;
    let running = false;
    let raf = 0;
    const EASE = 0.085;

    const max = () => Math.max(0, html.scrollHeight - window.innerHeight);

    const tick = () => {
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.4) {
        current = target;
        running = false;
      }
      window.scrollTo(0, current);
      if (running) raf = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.defaultPrevented) return;
      if (!html.hasAttribute("data-ready")) return;
      if (document.body.style.overflow === "hidden") return; // menu open
      const t = e.target as HTMLElement | null;
      if (t?.closest("textarea, select, [data-native-scroll]")) return;
      e.preventDefault();
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 32;
      else if (e.deltaMode === 2) dy *= window.innerHeight;
      if (!running) {
        current = window.scrollY;
        target = current;
      }
      target = Math.max(0, Math.min(max(), target + dy));
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    // Keep in sync when something else scrolls (keyboard, scrollbar drag, anchors, route change).
    const onScroll = () => {
      if (!running) {
        target = current = window.scrollY;
      }
    };
    const onResize = () => {
      target = Math.min(target, max());
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
