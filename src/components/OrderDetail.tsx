"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { printHtml } from "@/lib/admin/export";
import { invoiceHtml } from "@/lib/admin/print";
import { DEMO, indiaOnly } from "@/lib/checkout";
import { PAY_LABEL, RETURN_STEPS, STAGES, fmtDate, itemKey, sameItem, fmtShort, fmtTime, refundAmount, returnState, type Order, type OrderItem, type ReturnStatus } from "@/lib/orders";
import { money } from "@/lib/products";
import Crumbs from "./Crumbs";
import { Icon } from "./Icon";
import { AddressBlock, HelpLink, PaymentSummary, Thumb, placed } from "./OrderParts";
import { useOrders } from "./useOrders";

const BADGE: Record<ReturnStatus, string> = {
  requested: "Return requested",
  approved: "Return approved",
  "picked-up": "Picked up",
  received: "Return received",
  refunded: "Refund processed",
};

function ReturnBlock({ it }: { it: OrderItem }) {
  const r = it.return;
  if (!r) return null;
  return (
    <div className="od-ret">
      <span className="rp-badge">{BADGE[r.status]}</span>
      {r.status === "requested" && (<><span className="od-ret-note">Your request is awaiting review.</span><p className="od-sub">Reason: {r.reason}</p></>)}
      {r.status === "approved" && (
        <>
          <p>Pickup scheduled</p>
          <p>{r.pickupDate ? fmtDate(r.pickupDate) : ""} · 10 am–2 pm IST</p>
          <a href="#pickup-address" className="rp-link od-small">View pickup address <Icon name="arrow-right" className="rotate-90" /></a>
        </>
      )}
      {r.status === "picked-up" && (<><p>{r.pickedUpAt ? fmtTime(r.pickedUpAt) : ""}</p><p>We’ll update this page when your return reaches RUPAARI.</p></>)}
      {r.status === "received" && (<><p>{r.receivedAt ? fmtDate(r.receivedAt) : ""}</p><p>Refund updates will appear here.</p></>)}
      {r.status === "refunded" && (<><p>Refund amount {money(it.price * it.qty)}</p><p>Processed on {r.refundedAt ? fmtDate(r.refundedAt) : ""}</p></>)}
    </div>
  );
}

