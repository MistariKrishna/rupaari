import type { Order } from "@/lib/orders";
import { fmtShort, PAY_LABEL } from "@/lib/orders";
import { gstOf } from "./orders";
import type { OrderMeta } from "./types";

const m = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const e = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const invoiceHtml = (o: Order) => `
<h1>RUPAARI</h1><p class="muted">Tax invoice · Rediscover yourself</p>
<p><b>Invoice for order ${e(o.id)}</b><br>Date: ${fmtShort(o.placedAt)}<br>Payment: ${e(PAY_LABEL[o.payment])}</p>
<p><b>Bill to</b><br>${e(o.address.name)}<br>${e(o.address.line1)}${o.address.area ? ", " + e(o.address.area) : ""}<br>${e(o.address.city)}, ${e(o.address.state)} ${e(o.address.pin)}<br>${e(o.address.country)}<br>${e(o.contact)}</p>
<table><tr><th>Item</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Amount</th></tr>
${o.items.map((i) => `<tr><td>${e(i.name)}${i.size ? " · Size " + e(i.size) : ""}<br><span class="muted">${e(i.colour)}</span></td><td class="r">${i.qty}</td><td class="r">${m(i.price)}</td><td class="r">${m(i.price * i.qty)}</td></tr>`).join("")}
<tr><td colspan="3" class="r">Subtotal</td><td class="r">${m(o.subtotal)}</td></tr>
<tr><td colspan="3" class="r">Shipping</td><td class="r">${m(o.shipping)}</td></tr>
<tr><td colspan="3" class="r"><b>Total</b></td><td class="r"><b>${m(o.total)}</b></td></tr></table>
<p class="muted">Includes GST at 5%: ${m(gstOf(o))}. This is a demo invoice; the numbered GST invoice is issued by the backend.</p>`;

export const labelHtml = (o: Order, meta?: OrderMeta) => `
<h1>RUPAARI</h1><p class="muted">Shipping label</p>
<div class="box"><b>Ship to</b><br>${e(o.address.name)}<br>${e(o.address.line1)}${o.address.area ? ", " + e(o.address.area) : ""}<br>${e(o.address.city)}, ${e(o.address.state)} ${e(o.address.pin)}<br>${e(o.address.country)}${o.address.phone ? "<br>" + e(o.address.phone) : ""}</div>
<div class="box"><b>${e(meta?.courier ?? "Courier")}</b><div class="big">${e(meta?.tracking ?? "—")}</div></div>
<p>Order ${e(o.id)} · ${o.items.reduce((a, i) => a + i.qty, 0)} item(s) · ${o.payment === "cod" ? "COLLECT " + m(o.total) : "Prepaid"}</p>`;
