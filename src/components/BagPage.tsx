"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { productSlot } from "@/lib/images";
import { colourway, getGift, setGift } from "@/lib/orders";
import { getProduct, money } from "@/lib/products";
import Crumbs from "./Crumbs";
import { Icon } from "./Icon";
import CouponBox from "./CouponBox";
import { useCoupon } from "@/lib/coupons";
import Media from "./Media";
import { lineKey, useStore } from "./StoreProvider";

export default function BagPage() {
  const { lines, count, subtotal, setQty, remove, ready } = useStore();
  const [gift, setGiftState] = useState({ on: false, message: "" });
  const { discount, freeShip } = useCoupon(subtotal);

  useEffect(() => setGiftState(getGift()), []);
  const updateGift = (g: { on: boolean; message: string }) => {
    setGiftState(g);
    setGift(g);
  };

  return (
    <div className="rp-page">
      <div className="rp-wrap">
        <Crumbs items={[{ label: "Home", href: "/" }, { label: "Bag" }]} />
        <div className="bg-head">
          <h1 className="rp-title">Your Bag</h1>
          <Link href="/collections/sarees" className="rp-link-plain">
            Continue shopping <Icon name="arrow-right" />
          </Link>
        </div>

        {ready && lines.length === 0 ? (
          <div className="rp-empty">
            <Icon name="bag" />
            <h2>Your bag is empty</h2>
            <p>Find a saree you love and it will wait for you here.</p>
            <Link href="/collections/sarees" className="btn">Explore Sarees</Link>
          </div>
        ) : (
          <div className="bg-grid">
            <section aria-label="Items in your bag">
              <div className="bg-cols" aria-hidden="true">
                <span>Saree</span>
                <span>Quantity</span>
                <span>Amount</span>
              </div>
              <ul className="bg-list">
                {lines.map((l) => {
                  const p = getProduct(l.id);
                  if (!p) return null;
                  return (
                    <li key={lineKey(l)} className="bg-row">
                      <Link href={`/product/${p.id}`} className="bg-img zoom" aria-label={p.name}>
                        <Media tone={p.tone} className="h-full w-full" sizes="154px" {...productSlot(p, l.colour)} />
                      </Link>
                      <div className="bg-info">
                        <h2><Link href={`/product/${p.id}`}>{p.name}</Link></h2>
                        <p className="rp-colour">{l.colour || p.details?.colour || colourway(p.tone)}</p>
                        {l.size && <p className="rp-size">Size {l.size}</p>}
                        <button type="button" className="rp-link" onClick={() => remove(p.id, l.size, l.colour)} aria-label={`Remove ${p.name} from bag`}>Remove</button>
                      </div>
                      <div className="bg-qty" role="group" aria-label={`Quantity of ${p.name}`}>
                        <button type="button" aria-label="Decrease quantity" onClick={() => setQty(p.id, l.qty - 1, l.size, l.colour)}><Icon name="minus" /></button>
                        <span aria-live="polite">{l.qty}</span>
                        <button type="button" aria-label="Increase quantity" disabled={l.qty >= 10} onClick={() => setQty(p.id, l.qty + 1, l.size, l.colour)}><Icon name="plus" /></button>
                      </div>
                      <p className="bg-amt">{money(p.price * l.qty)}</p>
                    </li>
                  );
                })}
              </ul>
              <label className="rp-check bg-gift">
                <input type="checkbox" checked={gift.on} onChange={(e) => updateGift({ ...gift, on: e.target.checked })} />
                <span className="rp-box" aria-hidden="true"><Icon name="check" /></span>
                Add gift wrap and a message
              </label>
              {gift.on && (
                <div className="rp-field bg-msg">
                  <label htmlFor="gift-msg">Gift message (optional)</label>
                  <textarea id="gift-msg" rows={3} maxLength={240} value={gift.message} onChange={(e) => updateGift({ ...gift, message: e.target.value })} />
                </div>
              )}
            </section>

            <aside className="rp-card bg-sum" aria-label="Order summary">
              <h2 className="rp-h2">Order Summary</h2>
              <dl className="rp-rows">
                <div><dt>Subtotal ({count} {count === 1 ? "item" : "items"})</dt><dd>{money(subtotal)}</dd></div>
                {discount > 0 && <div className="bd-save"><dt>Offer discount</dt><dd>− {money(discount)}</dd></div>}
                <div><dt>Shipping</dt><dd>{freeShip ? "Free" : "At checkout"}</dd></div>
                {discount > 0 && <div className="rp-bold"><dt>Estimated total</dt><dd>{money(subtotal - discount)}</dd></div>}
              </dl>
              <CouponBox subtotal={subtotal} />
              <Link href="/checkout" className="btn w-full" aria-disabled={lines.length === 0}>Proceed to checkout</Link>
              <Link href="/contact" className="rp-link bg-ship">Shipping &amp; returns</Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}