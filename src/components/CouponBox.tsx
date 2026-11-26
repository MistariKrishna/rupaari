"use client";

import { useState } from "react";
import { describe, liveOffers, useCoupon } from "@/lib/coupons";
import { money } from "@/lib/products";
import { Icon } from "./Icon";

/** "Have a code?" with the live offers underneath. Used in the bag drawer, the bag page and checkout. */
export default function CouponBox({ subtotal, tab = 0 }: { subtotal: number; tab?: 0 | -1 }) {
  const { code, result, apply, remove, discount, freeShip } = useCoupon(subtotal);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("");
  const offers = open ? liveOffers() : [];

  const submit = (value: string) => {
    if (!value.trim()) return setMsg("Enter a coupon code.");
    const r = apply(value);
    setMsg(r.ok ? "" : r.message);
    if (r.ok) {
      setInput("");
      setOpen(false);
    }
  };

  if (code && result?.coupon) {
    return (
      <div className="cpn" data-state={result.ok ? "on" : "warn"}>
        <div className="cpn-ticket">
          <span className="cpn-ico" aria-hidden="true"><Icon name={result.ok ? "check" : "info"} /></span>
          <span className="cpn-txt">
            <b>{result.coupon.code}</b>
            <small>{result.ok ? (freeShip ? "Free delivery applied" : `You save ${money(discount)}`) : result.message}</small>
          </span>
          <button type="button" tabIndex={tab} className="cpn-x" onClick={remove} aria-label={`Remove coupon ${result.coupon.code}`}>Remove</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cpn" data-open={open}>
      <button type="button" tabIndex={tab} className="cpn-head" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="cpn-tag" aria-hidden="true"><Icon name="gift" /></span>
        <span>Coupon code or offers</span>
        <Icon name={open ? "minus" : "plus"} className="cpn-pm" />
      </button>
      <div className="cpn-body" hidden={!open}>
        <form
          className="cpn-form"
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <input aria-label="Coupon code" tabIndex={tab} value={input} onChange={(e) => { setInput(e.target.value.toUpperCase()); setMsg(""); }} placeholder="Enter code" autoComplete="off" spellCheck={false} />
          <button type="submit" tabIndex={tab}>Apply</button>
        </form>
        {msg && <p className="cpn-msg" role="status">{msg}</p>}
        {offers.length > 0 && (
          <ul className="cpn-offers">
            {offers.map((o) => (
              <li key={o.id}>
                <div>
                  <b>{o.code}</b>
                  <small>{describe(o)}</small>
                </div>
                <button type="button" tabIndex={tab} onClick={() => submit(o.code)}>Apply</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
