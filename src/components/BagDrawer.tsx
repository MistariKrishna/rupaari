"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type CSSProperties } from "react";
import { productSlot } from "@/lib/images";
import { getProduct, money } from "@/lib/products";
import { useShopInfo } from "@/lib/catalog";
import { Icon } from "./Icon";
import CouponBox from "./CouponBox";
import { useCoupon } from "@/lib/coupons";
import Media from "./Media";
import { lineKey, useStore } from "./StoreProvider";

/** Slide-in shopping bag. Opens automatically when something is added. */
export default function BagDrawer() {
  const { bagOpen, closeBag, lines, subtotal, count, setQty, remove } = useStore();
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const shop = useShopInfo();
  const { discount, freeShip } = useCoupon(subtotal);
  const tab = bagOpen ? 0 : -1;
  const goal = shop.freeShipFrom;
  const left = Math.max(0, goal - (subtotal - discount));
  const pct = goal > 0 ? Math.min(100, Math.round(((subtotal - discount) / goal) * 100)) : 0;

  // Any navigation (including the animated page transition) closes the drawer.
  useEffect(() => {
    closeBag();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!bagOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBag();
    };
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => closeRef.current?.focus(), 250);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [bagOpen, closeBag]);

  return (
    <div className="drawer" data-open={bagOpen} aria-hidden={!bagOpen}>
      <div className="drawer-scrim" onClick={closeBag} />
      <aside className="drawer-panel bd" role="dialog" aria-modal="true" aria-label="Shopping bag">
        <header className="bd-head">
          <h2>
            Your bag <span className="bd-count">{count}</span>
          </h2>
          <button ref={closeRef} type="button" onClick={closeBag} aria-label="Close bag" tabIndex={tab} className="bd-close">
            <Icon name="close" />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="bd-empty">
            <span className="bd-bag" aria-hidden="true"><Icon name="bag" /></span>
            <p className="bd-etitle">Your next chapter awaits</p>
            <p className="bd-etext">Your bag is empty. Explore silk sarees chosen for moments worth remembering.</p>
            <Link href="/collections/sarees" onClick={closeBag} tabIndex={tab} className="btn bd-cta">
              Explore sarees
            </Link>
          </div>
        ) : (
          <>
            {goal > 0 && (
              <div className="bd-ship" data-done={left === 0 || freeShip}>
                <p>
                  {left === 0 || freeShip ? (
                    <>
                      <Icon name="truck" className="!h-4 !w-4" /> You&apos;ve unlocked free delivery
                    </>
                  ) : (
                    <>
                      Add <b>{money(left)}</b> more for free delivery
                    </>
                  )}
                </p>
                <span className="bd-bar" aria-hidden="true">
                  <i style={{ width: `${left === 0 || freeShip ? 100 : pct}%` }} />
                </span>
              </div>
            )}

            <ul className="bd-list" data-native-scroll>
              {lines.map((l, i) => {
                const p = getProduct(l.id);
                if (!p) return null;
                return (
                  <li key={lineKey(l)} className="bd-item" style={{ "--i": i } as CSSProperties}>
                    <Link href={`/product/${p.id}`} onClick={closeBag} tabIndex={tab} aria-label={p.name} className="bd-img">
                      <Media tone={p.tone} className="h-full w-full" {...productSlot(p, l.colour)} sizes="96px" />
                    </Link>
                    <div className="bd-info">
                      <Link href={`/product/${p.id}`} onClick={closeBag} tabIndex={tab} className="bd-name">
                        {p.name}
                      </Link>
                      <div className="bd-meta">
                        {l.colour && <span>{l.colour}</span>}
                        {l.size && <span>Size {l.size}</span>}
                      </div>
                      <div className="bd-row">
                        <div className="bd-qty">
                          <button type="button" aria-label={`Decrease quantity of ${p.name}`} tabIndex={tab} onClick={() => setQty(l.id, l.qty - 1, l.size, l.colour)}>
                            <Icon name="minus" className="!h-4 !w-4" />
                          </button>
                          <span aria-live="polite">{l.qty}</span>
                          <button type="button" aria-label={`Increase quantity of ${p.name}`} tabIndex={tab} onClick={() => setQty(l.id, l.qty + 1, l.size, l.colour)}>
                            <Icon name="plus" className="!h-4 !w-4" />
                          </button>
                        </div>
                        <p className="bd-price">{money(p.price * l.qty)}</p>
                      </div>
                      <button type="button" tabIndex={tab} className="bd-remove" onClick={() => remove(l.id, l.size, l.colour)}>
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="bd-foot">
              <CouponBox subtotal={subtotal} tab={tab} />
              <dl className="bd-sum">
                <div>
                  <dt>Subtotal</dt>
                  <dd>{money(subtotal)}</dd>
                </div>
                {discount > 0 && (
                  <div className="bd-save">
                    <dt>Offer discount</dt>
                    <dd>− {money(discount)}</dd>
                  </div>
                )}
                <div>
                  <dt>Delivery</dt>
                  <dd>{freeShip ? "Free" : "Calculated at checkout"}</dd>
                </div>
                <div className="bd-total">
                  <dt>Estimated total</dt>
                  <dd>{money(subtotal - discount)}</dd>
                </div>
              </dl>
              <p className="bd-note">Inclusive of applicable taxes. Final delivery charges shown before payment.</p>
              <Link href="/checkout" onClick={closeBag} tabIndex={tab} className="btn bd-cta">
                Proceed to checkout
              </Link>
              <div className="bd-links">
                <button type="button" onClick={closeBag} tabIndex={tab}>
                  Continue shopping <Icon name="arrow-right" className="!h-3.5 !w-3.5" />
                </button>
                <Link href="/bag" onClick={closeBag} tabIndex={tab}>View bag</Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}