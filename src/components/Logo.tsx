"use client";

import Link from "next/link";
import { useState } from "react";

const WINE = "/images/logo-wine.svg";
const IVORY = "/images/logo-ivory.svg";

/**
 * RUPAARI logo. Uses public/images/logo-wine.svg (on ivory) and logo-ivory.svg (over the hero video and on the dark menu).
 * If logo-ivory.svg is missing the wine file is turned white instead; if both are missing the coded wordmark shows.
 */
export default function Logo({ className = "", size = "md" }: { className?: string; size?: "md" | "lg" }) {
  const [wineFailed, setWineFailed] = useState(false);
  const [ivoryFailed, setIvoryFailed] = useState(false);
  const cls = `logo ${size === "lg" ? "logo--lg" : ""} ${className}`;

  if (wineFailed) {
    return (
      <Link href="/" aria-label="RUPAARI home" className={cls}>
        <span className="logo-mark">Rupaari</span>
        <span className="logo-orn" aria-hidden="true">
          <i className="l" />
          <b className="d s" />
          <b className="d" />
          <b className="d s" />
          <i className="l" />
        </span>
      </Link>
    );
  }

  return (
    <Link href="/" aria-label="RUPAARI home" className={`${cls} logo--img`} data-noivory={ivoryFailed || undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={WINE} alt="RUPAARI" className="logo-img logo-wine" onError={() => setWineFailed(true)} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IVORY} alt="" aria-hidden="true" className="logo-img logo-ivory" onError={() => setIvoryFailed(true)} />
    </Link>
  );
}