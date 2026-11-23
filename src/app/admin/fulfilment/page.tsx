"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, Btn, Card, Check, Empty, Field, Modal, PageHeader, Thumb, money } from "@/components/admin/ui";
import { useAdmin } from "@/components/admin/AdminShell";
import { useOrderActions } from "@/components/admin/orderActions";
import { itemMeta, fmtShort, type Order } from "@/lib/orders";
import type { OrderMeta } from "@/lib/admin/types";

const COURIERS = ["Delhivery", "DHL Express", "FedEx", "Aramex", "India Post"];
type Tab = "pack" | "ship";

export default function Fulfilment() {
  const { d, set, toast, log } = useAdmin();
  const act = useOrderActions();
  const [tab, setTab] = useState<Tab>("pack");
  const [checks, setChecks] = useState<Record<string, { sku: boolean; quality: boolean; photo: boolean }>>({});
  const [picked, setPicked] = useState<string[]>([]);
  const [courier, setCourier] = useState(COURIERS[0]);
  const [open, setOpen] = useState(false);

  const live = (o: Order) => !d.meta[o.id]?.cancelled;
  const toPack = d.orders.filter((o) => o.stage === 0 && live(o)).sort((a, b) => a.placedAt.localeCompare(b.placedAt));
  const toShip = d.orders.filter((o) => o.stage === 1 && live(o)).sort((a, b) => a.placedAt.localeCompare(b.placedAt));
  const ck = (id: string) => checks[id] ?? { sku: false, quality: false, photo: false };
  const setCk = (id: string, k: "sku" | "quality" | "photo", v: boolean) => setChecks((c) => ({ ...c, [id]: { ...ck(id), [k]: v } }));

  const bulkShip = () => {
    const stamp = Date.now();
    picked.forEach((id, i) => {
      const o = d.orders.find((x) => x.id === id);
      if (!o) return;
      const tracking = `${courier.slice(0, 3).toUpperCase()}${48_000_000 + ((stamp + i * 7919) % 9_000_000)}`;
      set("orders", (prev) => prev.map((x) => (x.id === id ? { ...x, stage: 2 } : x)));
      set("meta", (prev) => {
        const m: OrderMeta = prev[id] ?? { id, notes: [], timeline: [] };
        return { ...prev, [id]: { ...m, courier, tracking, shippedAt: new Date().toISOString(), timeline: [...m.timeline, { at: new Date().toISOString(), label: "Shipped", by: "Operations", note: `${courier} ${tracking}` }] } };
      });
    });
    log("Shipment", picked.join(", "), "Bulk create shipment", courier);
    toast(`${picked.length} ${picked.length === 1 ? "shipment" : "shipments"} created`);
    setPicked([]);
    setOpen(false);
  };

  return (
    <>
      <PageHeader title="Fulfilment" sub="Pack confirmed orders, then create shipments. Works on a phone." actions={<Btn href="/admin/fulfilment/shipments" variant="ghost" icon="truck">Shipments</Btn>} />
      <div className="adm-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "pack"} className="adm-tab" onClick={() => setTab("pack")}>To pack <span className="adm-tab-c">{toPack.length}</span></button>
        <button type="button" role="tab" aria-selected={tab === "ship"} className="adm-tab" onClick={() => setTab("ship")}>Ready to ship <span className="adm-tab-c">{toShip.length}</span></button>
      </div>

      {tab === "pack" && (toPack.length === 0 ? <Empty title="Nothing to pack" text="New confirmed orders will appear here, oldest first." /> : (
        <div className="adm-pack">
          {toPack.map((o) => {
            const c = ck(o.id);
            const ready = c.sku && c.quality && c.photo;
            return (
              <Card key={o.id} title={<Link href={`/admin/orders/${o.id}`} className="adm-link">{o.id}</Link>} actions={<small>{fmtShort(o.placedAt)}</small>}>
                {o.items.map((it) => (
                  <div key={it.id + (it.size ?? "")} className="adm-line-i" style={{ padding: "4px 0", border: 0 }}>
                    <Thumb tone={it.tone} src={d.products.find((p) => p.id === it.id)?.images[0]?.src} />
                    <div>
                      <b style={{ fontWeight: 500 }}>{it.name}</b>
                      <small>{itemMeta(it)}</small>
                      <small className="adm-mono">{d.products.find((p) => p.id === it.id)?.sku}</small>
                    </div>
                  </div>
                ))}
                <small>{o.address.city}, {o.address.country}</small>
                {o.gift && <Badge tone="wine">Gift note: add the card</Badge>}
                <div style={{ display: "grid", gap: 2 }}>
                  <Check checked={c.sku} onChange={(v) => setCk(o.id, "sku", v)} label="Item matches the SKU" />
                  <Check checked={c.quality} onChange={(v) => setCk(o.id, "quality", v)} label="Quality checked" />
                  <Check checked={c.photo} onChange={(v) => setCk(o.id, "photo", v)} label="Packing photo taken" />
                </div>
                <Btn disabled={!ready} onClick={() => act.pack(o)}>Mark as packed</Btn>
              </Card>
            );
          })}
        </div>
      ))}

      {tab === "ship" && (toShip.length === 0 ? <Empty title="No packed orders" text="Packed orders wait here until a shipment is created." /> : (
        <>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
            <Check checked={picked.length === toShip.length} onChange={(v) => setPicked(v ? toShip.map((o) => o.id) : [])} label={`Select all (${toShip.length})`} />
            <span className="adm-grow" />
            <Btn disabled={picked.length === 0} onClick={() => setOpen(true)} icon="truck">Create shipment{picked.length ? ` (${picked.length})` : ""}</Btn>
          </div>
          <div className="adm-pack">
            {toShip.map((o) => (
              <Card key={o.id} title={<Check checked={picked.includes(o.id)} onChange={(v) => setPicked((p) => (v ? [...p, o.id] : p.filter((x) => x !== o.id)))} label={<b style={{ fontWeight: 500 }}>{o.id}</b>} />} actions={<small>{money(o.total)}</small>}>
                <p>{o.address.name}</p>
                <small>{o.address.line1}, {o.address.city}, {o.address.country} {o.address.pin}</small>
                <small>{o.items.length} {o.items.length === 1 ? "item" : "items"} · {o.payment === "cod" ? "Collect on delivery" : "Prepaid"}</small>
              </Card>
            ))}
          </div>
        </>
      ))}

      <Modal open={open} onClose={() => setOpen(false)} title={`Create ${picked.length} ${picked.length === 1 ? "shipment" : "shipments"}`} footer={<><Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn><Btn onClick={bulkShip}>Create shipments</Btn></>}>
        <Field label="Courier" hint="Demo tracking numbers are generated. A real courier service replaces this with live labels."><select className="adm-in" value={courier} onChange={(e) => setCourier(e.target.value)}>{COURIERS.map((c) => <option key={c}>{c}</option>)}</select></Field>
      </Modal>
    </>
  );
}
