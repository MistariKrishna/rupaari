"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Btn, Card, Field, PageHeader, money, toNum } from "@/components/admin/ui";
import { useAdmin } from "@/components/admin/AdminShell";
import { deriveCustomers } from "@/lib/admin/customers";
import { emptyMeta, entry } from "@/lib/admin/orders";
import { COUNTRIES } from "@/lib/countries";
import { shippingFor } from "@/lib/checkout";
import { colourway, nextOrderId, type Address, type Order, type PayMethod } from "@/lib/orders";
import { KURTI_SIZES } from "@/lib/products";

interface Line { productId: string; size: string; qty: number }
const blank: Address = { name: "", line1: "", area: "", pin: "", city: "", state: "", country: "India", phone: "" };

export default function NewOrder() {
  const { d, set, session, log, toast } = useAdmin();
  const router = useRouter();
  const customers = useMemo(() => deriveCustomers(d), [d]);
  const sellable = d.products.filter((p) => p.status === "live");
  const [email, setEmail] = useState("");
  const [addr, setAddr] = useState<Address>(blank);
  const [lines, setLines] = useState<Line[]>([{ productId: sellable[0]?.id ?? "", size: "", qty: 1 }]);
  const [pay, setPay] = useState<PayMethod>("upi");
  const [gift, setGift] = useState("");
  const [err, setErr] = useState("");

  const india = addr.country === "India";
  const priced = lines.map((l) => ({ l, p: d.products.find((p) => p.id === l.productId) })).filter((x) => x.p);
  const subtotal = priced.reduce((a, { l, p }) => a + (p?.price ?? 0) * l.qty, 0);
  const shipping = priced.length ? shippingFor(addr.country) : 0;

  const pickCustomer = (v: string) => {
    setEmail(v);
    const c = customers.find((x) => x.id === v.trim().toLowerCase());
    if (c) {
      const last = c.orders[0];
      setAddr(last ? { ...last.address } : { ...blank, name: c.name, country: c.country });
    }
  };
  const setLine = (i: number, patch: Partial<Line>) => setLines((ls) => ls.map((l, k) => (k === i ? { ...l, ...patch } : l)));

  const submit = () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErr("Enter the customer's email address.");
    for (const k of ["name", "line1", "city", "pin", "country"] as const) if (!addr[k].trim()) return setErr("Fill in the delivery address.");
    if (!priced.length) return setErr("Add at least one product.");
    for (const { l, p } of priced) if (p && p.sizes.length && !l.size) return setErr(`Choose a size for ${p.name}.`);
    if (!india && pay !== "card") return setErr("Outside India only card payment is available.");
    const id = nextOrderId(d.orders);
    const order: Order = {
      id, placedAt: new Date().toISOString(), stage: 0, contact: email.trim(), payment: pay, address: addr,
      items: priced.map(({ l, p }) => ({ id: p!.id, name: p!.name, price: p!.price, qty: l.qty, colour: colourway(p!.tone), size: l.size || undefined, tone: p!.tone, nonReturnable: p!.category === "gift-craft" })),
      subtotal, shipping, total: subtotal + shipping, gift: gift.trim() || undefined,
    };
    set("orders", (prev) => [order, ...prev]);
    set("meta", (prev) => ({ ...prev, [id]: { ...emptyMeta(id), timeline: [entry("Order placed", session.name, "Manual order"), entry("Confirmed", session.name)] } }));
    log("Order", id, "Manual order created");
    toast(`Order ${id} created`);
    router.push(`/admin/orders/${id}`);
  };

  return (
    <>
      <PageHeader back={{ href: "/admin/orders", label: "Orders" }} title="Manual order" sub="For sales taken over WhatsApp or phone. The order is saved as Confirmed." />
      {err && <div className="adm-alert adm-alert--red" role="alert">{err}</div>}
      <div className="adm-cols">
        <div>
          <Card title="Customer">
            <div className="adm-form">
              <Field label="Email" wide>
                <input className="adm-in" list="cust-list" value={email} onChange={(e) => pickCustomer(e.target.value)} placeholder="name@example.com" type="email" />
                <datalist id="cust-list">{customers.map((c) => <option key={c.id} value={c.contact}>{c.name}</option>)}</datalist>
              </Field>
              <Field label="Full name"><input className="adm-in" value={addr.name} onChange={(e) => setAddr({ ...addr, name: e.target.value })} /></Field>
              <Field label="Phone (optional)"><input className="adm-in" value={addr.phone ?? ""} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} /></Field>
              <Field label="Address" wide><input className="adm-in" value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} /></Field>
              <Field label="Area"><input className="adm-in" value={addr.area} onChange={(e) => setAddr({ ...addr, area: e.target.value })} /></Field>
              <Field label="City"><input className="adm-in" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} /></Field>
              <Field label="State"><input className="adm-in" value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })} /></Field>
              <Field label="PIN or postal code"><input className="adm-in" value={addr.pin} onChange={(e) => setAddr({ ...addr, pin: e.target.value })} /></Field>
              <Field label="Country">
                <select className="adm-in" value={addr.country} onChange={(e) => { setAddr({ ...addr, country: e.target.value }); if (e.target.value !== "India" && pay !== "card") setPay("card"); }}>
                  {COUNTRIES.map((c) => <option key={c.name}>{c.name}</option>)}
                </select>
              </Field>
            </div>
          </Card>
          <Card title="Products" actions={<Btn size="sm" variant="ghost" icon="plus" onClick={() => setLines((l) => [...l, { productId: sellable[0]?.id ?? "", size: "", qty: 1 }])}>Add line</Btn>}>
            <div style={{ display: "grid", gap: 14 }}>
              {lines.map((l, i) => {
                const p = d.products.find((x) => x.id === l.productId);
                return (
                  <div key={i} className="adm-lf">
                    <Field label="Product">
                      <select className="adm-in" value={l.productId} onChange={(e) => setLine(i, { productId: e.target.value, size: "" })}>{sellable.map((x) => <option key={x.id} value={x.id}>{x.name} · {money(x.price)}</option>)}</select>
                    </Field>
                    <Field label="Size">
                      <select className="adm-in" value={l.size} disabled={!p?.sizes.length} onChange={(e) => setLine(i, { size: e.target.value })}>
                        <option value="">{p?.sizes.length ? "Choose" : "None"}</option>
                        {(p?.sizes.length ? KURTI_SIZES : []).map((s) => <option key={s} disabled={p?.soldOutSizes.includes(s)}>{s}{p?.soldOutSizes.includes(s) ? " (sold out)" : ""}</option>)}
                      </select>
                    </Field>
                    <Field label="Qty"><input className="adm-in" type="number" min={1} value={l.qty} onChange={(e) => setLine(i, { qty: Math.max(1, Number(toNum(e.target.value)) || 1) })} /></Field>
                    <button type="button" className="adm-ibtn" onClick={() => setLines((ls) => ls.filter((_, k) => k !== i))} disabled={lines.length === 1} aria-label="Remove line"><span aria-hidden>×</span></button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
        <div>
          <Card title="Payment and gift">
            <div style={{ display: "grid", gap: 14 }}>
              <Field label="Payment method">
                <select className="adm-in" value={pay} onChange={(e) => setPay(e.target.value as PayMethod)}>
                  <option value="upi" disabled={!india}>UPI{!india ? " (India only)" : ""}</option>
                  <option value="card">Credit or debit card</option>
                  <option value="cod" disabled={!india || !d.settings.codEnabled}>Cash on delivery{!india ? " (India only)" : ""}</option>
                </select>
              </Field>
              <Field label="Gift message (optional)"><textarea className="adm-in" value={gift} onChange={(e) => setGift(e.target.value)} /></Field>
            </div>
          </Card>
          <Card title="Summary">
            <dl className="adm-kv">
              <div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
              <div><dt>Shipping ({addr.country || "India"})</dt><dd>{money(shipping)}</dd></div>
              <div className="is-total"><dt>Total</dt><dd>{money(subtotal + shipping)}</dd></div>
            </dl>
            <div style={{ marginTop: 16 }}><Btn onClick={submit}>Create order</Btn></div>
          </Card>
        </div>
      </div>
    </>
  );
}
