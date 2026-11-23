"use client";

import Link from "next/link";
import { productSlot } from "@/lib/images";
import { maskId } from "@/lib/identity";
import { PAY_LABEL, fmtDate, type Order, type OrderItem } from "@/lib/orders";
import { money } from "@/lib/products";
import { Icon } from "./Icon";
import Media from "./Media";

export function Thumb({ it, size = 120 }: { it: OrderItem; size?: number }) {
  return (
    <Link href={`/product/${it.id}`} className="od-thumb" style={{ width: size }} aria-label={it.name}>
      <Media tone={it.tone} className="h-full w-full" sizes={`${size}px`} {...productSlot(it)} />
    </Link>
  );
}

export function AddressBlock({ o }: { o: Order }) {
  const a = o.address;
  return (
    <address className="od-addr">
      {a.name}
      <br />
      {[a.line1, a.area].filter(Boolean).join(", ")}
      <br />
      {a.city}, {a.state} {a.pin}, {a.country}
      {a.phone && (<><br />{a.phone}</>)}
      <br />{maskId(o.contact)}
    </address>
  );
}

export function totalLabel(o: Order, refunded: boolean) {
  if (refunded) return "Original order total";
  if (o.payment === "cod" && o.stage < 4) return "Due on delivery";
  return "Order total";
}

/** Payment summary card shared by confirmation and order pages. */
export function PaymentSummary({ o, refunded = false, children, confirm = false }: { o: Order; refunded?: boolean; children?: React.ReactNode; confirm?: boolean }) {
  return (
    <aside className="rp-card od-pay" aria-label="Payment summary">
      <h2 className="rp-h2">Payment Summary</h2>
      <dl className="rp-rows rp-rows--lg">
        <div><dt>Payment method</dt><dd>{PAY_LABEL[o.payment]}</dd></div>
        <div className="rp-sep"><dt>Subtotal</dt><dd>{money(o.subtotal)}</dd></div>
        <div><dt>Shipping</dt><dd>{money(o.shipping)}</dd></div>
        <div className="rp-bold rp-total"><dt>{confirm && o.payment === "cod" ? "Due on delivery" : totalLabel(o, refunded)}</dt><dd>{money(o.total)}</dd></div>
      </dl>
      {children}
    </aside>
  );
}

export function HelpLink() {
  return (
    <Link href="/contact" className="rp-link od-help">
      Get help with this order <Icon name="arrow-right" />
    </Link>
  );
}

export const placed = (o: Order) => `Placed on ${fmtDate(o.placedAt)}`;