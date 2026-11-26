"use client";

import Link from "next/link";
import { RETURN_STEPS, fmtDate, fmtTime, itemKey, itemMeta, refundAmount, returnState, type OrderItem, type ReturnStatus } from "@/lib/orders";
import { money } from "@/lib/products";
import Crumbs from "./Crumbs";
import { Icon } from "./Icon";
import { Thumb } from "./OrderParts";
import { useOrders } from "./useOrders";

const LABEL: Record<ReturnStatus, string> = { requested: "Requested", approved: "Approved", "picked-up": "Picked up", received: "Received", refunded: "Refunded" };
const XLABEL: Record<ReturnStatus, string> = { ...LABEL, refunded: "Exchange sent" };
const NOTE: Record<ReturnStatus, string> = {
  requested: "Your request is awaiting review.",
  approved: "Pickup is scheduled. Keep the item packed with its tags.",
  "picked-up": "Our courier has collected it. We will update this when it reaches RUPAARI.",
  received: "We have your item. Your refund is being prepared.",
  refunded: "Your refund has been processed to the original payment method.",
};

function When({ it }: { it: OrderItem }) {
  const r = it.return!;
  const t = r.status === "refunded" ? r.refundedAt : r.status === "received" ? r.receivedAt : r.status === "picked-up" ? r.pickedUpAt : r.status === "approved" ? r.pickupDate : r.requestedAt;
  return <>{t ? (r.status === "approved" ? fmtDate(t) : fmtTime(t)) : ""}</>;
}

export default function ReturnsList() {
  const { orders, ready } = useOrders();
  const rows = orders.flatMap((o) => o.items.filter((i) => i.return).map((it) => ({ o, it })));
  const open = orders.flatMap((o) => o.items.filter((i) => returnState(o, i) === "eligible").map((it) => ({ o, it })));
  const refunded = rows.reduce((n, { it }) => n + refundAmount(it), 0);
  const pending = rows.filter(({ it }) => it.return!.status !== "refunded").reduce((n, { it }) => n + it.price * it.qty, 0);

  return (
    <div className="rp-page">
      <div className="rp-wrap">
        <Crumbs items={[{ label: "Home", href: "/" }, { label: "Account", href: "/account" }, { label: "Returns and refunds" }]} />
        <h1 className="rp-title">Returns and refunds</h1>

        {ready && rows.length > 0 && (
          <dl className="rt-sum">
            <div><dt>Return requests</dt><dd>{rows.length}</dd></div>
            <div><dt>Refunded so far</dt><dd>{money(refunded)}</dd></div>
            <div><dt>Refund pending</dt><dd>{money(pending)}</dd></div>
          </dl>
        )}

        {ready && rows.length === 0 ? (
          <div className="rp-empty">
            <Icon name="return" />
            <h2>No returns yet</h2>
            <p>When you request a return, its status and refund will appear here.</p>
            <Link href="/account/orders" className="btn">My orders</Link>
          </div>
        ) : (
          <div className="ol-list">
            {rows.map(({ o, it }) => {
              const r = it.return!;
              const at = RETURN_STEPS.indexOf(r.status);
              return (
                <article key={`${o.id}${itemKey(it)}`} className="rp-card ol-card">
                  <header className="ol-head">
                    <div><h2 className="ol-id">Order #{o.id}</h2><p>{r.kind === "exchange" ? "Exchange" : "Return"} requested {fmtDate(r.requestedAt)}</p></div>
                    <span className="rp-badge rp-badge--dot"><i aria-hidden="true" />{(r.kind === "exchange" ? XLABEL : LABEL)[r.status]}</span>
                  </header>
                  <div className="ol-body">
                    <ul className="ol-items"><li><Thumb it={it} size={96} /><div><h3>{it.name}</h3><p>{itemMeta(it)}</p><p>Reason: {r.reason}</p></div></li></ul>
                    <div className="ol-side">
                      <p className="ol-due">{r.kind === "exchange" ? (r.status === "refunded" ? "Exchanged" : "Exchange value") : r.status === "refunded" ? "Refunded" : "Refund due"}</p>
                      <p className="ol-amt">{money(it.price * it.qty)}</p>
                      <Link href={`/account/orders/${o.id}`} className="btn">View order <Icon name="arrow-right" /></Link>
                    </div>
                  </div>
                  <ol className="rt-steps">
                    {RETURN_STEPS.map((s, i) => (
                      <li key={s} data-done={i <= at} data-current={i === at}><span className="rt-dot" />{(r.kind === "exchange" ? XLABEL : LABEL)[s]}</li>
                    ))}
                  </ol>
                  <p className="rt-note">{NOTE[r.status]} <small><When it={it} /></small></p>
                </article>
              );
            })}
          </div>
        )}

        {ready && open.length > 0 && (
          <section className="rt-open">
            <h2 className="rp-h3">Delivered items you can still return</h2>
            <ul>
              {open.map(({ o, it }) => (
                <li key={`${o.id}${itemKey(it)}`}>
                  <span>{it.name} <small>#{o.id}</small></span>
                  <Link className="rp-link" href={`/account/orders/${o.id}/return?item=${it.id}${it.size ? `&size=${encodeURIComponent(it.size)}` : ""}`}>Request a return</Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
