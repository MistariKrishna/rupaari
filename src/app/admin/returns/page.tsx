"use client";

import Link from "next/link";
import { useMemo } from "react";
import DataTable, { FilterSelect, Toolbar, type Col } from "@/components/admin/DataTable";
import { PageHeader, StatusBadge, Thumb, money, useQ } from "@/components/admin/ui";
import { useAdmin } from "@/components/admin/AdminShell";
import { itemKey, fmtShort, type Order, type OrderItem } from "@/lib/orders";
import { retId } from "@/lib/admin/orders";

interface Row { key: string; o: Order; it: OrderItem; status: string; reason: string; at: string }

export default function Returns() {
  const { d } = useAdmin();
  const q = useQ();
  const term = q.get("q").toLowerCase();
  const [status, reason] = [q.get("status"), q.get("reason")];

  const all = useMemo<Row[]>(() => {
    const out: Row[] = [];
    d.orders.forEach((o) => {
      o.items.forEach((it) => it.return && out.push({ key: retId(o, it), o, it, status: it.return.status, reason: it.return.reason, at: it.return.requestedAt }));
      (d.meta[o.id]?.rejectedReturns ?? []).forEach((r) => {
        const it = o.items.find((i) => itemKey(i) === r.itemKey);
        if (it) out.push({ key: retId(o, it), o, it, status: "rejected", reason: r.reason, at: r.at });
      });
    });
    return out.sort((a, b) => b.at.localeCompare(a.at));
  }, [d.orders, d.meta]);

  const rows = all.filter((r) => (!status || r.status === status) && (!reason || r.reason === reason) && (!term || `${r.o.id} ${r.o.address.name} ${r.o.contact} ${r.it.name}`.toLowerCase().includes(term)));
  const reasons = Array.from(new Set(all.map((r) => r.reason)));

  const cols: Col<Row>[] = [
    { key: "no", label: "Return", sort: (r) => r.o.id, csv: (r) => `RT-${r.o.id.slice(3)}`, render: (r) => <Link href={`/admin/returns/${r.key}`} className="adm-link">RT-{r.o.id.slice(3)}</Link> },
    { key: "item", label: "Item", sort: (r) => r.it.name, render: (r) => (<div className="adm-cell-main"><Thumb tone={r.it.tone} /><div><b>{r.it.name}</b><small>{r.o.id}{r.it.size ? ` · Size ${r.it.size}` : ""}</small></div></div>) },
    { key: "cust", label: "Customer", hideOnMobile: true, sort: (r) => r.o.address.name, render: (r) => r.o.address.name },
    { key: "reason", label: "Reason", sort: (r) => r.reason, render: (r) => r.reason },
    { key: "amt", label: "Value", sort: (r) => r.it.price * r.it.qty, className: "r", render: (r) => money(r.it.price * r.it.qty) },
    { key: "at", label: "Requested", sort: (r) => r.at, csv: (r) => r.at, render: (r) => fmtShort(r.at) },
    { key: "st", label: "Status", sort: (r) => r.status, render: (r) => <StatusBadge s={r.status} label={r.status.replace("-", " ")} /> },
  ];
  return (
    <>
      <PageHeader title="Returns" sub="Requests customers send from their order page." />
      <Toolbar placeholder="Search order, customer or item">
        <FilterSelect param="status" label="All statuses" options={["requested", "approved", "picked-up", "received", "refunded", "rejected"].map((s) => ({ value: s, label: s.replace("-", " ") }))} />
        <FilterSelect param="reason" label="All reasons" options={reasons.map((s) => ({ value: s, label: s }))} />
      </Toolbar>
      <DataTable rows={rows} cols={cols} rowKey={(r) => r.key} href={(r) => `/admin/returns/${r.key}`} exportName="returns" defaultSort={{ key: "at", dir: "desc" }} emptyTitle="No returns" emptyText="Nothing matches. Seeded demo returns appear for orders delivered in the last weeks." />
    </>
  );
}
