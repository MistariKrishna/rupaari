"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { PAY_LABEL, STAGES, fmtDate, fmtShort, itemKey, itemMeta, type Order } from "@/lib/orders";
import { money } from "@/lib/products";
import Crumbs from "./Crumbs";
import { Icon } from "./Icon";
import { Thumb } from "./OrderParts";
import { useOrders } from "./useOrders";

const idKey = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^RP/, "");
const contactKey = (s: string) => (s.includes("@") ? s.trim().toLowerCase() : s.replace(/\D/g, "").slice(-10));

const NOTE = [
  "We have your order and are getting it ready.",
  "Your order is packed and will be handed to the courier soon.",
  "Your order is with the courier and on its way.",
  "Your order is out for delivery today.",
  "Your order has been delivered.",
];

export default function TrackOrder() {
  const { orders, ready } = useOrders();
  const sp = useSearchParams();
  const [num, setNum] = useState(sp.get("order") ?? "");
  const [contact, setContact] = useState("");
  const [product, setProduct] = useState("");
  const [err, setErr] = useState("");
  const [found, setFound] = useState<Order | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFound(null);
    if (!num.trim() || !contact.trim()) return setErr("Enter your order number and the email or mobile number you used.");
    const o = orders.find((x) => idKey(x.id) === idKey(num));
    const c = contactKey(contact);
    const contactOk = o && [o.contact, o.address.phone ?? ""].some((v) => v && contactKey(v) === c);
    const prodOk = !product.trim() || o?.items.some((it) => it.name.toLowerCase().includes(product.trim().toLowerCase()));
    if (!o || !contactOk) return setErr("We couldn't find an order in your account with those details. Check the order number and the email or mobile number.");
    if (!prodOk) return setErr("That product isn't in this order. Leave the product box empty, or use a name from the order.");
    setErr("");
    setFound(o);
  };

  return (
    <div className="rp-page">
      <div className="rp-wrap">
        <Crumbs items={[{ label: "Home", href: "/" }, { label: "Account", href: "/account" }, { label: "Track an order" }]} />
        <h1 className="rp-title">Track an order</h1>
        <p className="od-lead">Enter the details of your purchase to see where it is.</p>

        <form className="tk-form rp-card" onSubmit={submit} noValidate>
          <div className="rp-field"><label htmlFor="tk-n">Order number</label><input id="tk-n" placeholder="e.g. RP-10483" value={num} onChange={(e) => setNum(e.target.value)} /></div>
          <div className="rp-field"><label htmlFor="tk-c">Email or mobile number used for the order</label><input id="tk-c" autoComplete="email" value={contact} onChange={(e) => setContact(e.target.value)} /></div>
          <div className="rp-field"><label htmlFor="tk-p">Product you bought (optional)</label><input id="tk-p" placeholder="e.g. Banarasi Silk Saree" value={product} onChange={(e) => setProduct(e.target.value)} /></div>
          {err && <p className="tk-err" role="alert">{err}</p>}
          <button type="submit" className="btn">Track order <Icon name="arrow-right" /></button>
        </form>

        {ready && orders.length > 0 && !found && (
          <div className="tk-recent">
            <h2 className="rp-h3">Your recent orders</h2>
            <ul>
              {orders.slice(0, 4).map((o) => (
                <li key={o.id}><button type="button" className="rp-link" onClick={() => setNum(o.id)}>#{o.id}</button><span>{fmtShort(o.placedAt)} · {STAGES[o.stage]}</span></li>
              ))}
            </ul>
          </div>
        )}

        {found && (
          <section className="tk-result" aria-live="polite">
            <header className="od-top">
              <h2 className="rp-h2">Order #{found.id}</h2>
              <p className="od-meta">Placed {fmtDate(found.placedAt)} <span aria-hidden="true">|</span> {PAY_LABEL[found.payment]} <span aria-hidden="true">|</span> {money(found.total)}</p>
            </header>
            <div className="od-status">
              <h3 className="rp-h3">Status: {STAGES[found.stage]}</h3>
              <ol className="od-steps">
                {STAGES.map((s, i) => (
                  <li key={s} data-done={i <= found.stage} data-current={i === found.stage} aria-current={i === found.stage ? "step" : undefined}>
                    <span className="od-dot">{i <= found.stage && <Icon name="check" />}</span>
                    <span className="od-step-l">{s}</span>
                  </li>
                ))}
              </ol>
              <p className="od-note">{NOTE[found.stage]}{found.stage === 4 && found.deliveredAt ? ` on ${fmtDate(found.deliveredAt)}.` : ""}</p>
            </div>
            <ul className="od-items">
              {found.items.map((it) => (
                <li key={itemKey(it)} className="od-item">
                  <Thumb it={it} size={96} />
                  <div className="od-item-b"><h3>{it.name}</h3><p>{itemMeta(it)}</p></div>
                  <p className="od-price">{money(it.price * it.qty)}</p>
                </li>
              ))}
            </ul>
            <p className="tk-addr">Delivering to {found.address.name}, {found.address.line1}, {found.address.city} {found.address.pin}, {found.address.country}</p>
            <Link href={`/account/orders/${found.id}`} className="btn">View full order details <Icon name="arrow-right" /></Link>
          </section>
        )}
      </div>
    </div>
  );
}
