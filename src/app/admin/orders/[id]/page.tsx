"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Badge, Btn, Card, Empty, Field, Modal, PageHeader, StatusBadge, Thumb, money } from "@/components/admin/ui";
import { useAdmin } from "@/components/admin/AdminShell";
import { useOrderActions } from "@/components/admin/orderActions";
import { printHtml } from "@/lib/admin/export";
import { NEXT_LABEL, hasReturn, payStatus, retId, statusOf, timelineOf } from "@/lib/admin/orders";
import { invoiceHtml, labelHtml } from "@/lib/admin/print";
import { PAY_LABEL, fmtShort, fmtTime, itemMeta, type Address } from "@/lib/orders";

const COURIERS = ["Delhivery", "DHL Express", "FedEx", "Aramex", "India Post"];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { d, role, can, why, confirm } = useAdmin();
  const act = useOrderActions();
  const o = d.orders.find((x) => x.id === decodeURIComponent(id ?? ""));
  const m = o ? d.meta[o.id] : undefined;
  const [shipOpen, setShipOpen] = useState(false);
  const [courier, setCourier] = useState(COURIERS[0]);
  const [tracking, setTracking] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("Customer asked to cancel");
  const [addrOpen, setAddrOpen] = useState(false);
  const [addr, setAddr] = useState<Address | null>(null);
  const [note, setNote] = useState("");

  if (!o) return <Empty title="Order not found" text="It may have been removed from this device." action={<Btn href="/admin/orders" variant="ghost">Back to orders</Btn>} />;

  const status = statusOf(o, m);
  const cancelled = status === "Cancelled";
  const canMove = ["owner", "manager", "operations"].includes(role) && !cancelled;
  const cancelOk = !cancelled && (o.stage === 0 || (o.stage === 1 && can("cancel_packed")));
  const addrOk = !cancelled && o.stage === 0;
  const pay = payStatus(o, m);
  const tl = timelineOf(o, m);

  const next = () => {
    if (o.stage === 0) act.pack(o);
    else if (o.stage === 1) {
      setTracking(`${courier.slice(0, 3).toUpperCase()}${Math.floor(10_000_000 + Math.random() * 89_999_999)}`);
      setShipOpen(true);
    } else if (o.stage === 2) act.outForDelivery(o);
    else if (o.stage === 3) act.deliver(o);
  };
  const doCancel = async () => {
    setCancelOpen(false);
    if (await confirm({ title: `Cancel ${o.id}?`, body: "The customer is told and, if they paid online, a refund is due.", label: "Cancel order", danger: true })) act.cancel(o, reason);
  };

  return (
    <>
      <PageHeader
        back={{ href: "/admin/orders", label: "Orders" }}
        title={o.id}
        sub={`Placed ${fmtTime(o.placedAt)}`}
        actions={
          <>
            <Btn variant="ghost" icon="print" onClick={() => printHtml(`Invoice ${o.id}`, invoiceHtml(o))}>Invoice</Btn>
            {cancelOk && <Btn variant="danger" onClick={() => setCancelOpen(true)}>Cancel order</Btn>}
            {!cancelled && o.stage === 1 && !can("cancel_packed") && <Btn variant="danger" disabled title={why("cancel_packed")}>Cancel order</Btn>}
            {canMove && NEXT_LABEL[o.stage] && <Btn onClick={next}>{NEXT_LABEL[o.stage]}</Btn>}
          </>
        }
      />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <StatusBadge s={status} />
        <StatusBadge s={pay} />
        {hasReturn(o) && <Badge tone="gold">Return requested</Badge>}
        {o.gift && <Badge tone="wine">Gift note</Badge>}
      </div>
      {cancelled && m?.cancelled && (
        <div className="adm-alert adm-alert--red">
          <span><b>Cancelled</b> on {fmtShort(m.cancelled.at)} by {m.cancelled.by}. Reason: {m.cancelled.reason}.</span>
        </div>
      )}

      <div className="adm-cols">
        <div>
          <Card title="Items">
            {o.items.map((it) => (
              <div key={it.id + (it.size ?? "")} className="adm-line-i">
                <Thumb tone={it.tone} src={d.products.find((p) => p.id === it.id)?.images[0]?.src} large />
                <div>
                  <b style={{ fontWeight: 500 }}>{it.name}</b>
                  <small>{itemMeta(it)}</small>
                  {it.return && <Link href={`/admin/returns/${retId(o, it)}`} className="adm-link" style={{ fontSize: 12 }}>Return: {it.return.status}</Link>}
                </div>
                <b style={{ fontWeight: 500 }}>{money(it.price * it.qty)}</b>
              </div>
            ))}
            <dl className="adm-kv" style={{ marginTop: 14 }}>
              <div><dt>Subtotal</dt><dd>{money(o.subtotal)}</dd></div>
              <div><dt>Shipping</dt><dd>{money(o.shipping)}</dd></div>
              <div className="is-total"><dt>Total</dt><dd>{money(o.total)}</dd></div>
            </dl>
          </Card>

          <Card title="Timeline">
            <ol className="adm-tl">
              {[...tl].reverse().map((t, i) => (
                <li key={t.at + t.label + i} className={i === 0 ? "is-now" : ""}>
                  <b>{t.label}</b>
                  <span>{fmtTime(t.at)} · {t.by}{t.note ? ` · ${t.note}` : ""}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card title="Internal notes">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!note.trim()) return;
                act.addNote(o, note.trim());
                setNote("");
              }}
              style={{ display: "grid", gap: 10, marginBottom: 14 }}
            >
              <textarea className="adm-in" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Visible to staff only" aria-label="New note" />
              <div><Btn type="submit" size="sm" disabled={!note.trim()}>Add note</Btn></div>
            </form>
            {(m?.notes ?? []).length === 0 && <p className="adm-sub">No notes yet.</p>}
            {(m?.notes ?? []).map((n, i) => (
              <div key={n.at + i} className="adm-note">{n.text}<small>{n.by} · {fmtTime(n.at)}</small></div>
            ))}
          </Card>
        </div>

        <div>
          <Card title="Customer">
            <p><Link href={`/admin/customers/${encodeURIComponent(o.contact.toLowerCase())}`} className="adm-link">{o.address.name}</Link></p>
            <p className="adm-sub">{o.contact}</p>
            <p className="adm-sub">{o.address.country}</p>
          </Card>
          <Card title="Shipping address" actions={addrOk ? <Btn size="sm" variant="ghost" icon="edit" onClick={() => { setAddr({ ...o.address }); setAddrOpen(true); }}>Edit</Btn> : <small>Locked once packed</small>}>
            <p>{o.address.name}<br />{o.address.line1}{o.address.area ? `, ${o.address.area}` : ""}<br />{o.address.city}, {o.address.state} {o.address.pin}<br />{o.address.country}{o.address.phone ? <><br />{o.address.phone}</> : null}</p>
          </Card>
          <Card title="Payment">
            <dl className="adm-kv">
              <div><dt>Method</dt><dd>{PAY_LABEL[o.payment]}</dd></div>
              <div><dt>Status</dt><dd><StatusBadge s={pay} /></dd></div>
            </dl>
            {pay === "Refund due" && (
              <div style={{ marginTop: 12 }}>
                <Btn size="sm" variant="ghost" disabled={o.total > d.settings.refundLimit && !can("refund_big")} title={o.total > d.settings.refundLimit ? why("refund_big") : undefined} onClick={() => act.markRefunded(o)}>Record refund of {money(o.total)}</Btn>
              </div>
            )}
          </Card>
          {(m?.courier || o.stage >= 2) && (
            <Card title="Shipment" actions={m?.courier ? <Btn size="sm" variant="ghost" icon="print" onClick={() => printHtml(`Label ${o.id}`, labelHtml(o, m))}>Label</Btn> : undefined}>
              <dl className="adm-kv">
                <div><dt>Courier</dt><dd>{m?.courier ?? "Not recorded"}</dd></div>
                <div><dt>Tracking</dt><dd className="adm-mono">{m?.tracking ?? "Not recorded"}</dd></div>
                {m?.shippedAt && <div><dt>Shipped</dt><dd>{fmtShort(m.shippedAt)}</dd></div>}
              </dl>
            </Card>
          )}
          {o.gift && (
            <Card title="Gift message"><p className="adm-pre">{o.gift}</p></Card>
          )}
        </div>
      </div>

      <Modal open={shipOpen} onClose={() => setShipOpen(false)} title="Create shipment" footer={<><Btn variant="ghost" onClick={() => setShipOpen(false)}>Cancel</Btn><Btn disabled={!tracking.trim()} onClick={() => { act.ship(o, courier, tracking.trim()); setShipOpen(false); }}>Mark as shipped</Btn></>}>
        <div className="adm-form" style={{ gridTemplateColumns: "1fr" }}>
          <Field label="Courier"><select className="adm-in" value={courier} onChange={(e) => setCourier(e.target.value)}>{COURIERS.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Tracking number" hint="Demo number generated. Replace it with the real AWB."><input className="adm-in adm-mono" value={tracking} onChange={(e) => setTracking(e.target.value)} /></Field>
        </div>
      </Modal>
      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel order" footer={<><Btn variant="ghost" onClick={() => setCancelOpen(false)}>Keep order</Btn><Btn variant="danger" onClick={doCancel}>Continue</Btn></>}>
        <Field label="Reason"><select className="adm-in" value={reason} onChange={(e) => setReason(e.target.value)}>{["Customer asked to cancel", "Payment problem", "Item unavailable", "Address could not be served", "Duplicate order"].map((r) => <option key={r}>{r}</option>)}</select></Field>
      </Modal>
      <Modal open={addrOpen} onClose={() => setAddrOpen(false)} title="Edit shipping address" footer={<><Btn variant="ghost" onClick={() => setAddrOpen(false)}>Cancel</Btn><Btn onClick={() => { if (addr) act.saveAddress(o, addr); setAddrOpen(false); }}>Save address</Btn></>}>
        {addr && (
          <div className="adm-form">
            {(["name", "line1", "area", "city", "state", "pin", "country", "phone"] as const).map((k) => (
              <Field key={k} label={k === "line1" ? "Address" : k === "pin" ? "PIN or postal code" : k.charAt(0).toUpperCase() + k.slice(1)}>
                <input className="adm-in" value={addr[k] ?? ""} onChange={(e) => setAddr({ ...addr, [k]: e.target.value })} />
              </Field>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
