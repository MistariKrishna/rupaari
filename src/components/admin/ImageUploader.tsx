"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/admin/export";
import type { ProductImage } from "@/lib/admin/types";
import AIcon from "./AIcon";

/** Drop or choose images, reorder, pick the primary one. Alt text is optional. */
export default function ImageUploader({ images, onChange, onError, max = 8 }: { images: ProductImage[]; onChange: (v: ProductImage[]) => void; onError?: (m: string) => void; max?: number }) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [from, setFrom] = useState<number | null>(null);

  const add = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, max - images.length);
    if (!list.length) return;
    setBusy(true);
    try {
      const out: ProductImage[] = [];
      for (const f of list) out.push({ src: await compressImage(f), alt: "", primary: false });
      const all = [...images, ...out];
      if (!all.some((i) => i.primary)) all[0].primary = true;
      onChange(all);
    } catch {
      onError?.("That image could not be read.");
    }
    setBusy(false);
  };
  const move = (i: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [m] = next.splice(i, 1);
    next.splice(to, 0, m);
    onChange(next);
  };
  const remove = (i: number) => {
    const next = images.filter((_, k) => k !== i);
    if (next.length && !next.some((x) => x.primary)) next[0].primary = true;
    onChange(next);
  };

  return (
    <div>
      <div
        className={`adm-drop ${drag ? "is-on" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (e.dataTransfer.files.length) void add(e.dataTransfer.files);
        }}
      >
        <AIcon name="upload" />
        <p>{busy ? "Processing…" : "Drag images here, or"}</p>
        <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => input.current?.click()} disabled={busy || images.length >= max}>
          Choose files
        </button>
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && void add(e.target.files)} />
      </div>
      {images.length > 0 && (
        <ul className="adm-imgs">
          {images.map((im, i) => (
            <li
              key={i}
              className={`adm-img ${from === i ? "is-drag" : ""}`}
              draggable
              onDragStart={() => setFrom(i)}
              onDragEnd={() => setFrom(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (from != null) move(from, i);
                setFrom(null);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.src} alt={im.alt || "Product"} />
              <div className="adm-img-b">
                <input className="adm-in" placeholder="Alt text (optional)" value={im.alt} onChange={(e) => onChange(images.map((x, k) => (k === i ? { ...x, alt: e.target.value } : x)))} aria-label={`Alt text for image ${i + 1}`} />
                <div className="adm-img-a">
                  <label className="adm-check">
                    <input type="radio" name="primary-img" checked={im.primary} onChange={() => onChange(images.map((x, k) => ({ ...x, primary: k === i })))} />
                    <span>Primary</span>
                  </label>
                  <span className="adm-grow" />
                  <button type="button" className="adm-ibtn" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move earlier">
                    <AIcon name="arrow-up" />
                  </button>
                  <button type="button" className="adm-ibtn" onClick={() => move(i, i + 1)} disabled={i === images.length - 1} aria-label="Move later">
                    <AIcon name="arrow-down" />
                  </button>
                  <button type="button" className="adm-ibtn" onClick={() => remove(i)} aria-label="Remove image">
                    <AIcon name="trash" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
