"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

export type RevealVariant = "up" | "fade" | "scale" | "left" | "right" | "clip";

interface Props {
  as?: ElementType;
  variant?: RevealVariant;
  /** delay in ms, for staggering siblings */
  delay?: number;
  threshold?: number;
  className?: string;
  children: ReactNode;
}

/** Fades/slides/clips its children in once, when they scroll into view. */
export default function Reveal({ as: Tag = "div", variant = "up", delay = 0, threshold = 0.15, className = "", children }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
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
      { threshold, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <Tag ref={ref} className={`rv ${className}`.trim()} data-v={variant} data-in={shown} style={{ "--d": `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  );
}
