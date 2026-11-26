"use client";

import SocialLinks from "./SocialLinks";
import Link from "next/link";
import type { CSSProperties } from "react";
import { productSlot } from "@/lib/images";
import { categoryLabel, money, picks, products, weaveLabel } from "@/lib/products";
import { Icon } from "./Icon";
import Media from "./Media";

// Edit this list to change the menu. Hrefs point at pages that exist today.
const items = [
  { label: "Sarees", href: "/collections/sarees" },
  { label: "Kurtis", href: "/collections/kurtis" },
  { label: "Occasions", href: "/collections/sarees?occasion=wedding" },
  { label: "Our Story", href: "/about" },
  { label: "Our Craft", href: "/craft" },
  { label: "Sustainability", href: "/sustainability" },
  { label: "Consultation", href: "/consultation" },
  { label: "Contact", href: "/contact" },
];


/**
 * Full-screen menu. A deep burgundy curtain drapes down behind a gold-trimmed curved edge, links rise
 * out of masks one by one, and a featured piece opens in a tinted, gold-outlined arch on the right.
 */
export default function MenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const feat = picks()[0] ?? products[0];
  const k = (n: number) => ({ "--k": n }) as CSSProperties;

  return (
    <div id="mobile-menu" className="mo" data-open={open} data-native-scroll aria-hidden={!open} inert={!open}>
      <div className="mo-trim" aria-hidden="true" />
      <div className="mo-bg" aria-hidden="true" />
      <div className="mo-inner container-x">
        <nav aria-label="Menu" className="mo-nav">
          <ol>
            {items.map((it, i) => (
              <li key={it.label}>
                <Link href={it.href} onClick={onClose} className="mo-link" style={{ "--i": i } as CSSProperties}>
                  <span className="mo-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mo-mask">
                    <span className="mo-word">{it.label}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <aside className="mo-side">
          {feat && (
            <Link href={`/product/${feat.id}`} onClick={onClose} className="mo-feat" style={k(0)}>
              <div className="mo-arch">
                <Media tone={feat.tone} className="mo-img h-full w-full" sizes="26rem" {...productSlot(feat)} />
                <span className="mo-chip">Featured</span>
              </div>
              <div className="mo-meta">
                <p className="mo-kicker">{weaveLabel(feat.weave) ?? categoryLabel(feat.category)}</p>
                <p className="mo-pname">{feat.name}</p>
                <p className="mo-price">{money(feat.price)}</p>
                <span className="mo-go">
                  Shop now <Icon name="arrow-right" className="!h-4 !w-4" />
                </span>
              </div>
            </Link>
          )}
          <div className="mo-foot" style={k(1)}>
            <SocialLinks />
          </div>
        </aside>
      </div>
    </div>
  );
}