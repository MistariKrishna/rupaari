"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Wine curtain that sweeps up over the page on every internal link click,
 * navigates underneath it, then lifts away to reveal the new page.
 */
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<"idle" | "in" | "out">("idle");
  const busy = useRef(false);
  const pending = useRef(false);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest("a");
      if (!a || !a.getAttribute("href")) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return; // hash / same-page links behave normally
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      e.preventDefault();
      e.stopPropagation();
      if (busy.current) return;
      busy.current = true;
      pending.current = true;
      setState("in");
      setTimeout(() => router.push(url.pathname + url.search + url.hash), 800);
      // Failsafe if navigation never completes.
      setTimeout(() => {
        if (pending.current) {
          pending.current = false;
          setState("out");
          setTimeout(() => {
            setState("idle");
            busy.current = false;
          }, 900);
        }
      }, 4500);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    window.scrollTo(0, 0);
    setTimeout(() => setState("out"), 150);
    setTimeout(() => {
      setState("idle");
      busy.current = false;
    }, 1100);
  }, [pathname]);

  return (
    <div className="curtain on-dark" data-s={state} aria-hidden="true">
      <span className="font-display text-[clamp(1.6rem,4vw,2.6rem)] uppercase tracking-[.2em] text-gold">Rupaari</span>
    </div>
  );
}