"use client";

import Link from "next/link";
import { useMemo } from "react";
import DataTable, { FilterSelect, Toolbar, type Col } from "@/components/admin/DataTable";
import { Btn, PageHeader, StatusBadge, useQ } from "@/components/admin/ui";
import { useAdmin } from "@/components/admin/AdminShell";
import { printHtml } from "@/lib/admin/export";
import { statusOf } from "@/lib/admin/orders";
import { labelHtml } from "@/lib/admin/print";
import { fmtShort, type Order } from "@/lib/orders";

export default function Shipments() {
  const { d } = useAdmin();
  const q = useQ();
  const term = q.get("q").toLowerCase();
  const courier = q.get("courier");
  const rows = useMemo(
    () => d.orders.filter((o) => d.meta[o.id]?.tracking && (!courier || d.meta[o.id]?.courier === courier) && (!term || `${o.id} ${d.meta[o.id]?.tracking} ${o.address.name}`.toLowerCase().includes(term))),
    [d.orders, d.meta, courier, term],
  );
  const couriers = Array.from(new Set(d.orders.map((o) => d.meta[o.id]?.courier).filter(Boolean) as string[]));
  const cols: Col<Order>[] = [
    { key: "id", label: "Order", sort: (o) => o.id, render: (o) => <Link href={`/admin/orders/${o.id}`} className="adm-link">{o.id}</Link> },
    { key: "courier", label: "Courier", sort: (o) => d.meta[o.id]?.courier ?? "", render: (o) => d.meta[o.id]?.courier },
    { key: "trk", label: "Tracking", sort: (o) => d.meta[o.id]?.tracking ?? "", render: (o) => <span className="adm-mono">{d.meta[o.id]?.tracking}</span> },
    { key: "to", label: "Ship to", hideOnMobile: true, sort: (o) => o.address.country, csv: (o) => `${o.address.city}, ${o.address.country}`, render: (o) => `${o.address.city}, ${o.address.country}` },
    { key: "at", label: "Shipped", sort: (o) => d.meta[o.id]?.shippedAt ?? "", csv: (o) => d.meta[o.id]?.shippedAt ?? "", render: (o) => (d.meta[o.id]?.shippedAt ? fmtShort(d.meta[o.id]!.shippedAt!) : "") },
    { key: "st", label: "Status", sort: (o) => statusOf(o, d.meta[o.id]), render: (o) => <StatusBadge s={statusOf(o, d.meta[o.id])} /> },
    { key: "lb", label: "Label", csv: () => "", render: (o) => <Btn size="sm" variant="ghost" icon="print" onClick={() => printHtml(`Label ${o.id}`, labelHtml(o, d.meta[o.id]))}>Print</Btn> },
  ];
  return (
    <>
      <PageHeader back={{ href: "/admin/fulfilment", label: "Fulfilment" }} title="Shipments" sub="Every order that has a courier and tracking number." />
      <Toolbar placeholder="Search order, tracking or name">
        <FilterSelect param="courier" label="All couriers" options={couriers.map((c) => ({ value: c, label: c }))} />
      </Toolbar>
      <DataTable rows={rows} cols={cols} rowKey={(o) => o.id} exportName="shipments" defaultSort={{ key: "at", dir: "desc" }} emptyTitle="No shipments yet" emptyText="Create one from Fulfilment." />
    </>
  );
}
