"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * Intro screen: the ivory logo (public/images/logo-ivory.svg) draws in left to right, falling back to rising letters if the file is missing, a gold line fills while a counter runs 0 to 100,
 * then the wine curtain lifts away and the hero animates in behind it.
 * Shown once per browser session (and skipped for reduced motion).
 */
export default function Preloader() {
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);
  const [noLogo, setNoLogo] = useState(false);
  const num = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (html.classList.contains("skip-pre") || html.hasAttribute("data-ready")) {
      setGone(true);
      return;
    }

    const DURATION = 2400;
    const t0 = performance.now();
    let raf = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const finish = () => {
      setDone(true);
      timers.push(
        setTimeout(() => {
          html.setAttribute("data-ready", "");
          try {
            sessionStorage.setItem("rp_pre", "1");
          } catch {
            /* storage unavailable: just show the intro again next visit */
          }
        }, 450),
      );
      timers.push(setTimeout(() => setGone(true), 1700));
    };

    const tick = (now: number) => {
      const p = Math.min((now - t0) / DURATION, 1);
      const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      if (num.current) num.current.textContent = String(Math.round(eased * 100));
      if (bar.current) bar.current.style.transform = `scaleX(${eased})`;
      if (p < 1) raf = requestAnimationFrame(tick);
      else timers.push(setTimeout(finish, 250));
    };
    raf = requestAnimationFrame(tick);

    // Failsafe: never leave the visitor stuck behind the intro.
    timers.push(
      setTimeout(() => {
        html.setAttribute("data-ready", "");
        setDone(true);
        setGone(true);
      }, 7000),
    );

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, []);

  if (gone) return null;

  return (
    <div className="preloader on-dark" data-done={done} aria-hidden="true">
      <div className="pre-center">
        {noLogo ? (
          <div className="pre-word">
            {"RUPAARI".split("").map((c, i) => (
              <span key={i} className="pre-mask">
                <span style={{ "--i": i } as CSSProperties}>{c}</span>
              </span>
            ))}
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/images/logo-ivory.svg" alt="" className="pre-logo" onError={() => setNoLogo(true)} />
        )}
        <div className="pre-line">
          <span ref={bar} />
        </div>
      </div>
      <div className="pre-count">
        <span ref={num}>0</span>
        <i>%</i>
      </div>
      <div className="pre-tag">Rediscover yourself</div>
    </div>
  );
}