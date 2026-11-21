"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties, type ElementType } from "react";

interface Props {
  text: string;
  as?: ElementType;
  className?: string;
  id?: string;
  /** reveal word by word (default) or letter by letter */
  by?: "words" | "chars";
  /** extra delay in ms */
  delay?: number;
  /** play on load (after the preloader) instead of when scrolled into view */
  instant?: boolean;
}

/** Masked rise-up text reveal, the signature davaris heading animation. */
export default function SplitText({ text, as: Tag = "div", className = "", id, by = "words", delay = 0, instant = false }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (instant) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [instant]);

  const words = text.split(" ");
  let n = 0;

  return (
    <Tag
      ref={ref}
      id={id}
      aria-label={text}
      className={`split ${className}`.trim()}
      data-in={shown}
      data-instant={instant ? "" : undefined}
      style={{ "--d": `${delay}ms`, "--st": by === "chars" ? "34ms" : "80ms" } as CSSProperties}
    >
      <span aria-hidden="true">
        {words.map((w, wi) => (
          <Fragment key={wi}>
          <span className="sw">
            {by === "chars" ? (
              w.split("").map((c, ci) => (
                <span key={ci} className="sm">
                  <span className="sc" style={{ "--i": n++ } as CSSProperties}>
                    {c}
                  </span>
                </span>
              ))
            ) : (
              <span className="sm">
                <span className="sc" style={{ "--i": n++ } as CSSProperties}>
                  {w}
                </span>
              </span>
            )}
          </span>
          {wi < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}