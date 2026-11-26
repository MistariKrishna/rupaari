"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import Media from "./Media";
import type { Tone } from "@/lib/content";

interface Img { image?: string; alt?: string }
const LABELS = ["Full view", "Drape", "Border detail", "Fabric detail"];

/** Thumbnail column, large picture with a counter, and a full-screen view. */
export default function ProductGallery({ images, tone, name, badge }: { images: Img[]; tone: Tone; name: string; badge?: string }) {
  const [i, setI] = useState(0);
  const [big, setBig] = useState(false);
  const cur = images[Math.min(i, images.length - 1)] ?? {};
  const label = (n: number) => images[n]?.alt?.trim() || LABELS[n] || `View ${n + 1}`;
  const many = images.length > 1;

  useEffect(() => {
    if (!big) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setBig(false);
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [big]);

  return (
    <div className={`pv-gal ${many ? "has-thumbs" : ""}`}>
      {many && (
        <ul className="pv-thumbs" aria-label="Product pictures">
          {images.map((im, n) => (
            <li key={n}>
              <button type="button" className="pv-thumb" data-on={n === i} aria-label={`Show ${label(n)}`} aria-current={n === i} onClick={() => setI(n)}>
                <span className="pv-thumb-img"><Media tone={tone} className="h-full w-full" sizes="96px" image={im.image} alt={im.alt} /></span>
                <span className="pv-thumb-l">{label(n)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="pv-main">
        <div className="pv-frame">
          <Media key={i} tone={tone} className="aspect-[4/5] w-full pv-fade" priority sizes="(min-width: 1024px) 50vw, 100vw" image={cur.image} alt={cur.alt || name} />
          {badge && <span className="badge absolute left-4 top-4">{badge}</span>}
        </div>
        <div className="pv-count">
          <span>{String(i + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")} · {label(i)}</span>
          {cur.image && (
            <button type="button" className="pv-zoom" onClick={() => setBig(true)}><Icon name="zoom" className="!h-4 !w-4" /> View larger</button>
          )}
        </div>
      </div>
      {big && cur.image && (
        <div className="pv-lb" role="dialog" aria-modal="true" aria-label={`${name}, larger view`} onClick={() => setBig(false)}>
          <button type="button" className="pv-lb-x" aria-label="Close" onClick={() => setBig(false)}><Icon name="close" /></button>
          {many && <button type="button" className="pv-lb-n pv-lb-p" aria-label="Previous picture" onClick={(e) => { e.stopPropagation(); setI((i + images.length - 1) % images.length); }}><Icon name="chevron-left" /></button>}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cur.image} alt={cur.alt || name} onClick={(e) => e.stopPropagation()} />
          {many && <button type="button" className="pv-lb-n pv-lb-nx" aria-label="Next picture" onClick={(e) => { e.stopPropagation(); setI((i + 1) % images.length); }}><Icon name="chevron-right" /></button>}
        </div>
      )}
    </div>
  );
}
