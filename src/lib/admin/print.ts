import type { Order } from "@/lib/orders";
import { fmtShort, PAY_LABEL } from "@/lib/orders";
import { gstOf } from "./orders";
import type { OrderMeta } from "./types";
import { site } from "@/lib/site";

const m = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const e = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The real RUPAARI logo from /images/logo-wine.svg, falling back to the lettered wordmark if the file is missing. */
export const logoHtml = () =>
  `<div class="logo"><img src="${typeof location !== "undefined" ? location.origin : ""}/images/logo-wine.svg" alt="RUPAARI" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><span class="logo-fb" style="display:none">RUPAARI</span></div>`;

const contactLine = () => [site.contact.phone, site.contact.email].filter(Boolean).map((x) => e(x)).join(" · ");

export const invoiceHtml = (o: Order) => {
  const gst = gstOf(o);
  const units = o.items.reduce((a, i) => a + i.qty, 0);
  return `
<header class="doc-head">
  ${logoHtml()}
  <div class="doc-title"><h1>Tax invoice</h1><p>Invoice no. <b>${e(o.id)}</b></p><p>Date <b>${fmtShort(o.placedAt)}</b></p></div>
</header>
<div class="rule"></div>
<section class="cols">
  <div><h2>Billed to</h2><p><b>${e(o.address.name)}</b><br>${e(o.address.line1)}${o.address.area ? ", " + e(o.address.area) : ""}<br>${e(o.address.city)}, ${e(o.address.state)} ${e(o.address.pin)}<br>${e(o.address.country)}${o.address.phone ? "<br>" + e(o.address.phone) : ""}<br>${e(o.contact)}</p></div>
  <div><h2>Order details</h2><p>Order <b>${e(o.id)}</b><br>Placed ${fmtShort(o.placedAt)}<br>Payment ${e(PAY_LABEL[o.payment])}<br>${units} item${units === 1 ? "" : "s"}</p></div>
</section>
<table class="items">
  <thead><tr><th>Item</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Amount</th></tr></thead>
  <tbody>
  ${o.items.map((i) => `<tr><td><b>${e(i.name)}</b><br><span class="muted">${e(i.colour)}${i.size ? " · Size " + e(i.size) : ""}</span></td><td class="r">${i.qty}</td><td class="r">${m(i.price)}</td><td class="r">${m(i.price * i.qty)}</td></tr>`).join("")}
  </tbody>
</table>
<table class="sum">
  <tr><td>Subtotal</td><td class="r">${m(o.subtotal)}</td></tr>
  ${o.discount ? `<tr><td>Discount${o.coupon ? " (" + e(o.coupon) + ")" : ""}</td><td class="r">−${m(o.discount)}</td></tr>` : ""}
  <tr><td>Shipping</td><td class="r">${o.shipping ? m(o.shipping) : "Free"}</td></tr>
  <tr class="grand"><td>Total</td><td class="r">${m(o.total)}</td></tr>
</table>
<p class="muted small">Includes GST at 5%: ${m(gst)}. This is a demo invoice; the numbered GST invoice is issued by the backend.</p>
${o.gift ? `<p class="small"><b>Gift note:</b> ${e(o.gift)}</p>` : ""}
<footer class="doc-foot"><b>Thank you for choosing RUPAARI.</b><br>${contactLine() || "Rediscover yourself"}</footer>`;
};

export const labelHtml = (o: Order, meta?: OrderMeta) => `
<header class="doc-head">
  ${logoHtml()}
  <div class="doc-title"><h1>Shipping label</h1><p>Order <b>${e(o.id)}</b></p></div>
</header>
<div class="rule"></div>
<div class="box"><h2>Ship to</h2><p class="addr"><b>${e(o.address.name)}</b><br>${e(o.address.line1)}${o.address.area ? ", " + e(o.address.area) : ""}<br>${e(o.address.city)}, ${e(o.address.state)} ${e(o.address.pin)}<br>${e(o.address.country)}${o.address.phone ? "<br>" + e(o.address.phone) : ""}</p></div>
<div class="box"><h2>${e(meta?.courier ?? "Courier")}</h2><div class="big">${e(meta?.tracking ?? "—")}</div></div>
<p class="small">${o.items.reduce((a, i) => a + i.qty, 0)} item(s) · ${o.payment === "cod" ? "<b>COLLECT " + m(o.total) + "</b>" : "Prepaid"}</p>`;