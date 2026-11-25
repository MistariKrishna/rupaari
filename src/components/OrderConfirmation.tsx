"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { colourway, fmtDate, itemKey } from "@/lib/orders";
import { confirmationText } from "@/lib/orderMessage";
import { money } from "@/lib/products";
import Crumbs from "./Crumbs";
import { Icon } from "./Icon";
import { AddressBlock, PaymentSummary, Thumb } from "./OrderParts";
import { useOrders } from "./useOrders";

export default function OrderConfirmation() {
  const id = useSearchParams().get("order");
  const { orders, ready } = useOrders();
  const o = orders.find((x) => x.id === id);
  const [toast, setToast] = useState(true);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setToast(false), 6000);
    return () => clearTimeout(t);
  }, []);

  if (ready && !o) {
    return (
      <div className="rp-page"><div className="rp-wrap">
        <Crumbs items={[{ label: "Home", href: "/" }, { label: "Order confirmation" }]} />
        <div className="rp-empty"><h2>We couldn’t find that order</h2><p>Orders are saved on the device they were placed from.</p><Link href="/account/orders" className="btn">My orders</Link></div>
      </div></div>
    );
  }
  if (!o) return <div className="rp-page" />;

  const msg = confirmationText(o);
  const copy = () => {
    try { navigator.clipboard.writeText(msg).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); } catch { /* ignore */ }
  };

  return (
    <div className="rp-page">
      {toast && (
        <div className="oc-toast" role="status" aria-live="polite">
          <span className="oc-toast-t"><Icon name="check" /></span>
          <span><strong>Order confirmed.</strong> Thank you, your order #{o.id} has been placed.</span>
          <button type="button" className="oc-toast-x" aria-label="Close" onClick={() => setToast(false)}>×</button>
        </div>
      )}
      <div className="rp-wrap">
        <Crumbs items={[{ label: "Home", href: "/" }, { label: "Order confirmation" }]} />
        <header className="od-top">
          <h1 className="rp-title oc-ttl"><span className="oc-tick"><Icon name="check" /></span>Order Confirmed</h1>
          <p className="od-lead">Thank you, {o.address.name.split(" ")[0]}.</p>
          <p className="od-meta">Order #{o.id} <span aria-hidden="true">|</span> {fmtDate(o.placedAt)}</p>
        </header>
        <div className="od-grid">
          <div>
            <section aria-labelledby="oc-items">
              <h2 className="rp-h2" id="oc-items">Items in your order</h2>
              <ul className="od-items">
                {o.items.map((it) => (
                  <li key={itemKey(it)} className="od-item">
                    <Thumb it={it} size={117} />
                    <div className="od-item-b">
                      <h3>{it.name}</h3>
                      <p className="rp-colour">{it.colour || colourway(it.tone)}</p>
                      {it.size && <p>Size {it.size}</p>}
                      <p>Qty {it.qty}</p>
                    </div>
                    <p className="od-price">{money(it.price * it.qty)}</p>
                  </li>
                ))}
              </ul>
            </section>
            <section aria-labelledby="oc-msg" className="od-addr-sec">
              <h2 className="rp-h2" id="oc-msg">Confirmation message</h2>
              <div className="oc-msg">
                <pre>{msg}</pre>
                <button type="button" className="rp-link" onClick={copy}>{copied ? "Copied" : "Copy message"}</button>
              </div>
            </section>
            <section aria-labelledby="oc-addr" className="od-addr-sec">
              <h2 className="rp-h2" id="oc-addr">Delivery address</h2>
              <AddressBlock o={o} />
              {o.gift && <p className="od-gift">Gift wrap requested: {o.gift}</p>}
            </section>
          </div>
          <PaymentSummary o={o} confirm>
            <Link href={`/account/track?order=${o.id}`} className="btn w-full">Track order</Link>
            <Link href="/collections" className="rp-link od-cont">Continue shopping</Link>
          </PaymentSummary>
        </div>
      </div>
    </div>
  );
}