export default function OrderDetail({ id }: { id: string }) {
  const { orders, ready, update } = useOrders();
  const sp = useSearchParams();
  const demo = DEMO && sp.get("demo") === "1";
  const o = orders.find((x) => x.id === id);

  if (ready && !o) {
    return (
      <div className="rp-page"><div className="rp-wrap">
        <Crumbs items={[{ label: "Home", href: "/" }, { label: "Account", href: "/account" }, { label: "My orders", href: "/account/orders" }]} />
        <div className="rp-empty"><h2>We couldn’t find that order</h2><p>Orders are saved on the device they were placed from.</p><Link href="/account/orders" className="btn">My orders</Link></div>
      </div></div>
    );
  }
  if (!o) return <div className="rp-page" />;

  const refunded = o.items.some((i) => i.return?.status === "refunded");
  const pickup = o.items.some((i) => i.return && ["approved", "picked-up", "received"].includes(i.return.status));
  const refundTotal = o.items.reduce((n, i) => n + refundAmount(i), 0);

  const eta = (() => {
    const [a, b] = indiaOnly(o.address.country) ? [4, 7] : [9, 14];
    const f = (n: number) => fmtShort(new Date(new Date(o.placedAt).getTime() + n * 86_400_000).toISOString());
    return `${f(a)} to ${f(b)}`;
  })();
  const payNote = o.payment === "cod" ? (o.stage === 4 ? "Paid on delivery" : "Pay on delivery") : "Paid";

  return (
    <div className="rp-page">
      <div className="rp-wrap">
        <Crumbs items={[{ label: "Home", href: "/" }, { label: "Account", href: "/account" }, { label: "My orders", href: "/account/orders" }, { label: `#${o.id}` }]} />
        <header className="od-top">
          <h1 className="rp-title">Order #{o.id}</h1>
          <p className="od-lead">{placed(o)}</p>
          <div className="od-actions">
            <button type="button" className="btn btn-secondary" onClick={() => printHtml(`Invoice ${o.id}`, invoiceHtml(o))}>Download invoice</button>
            <Link href={`/account/track?order=${o.id}`} className="btn btn-secondary">Track order</Link>
          </div>
        </header>

        <dl className="od-strip">
          <div><dt>Order status</dt><dd>{STAGES[o.stage]}</dd></div>
          <div><dt>{o.stage === 4 ? "Delivered on" : "Expected delivery"}</dt><dd>{o.stage === 4 ? fmtDate(o.deliveredAt ?? o.placedAt) : eta}</dd></div>
          <div><dt>Payment</dt><dd>{PAY_LABEL[o.payment]} · {payNote}</dd></div>
          <div><dt>Order total</dt><dd>{money(o.total)}</dd></div>
        </dl>

        <section className="od-status" aria-labelledby="od-st">
          <h2 className="rp-h3" id="od-st">Order status</h2>
          <ol className="od-steps">
            {STAGES.map((s, i) => (
              <li key={s} data-done={i <= o.stage} data-current={i === o.stage} aria-current={i === o.stage ? "step" : undefined}>
                <span className="od-dot">{i <= o.stage && <Icon name="check" />}</span>
                <span className="od-step-l">{s}</span>
                {o.stage < 4 && i === o.stage && <small>Current · {fmtShort(o.placedAt)}</small>}
              </li>
            ))}
          </ol>
          {o.stage === 0 && <p className="od-note">Courier tracking details will appear after dispatch.</p>}
        </section>

        <div className="od-grid">
          <div>
            <section aria-labelledby="od-items">
              <h2 className="rp-h2" id="od-items">Items in your order</h2>
              <ul className="od-items">
                {o.items.map((it) => {
                  const st = returnState(o, it);
                  return (
                    <li key={itemKey(it)} className="od-item">
                      <Thumb it={it} size={117} />
                      <div className="od-item-b">
                        <h3><Link href={`/product/${it.id}`}>{it.name}</Link></h3>
                        {it.return && <ReturnBlock it={it} />}
                        {st === "non-returnable" && (
                          <div className="od-ret"><span className="rp-badge rp-badge--muted">Return unavailable</span><p>This item is marked as non-returnable.</p><Link href="/shipping-returns" className="rp-link od-small">View return policy <Icon name="arrow-right" /></Link></div>
                        )}
                        {st === "closed" && (
                          <div className="od-ret"><span className="rp-badge rp-badge--muted">Return unavailable</span><p>The return window for this item has closed.</p><Link href="/shipping-returns" className="rp-link od-small">View return policy <Icon name="arrow-right" /></Link></div>
                        )}
                        <p className="rp-colour">{it.colour}</p>
                        {it.size && <p>Size {it.size}</p>}
                        <p>Qty {it.qty}</p>
                        {o.stage === 4 && !it.return && <p className="od-sub">Delivered</p>}
                        {st === "eligible" && <Link href={`/account/orders/${o.id}/return?item=${it.id}${it.size ? `&size=${encodeURIComponent(it.size)}` : ""}`} className="rp-link od-small">Request a return</Link>}
                      </div>
                      <p className="od-price">{money(it.price * it.qty)}</p>
                    </li>
                  );
                })}
              </ul>
            </section>
            {o.gift && (
              <section className="od-addr-sec" aria-labelledby="od-gift">
                <h2 className="rp-h2" id="od-gift">Gift note</h2>
                <p className="od-gift">{o.gift}</p>
              </section>
            )}
            <section aria-labelledby="od-addr" className="od-addr-sec" id="pickup-address">
              <h2 className="rp-h2" id="od-addr">{pickup ? "Delivery & pickup address" : "Delivery address"}</h2>
              <AddressBlock o={o} />
            </section>
          </div>
          <PaymentSummary o={o} refunded={refunded}>
            {refunded && <dl className="rp-rows rp-rows--lg"><div className="rp-bold"><dt>Refunded</dt><dd>{money(refundTotal)}</dd></div></dl>}
            <HelpLink />
          </PaymentSummary>
        </div>

        {demo && (
          <section className="od-demo" aria-label="Demo controls">
            <h2>Demo controls (not part of the design)</h2>
            <p>Set the order status, or step an item’s return through each state.</p>
            <div>
              {STAGES.map((s, i) => (
                <button key={s} type="button" onClick={() => update(o.id, (x) => ({ ...x, stage: i, deliveredAt: i === 4 ? new Date().toISOString() : undefined }))}>{s}</button>
              ))}
            </div>
            {o.items.map((it) => (
              <div key={itemKey(it)}>
                <b>{it.name}{it.size ? ` (${it.size})` : ""}</b>
                <button type="button" onClick={() => update(o.id, (x) => ({ ...x, items: x.items.map((y) => (sameItem(y, it) ? { ...y, return: undefined } : y)) }))}>No return</button>
                {RETURN_STEPS.map((rs, k) => (
                  <button key={rs} type="button" onClick={() => {
                    const base = new Date();
                    const at = (d: number) => new Date(base.getTime() + d * 86_400_000).toISOString();
                    update(o.id, (x) => ({
                      ...x,
                      items: x.items.map((y) =>
                        sameItem(y, it)
                          ? { ...y, return: { reason: "Item arrived damaged", details: "", photos: [], ...(y.return ?? {}), status: rs, requestedAt: y.return?.requestedAt ?? at(0), pickupDate: k >= 1 ? at(2) : undefined, pickedUpAt: k >= 2 ? at(2) : undefined, receivedAt: k >= 3 ? at(4) : undefined, refundedAt: k >= 4 ? at(6) : undefined } }
                          : y,
                      ),
                    }));
                  }}>{BADGE[rs]}</button>
                ))}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
