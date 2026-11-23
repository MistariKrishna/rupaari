"use client";

import Link from "next/link";
import { useMemo } from "react";
import DataTable, { FilterSelect, Toolbar, type Col } from "@/components/admin/DataTable";
import { Badge, PageHeader, useQ } from "@/components/admin/ui";
import { useAdmin } from "@/components/admin/AdminShell";
import type { StockMovement } from "@/lib/admin/types";
import { fmtTime } from "@/lib/orders";

export default function Ledger() {
  const { d } = useAdmin();
  const q = useQ();
  const term = q.get("q").toLowerCase();
  const type = q.get("type");
  const name = (id: string) => d.products.find((p) => p.id === id)?.name ?? id;
  const rows = useMemo(() => d.ledger.filter((m) => (!type || m.type === type) && (!term || `${name(m.productId)} ${m.note ?? ""} ${m.by}`.toLowerCase().includes(term))), [d.ledger, d.products, type, term]); // eslint-disable-line react-hooks/exhaustive-deps
  const cols: Col<StockMovement>[] = [
    { key: "at", label: "When", sort: (m) => m.at, csv: (m) => m.at, render: (m) => fmtTime(m.at) },
    { key: "p", label: "Product", sort: (m) => name(m.productId), csv: (m) => name(m.productId), render: (m) => <div><Link href={`/admin/products/${m.productId}`} className="adm-link">{name(m.productId)}</Link>{m.size && <small>Size {m.size}</small>}</div> },
    { key: "t", label: "Type", sort: (m) => m.type, render: (m) => <Badge tone={m.type === "receive" || m.type === "return" ? "green" : m.type === "sale" ? "blue" : "amber"}>{m.type}</Badge> },
    { key: "q", label: "Qty", sort: (m) => m.qty, className: "r", render: (m) => (m.qty > 0 ? `+${m.qty}` : m.qty) },
    { key: "by", label: "By", sort: (m) => m.by, hideOnMobile: true, render: (m) => m.by },
    { key: "n", label: "Note", hideOnMobile: true, csv: (m) => m.note ?? "", render: (m) => m.note ?? "" },
  ];
  return (
    <>
      <PageHeader back={{ href: "/admin/inventory", label: "Inventory" }} title="Movement ledger" sub="A read-only history. Entries cannot be edited or removed." />
      <Toolbar placeholder="Search product, note or person">
        <FilterSelect param="type" label="All types" options={["receive", "reserve", "release", "sale", "return", "adjust"].map((t) => ({ value: t, label: t }))} />
      </Toolbar>
      <DataTable rows={rows} cols={cols} rowKey={(m) => m.id} exportName="stock-ledger" defaultSort={{ key: "at", dir: "desc" }} pageSize={15} emptyTitle="No movements yet" />
    </>
  );
}
