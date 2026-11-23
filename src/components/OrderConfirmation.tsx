"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { colourway, fmtDate, itemKey } from "@/lib/orders";
import { money } from "@/lib/products";
import Crumbs from "./Crumbs";
import { Icon } from "./Icon";
import { AddressBlock, PaymentSummary, Thumb } from "./OrderParts";
import { useOrders } from "./useOrders";

export default function OrderConfirmation() {
  const id = useSearchParams().get("order");
  const { orders, ready } = useOrders();
  const o = orders.find((x) => x.id === id);

  if (ready && !o) {
    return (
      <div className="rp-page"><div className="rp-wrap">
        <Crumbs items={[{ label: "Home", href: "/" }, { label: "Order confirmation" }]} />
        <div className="rp-empty"><h2>We couldn’t find that order</h2><p>Orders are saved on the device they were placed from.</p><Link href="/account/orders" className="btn">My orders</Link></div>
      </div></div>
    );
  }
  if (!o) return <div className="rp-page" />;

  return (
    <div className="rp-page">
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
            <section aria-labelledby="oc-addr" className="od-addr-sec">
              <h2 className="rp-h2" id="oc-addr">Delivery address</h2>
              <AddressBlock o={o} />
              {o.gift && <p className="od-gift">Gift wrap requested: {o.gift}</p>}
            </section>
          </div>
          <PaymentSummary o={o} confirm>
            <Link href={`/account/orders/${o.id}`} className="btn w-full">Track order</Link>
            <Link href="/collections" className="rp-link od-cont">Continue shopping</Link>
          </PaymentSummary>
        </div>
      </div>
    </div>
  );
}