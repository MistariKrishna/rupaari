"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { heroSlides } from "@/lib/content";
import { images } from "@/lib/images";
import { TEXT_DEFAULTS, useHydrated, useSlot, useText } from "@/lib/siteContent";
import { Icon } from "./Icon";
import Media from "./Media";
import SplitText from "./SplitText";

// Set to false for a pure full-screen video with no text on top.
const SHOW_COPY = true;

/**
 * Full-screen video hero (plays the whole clip, then restarts). The header sits transparent on top of it.
 * Video: public/videos/hero.mp4 (+ poster images/hero.jpg), enabled with USE_VIDEOS in src/lib/images.ts.
 * Until then the animated woven art plays instead.
 */
export default function Hero() {
  const [failed, setFailed] = useState(false);
  const slot = useSlot(images.hero);
  const base = heroSlides[0];
  const copy = {
    eyebrow: useText("hero.eyebrow", TEXT_DEFAULTS["hero.eyebrow"]),
    title: useText("hero.title", TEXT_DEFAULTS["hero.title"]),
    line: useText("hero.line", TEXT_DEFAULTS["hero.line"]),
    cta: { label: useText("hero.cta", base.cta.label), href: useText("hero.href", base.cta.href) },
  };
  // Wait until the browser has read the admin changes before loading any hero file, so the old asset never flashes.
  const ready = useHydrated();
  const hasVideo = ready && Boolean(slot.video) && !failed;

  return (
    <section className="hero hero-pull" aria-label="Introduction">
      {hasVideo ? (
        <video className="absolute inset-0 h-full w-full object-cover object-[72%_center] lg:object-center" src={slot.video} poster={slot.poster} autoPlay muted loop playsInline preload="auto" aria-hidden="true" onError={() => setFailed(true)} />
      ) : (
        <Media tone="wine" className="absolute inset-0 h-full w-full" priority {...(ready ? slot : {})} />
      )}


      {SHOW_COPY && (
        <div className="hero-copy hero-copy--video">
          <p className="hero-eyebrow hero-in" style={{ "--d": "150ms" } as CSSProperties}>
            <i aria-hidden="true" />
            {copy.eyebrow}
          </p>
          <SplitText as="h1" text={copy.title} instant delay={250} className="hero-title" />
          <p className="hero-line hero-in" style={{ "--d": "800ms" } as CSSProperties}>
            {copy.line}
          </p>
          <div className="hero-in mt-7" style={{ "--d": "950ms" } as CSSProperties}>
            <Link href={copy.cta.href} className="btn btn-light">
              {copy.cta.label} <Icon name="arrow-right" />
            </Link>
          </div>
        </div>
      )}

      <div className="hero-in absolute bottom-7 right-[var(--gutter)] z-10 hidden items-center gap-6 md:flex" style={{ "--d": "1400ms" } as CSSProperties}>
        <span className="flex flex-col items-center gap-3 text-[10px] uppercase tracking-[.3em] text-ivory/80" aria-hidden="true">
          Scroll
          <span className="scroll-cue" />
        </span>
      </div>
    </section>
  );
}
