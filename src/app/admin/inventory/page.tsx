"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DataTable, { FilterSelect, Toolbar, type Col } from "@/components/admin/DataTable";
import { Badge, Btn, Field, Modal, PageHeader, StatusBadge, productThumb, uid, useQ } from "@/components/admin/ui";
import { useAdmin } from "@/components/admin/AdminShell";
import { availableOf, stockState } from "@/lib/admin/stock";
import type { AdminProduct, StockRow } from "@/lib/admin/types";

interface Row { r: StockRow; p: AdminProduct }
type Mode = "receive" | "adjust";

export default function Inventory() {
  const { d, set, session, log, toast } = useAdmin();
  const q = useQ();
  const term = q.get("q").toLowerCase();
  const [state, model] = [q.get("state"), q.get("model")];
  const [act, setAct] = useState<{ mode: Mode; row: Row } | null>(null);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");

  const all = useMemo<Row[]>(() => d.stock.map((r) => ({ r, p: d.products.find((p) => p.id === r.id)! })).filter((x) => x.p), [d.stock, d.products]);
  const rows = all.filter(({ r, p }) => (!state || stockState(r, p) === state) && (!model || p.stockModel === model) && (!term || `${p.name} ${p.sku}`.toLowerCase().includes(term)));

  const open = (mode: Mode, row: Row) => {
    setAct({ mode, row });
    setSize(row.p.sizes[0] ?? "");
    setQty(mode === "adjust" ? String(row.p.sizes.length ? row.r.sizes?.[row.p.sizes[0]] ?? 0 : row.r.onHand) : "");
    setNote("");
  };
  const submit = () => {
    if (!act) return;
    const { row, mode } = act;
    const n = Math.floor(Number(qty));
    if (!(n >= 0) || qty === "") return toast("Enter a quantity.", "err");
    if (mode === "adjust" && !note.trim()) return toast("A reason is required for an adjustment.", "err");
    if (mode === "receive" && n < 1) return toast("Enter how many pieces arrived.", "err");
    const sized = row.p.sizes.length > 0;
    const before = sized ? row.r.sizes?.[size] ?? 0 : row.r.onHand;
    const after = mode === "receive" ? before + n : n;
    const delta = after - before;
    set("stock", (prev) => prev.map((s) => {
      if (s.id !== row.r.id) return s;
      if (!sized) return { ...s, onHand: after };
      const sizes = { ...(s.sizes ?? {}), [size]: after };
      return { ...s, sizes, onHand: Object.values(sizes).reduce((a, b) => a + b, 0) };
    }));
    set("ledger", (prev) => [{ id: uid("mv"), at: new Date().toISOString(), productId: row.p.id, size: sized ? size : undefined, type: mode, qty: mode === "receive" ? n : delta, by: session.name, note: note.trim() || undefined }, ...prev]);
    if (sized) set("products", (prev) => prev.map((p) => (p.id === row.p.id ? { ...p, soldOutSizes: after === 0 ? Array.from(new Set([...p.soldOutSizes, size])) : p.soldOutSizes.filter((x) => x !== size) } : p)));
    log("Stock", row.p.name, mode === "receive" ? `Received ${n}` : `Adjusted to ${after}`, note);
    toast(mode === "receive" ? `${n} received` : "Stock adjusted");
    setAct(null);
  };

  const cols: Col<Row>[] = [
    { key: "name", label: "Product", sort: ({ p }) => p.name, csv: ({ p }) => p.name, render: ({ p, r }) => (
      <div><div className="adm-cell-main">{productThumb(p)}<div><Link href={`/admin/products/${p.id}`} className="adm-link">{p.name}</Link><small>{p.sku}</small></div></div>
        {p.sizes.length > 0 && <div className="adm-chips" style={{ marginTop: 8 }}>{p.sizes.map((s) => <Badge key={s} tone={(r.sizes?.[s] ?? 0) === 0 ? "red" : (r.sizes?.[s] ?? 0) <= 2 ? "amber" : "grey"}>{s}: {r.sizes?.[s] ?? 0}</Badge>)}</div>}</div>
    ) },
    { key: "model", label: "Model", sort: ({ p }) => p.stockModel, hideOnMobile: true, render: ({ p }) => ({ one_of_one: "One of one", multi: "Multiple", made_to_order: "Made to order" })[p.stockModel] },
    { key: "hand", label: "On hand", sort: ({ r }) => r.onHand, className: "r", render: ({ r }) => r.onHand },
    { key: "res", label: "Reserved", sort: ({ r }) => r.reserved, className: "r", hideOnMobile: true, render: ({ r }) => r.reserved },
    { key: "avail", label: "Available", sort: ({ r }) => availableOf(r), className: "r", render: ({ r, p }) => (p.stockModel === "made_to_order" ? "On order" : availableOf(r)) },
    { key: "re", label: "Reorder at", sort: ({ r }) => r.reorder, className: "r", hideOnMobile: true, render: ({ r, p }) => (p.stockModel === "one_of_one" || p.stockModel === "made_to_order" ? "n/a" : r.reorder) },
    { key: "st", label: "Status", sort: ({ r, p }) => stockState(r, p), csv: ({ r, p }) => stockState(r, p), render: ({ r, p }) => (p.stockModel === "one_of_one" ? <StatusBadge s={availableOf(r) > 0 ? "Available" : "Sold"} /> : <StatusBadge s={stockState(r, p)} />) },
    { key: "act", label: "", csv: () => "", render: (row) => (<div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}><Btn size="sm" variant="ghost" onClick={() => open("receive", row)}>Receive</Btn><Btn size="sm" variant="ghost" onClick={() => open("adjust", row)}>Adjust</Btn></div>) },
  ];

  return (
    <>
      <PageHeader title="Inventory" sub="Counts per piece, and per size for kurtis. Every change is logged." actions={<Btn href="/admin/inventory/ledger" variant="ghost">Movement ledger</Btn>} />
      <Toolbar placeholder="Search title or SKU">
        <FilterSelect param="state" label="All stock states" options={[{ value: "Low", label: "Low" }, { value: "Out", label: "Out of stock" }, { value: "OK", label: "OK" }]} />
        <FilterSelect param="model" label="All stock models" options={[{ value: "one_of_one", label: "One of one" }, { value: "multi", label: "Multiple" }, { value: "made_to_order", label: "Made to order" }]} />
      </Toolbar>
      <DataTable rows={rows} cols={cols} rowKey={({ r }) => r.id} exportName="inventory" defaultSort={{ key: "name", dir: "asc" }} emptyTitle="No stock records match" />
      <Modal open={!!act} onClose={() => setAct(null)} title={act ? `${act.mode === "receive" ? "Receive stock" : "Adjust stock"}: ${act.row.p.name}` : ""} footer={<><Btn variant="ghost" onClick={() => setAct(null)}>Cancel</Btn><Btn onClick={submit}>{act?.mode === "receive" ? "Receive" : "Save adjustment"}</Btn></>}>
        {act && (
          <div className="adm-form" style={{ gridTemplateColumns: "1fr" }}>
            {act.row.p.sizes.length > 0 && (
              <Field label="Size">
                <select className="adm-in" value={size} onChange={(e) => { setSize(e.target.value); if (act.mode === "adjust") setQty(String(act.row.r.sizes?.[e.target.value] ?? 0)); }}>
                  {act.row.p.sizes.map((s) => <option key={s} value={s}>{s} ({act.row.r.sizes?.[s] ?? 0} on hand)</option>)}
                </select>
              </Field>
            )}
            <Field label={act.mode === "receive" ? "Pieces received" : "New count on hand"}><input className="adm-in" type="number" min={0} value={qty} onChange={(e) => setQty(e.target.value)} /></Field>
            <Field label={act.mode === "adjust" ? "Reason (required)" : "Note (optional)"}>
              {act.mode === "adjust" ? (
                <select className="adm-in" value={note} onChange={(e) => setNote(e.target.value)}><option value="">Choose a reason</option>{["Stock count correction", "Damaged", "Lost", "Found", "Sample or photoshoot"].map((r) => <option key={r}>{r}</option>)}</select>
              ) : <input className="adm-in" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Supplier, invoice number" />}
            </Field>
          </div>
        )}
      </Modal>
    </>
  );
}
