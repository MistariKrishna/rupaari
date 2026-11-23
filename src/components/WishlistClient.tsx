"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { productSlot } from "@/lib/images";
import { getProduct, hasSizes, money, weaveShort, categoryLabel, type Product } from "@/lib/products";
import { Icon } from "./Icon";
import Media from "./Media";
import { useStore } from "./StoreProvider";

type Status = { kind: "added" } | { kind: "removed"; id: string } | null;

/** Wishlist page: heading, status bar (Added to bag / Removed + Undo), saved products, empty state. */
export default function WishlistClient() {
  const { wish, toggleWish, add, openBag } = useStore();
  const [status, setStatus] = useState<Status>(null);
  const timer = useRef<number | undefined>(undefined);
  const items = wish.map((id) => getProduct(id)).filter((p): p is Product => Boolean(p));

  useEffect(() => () => window.clearTimeout(timer.current), []);
  const flash = (s: Status) => {
    setStatus(s);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus(null), 8000);
  };

  return (
    <div className="wl">
      <header className="wl-head">
        <p className="wl-crumb">
          <Link href="/">Home</Link> / <span>Wishlist</span>
        </p>
        <div className="wl-title-row">
          <div>
            <h1 className="wl-title">Your Wishlist</h1>
            <p className="wl-sub">Your favourite sarees, saved for later.</p>
          </div>
          <Link href="/collections/sarees" className="wl-continue">
            Continue shopping <Icon name="arrow-right" /> All Sarees
          </Link>
        </div>
        <p className="wl-guest">
          <Link href="/account">Sign in</Link> to keep your favourites across devices.
        </p>
      </header>

      <div className="wl-status-wrap" role="status" aria-live="polite">
        {status && (
          <div className="wl-status" key={status.kind}>
            <Icon name="check" />
            <p>{status.kind === "added" ? "Added to bag" : "Removed from wishlist"}</p>
            {status.kind === "added" ? (
              <button type="button" onClick={openBag}>View Bag</button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  toggleWish(status.id);
                  setStatus(null);
                }}
              >
                Undo
              </button>
            )}
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="wl-empty">
          <Icon name="heart" />
          <h2>Your wishlist is empty</h2>
          <p>Tap the heart on any saree to save it here.</p>
          <Link href="/collections/sarees" className="btn">Explore Sarees</Link>
        </div>
      ) : (
        <div className="wl-grid">
          {items.map((p) => {
            const sold = p.inStock === false;
            return (
              <article key={p.id} className="wl-card">
                <div className="wl-media">
                  <Link href={`/product/${p.id}`} aria-label={p.name} className="block h-full">
                    <div className="zoom h-full overflow-hidden">
                      <Media tone={p.tone} className="h-full w-full" sizes="(min-width: 1024px) 33vw, 50vw" {...productSlot(p)} />
                    </div>
                  </Link>
                  {sold && <span className="wl-sold">SOLD OUT</span>}
                  <button
                    type="button"
                    className="wl-remove"
                    aria-label={`Remove ${p.name} from wishlist`}
                    onClick={() => {
                      toggleWish(p.id);
                      flash({ kind: "removed", id: p.id });
                    }}
                  >
                    <Icon name="heart" className="fill-current" />
                  </button>
                </div>
                <div className="wl-info">
                  <p className="wl-weave">{weaveShort(p.weave) ?? categoryLabel(p.category)}</p>
                  <h3>
                    <Link href={`/product/${p.id}`}>{p.name}</Link>
                  </h3>
                  <p className="wl-desc">{p.blurb}</p>
                  <p className="wl-price">{money(p.price)}</p>
                  {sold && <p className="wl-avail">Sold out</p>}
                </div>
                <div className="wl-actions">
                  {sold ? (
                    <>
                      <button type="button" className="btn w-full" disabled>Sold Out</button>
                      <Link href={`/collections/sarees?weave=${p.weave ?? "all"}`} className="wl-similar">View similar sarees</Link>
                    </>
                  ) : hasSizes(p) ? (
                    <Link href={`/product/${p.id}`} className="btn w-full">Select Options</Link>
                  ) : (
                    <button
                      type="button"
                      className="btn w-full"
                      onClick={() => {
                        add(p.id, 1, false);
                        flash({ kind: "added" });
                      }}
                    >
                      Add to Bag
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}