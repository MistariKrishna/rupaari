"use client";

import Link from "next/link";
import { useMemo } from "react";
import DataTable, { FilterSelect, Toolbar, type Col } from "@/components/admin/DataTable";
import { Btn, PageHeader, StatusBadge, Thumb, money, useQ } from "@/components/admin/ui";
import { useAdmin } from "@/components/admin/AdminShell";
import { itemCount, payStatus, STATUS_FILTERS, statusOf } from "@/lib/admin/orders";
import { fmtShort, type Order } from "@/lib/orders";

export default function OrdersPage() {
  const { d } = useAdmin();
  const q = useQ();
  const term = q.get("q").toLowerCase();
  const [status, pay, country, from, to] = [q.get("status"), q.get("pay"), q.get("country"), q.get("from"), q.get("to")];

  const countries = useMemo(() => Array.from(new Set(d.orders.map((o) => o.address.country))).sort(), [d.orders]);
  const rows = useMemo(
    () =>
      d.orders.filter((o) => {
        const m = d.meta[o.id];
        if (status && statusOf(o, m) !== status) return false;
        if (pay && payStatus(o, m) !== pay) return false;
        if (country && o.address.country !== country) return false;
        const t = new Date(o.placedAt).toISOString().slice(0, 10);
        if (from && t < from) return false;
        if (to && t > to) return false;
        if (term && !`${o.id} ${o.contact} ${o.address.name} ${o.address.city}`.toLowerCase().includes(term)) return false;
        return true;
      }),
    [d.orders, d.meta, status, pay, country, from, to, term],
  );

  const cols: Col<Order>[] = [
    { key: "id", label: "Order", sort: (o) => parseInt(o.id.replace(/\D/g, ""), 10), csv: (o) => o.id, render: (o) => (<div className="adm-cell-main"><Thumb tone={o.items[0]?.tone} /><div><Link href={`/admin/orders/${o.id}`} className="adm-link">{o.id}</Link><small>{fmtShort(o.placedAt)}</small></div></div>) },
    { key: "cust", label: "Customer", sort: (o) => o.address.name, csv: (o) => `${o.address.name} <${o.contact}>`, render: (o) => (<div><b style={{ fontWeight: 500 }}>{o.address.name}</b><small>{o.contact}</small></div>) },
    { key: "items", label: "Items", sort: itemCount, hideOnMobile: true, render: (o) => itemCount(o), className: "r" },
    { key: "total", label: "Total", sort: (o) => o.total, render: (o) => money(o.total), className: "r" },
    { key: "pay", label: "Payment", sort: (o) => payStatus(o, d.meta[o.id]), render: (o) => <StatusBadge s={payStatus(o, d.meta[o.id])} /> },
    { key: "status", label: "Status", sort: (o) => statusOf(o, d.meta[o.id]), render: (o) => <StatusBadge s={statusOf(o, d.meta[o.id])} /> },
    { key: "where", label: "Ship to", sort: (o) => o.address.country, hideOnMobile: true, csv: (o) => `${o.address.city}, ${o.address.country}`, render: (o) => `${o.address.city}, ${o.address.country}` },
  ];

  return (
    <>
      <PageHeader title="Orders" sub="Orders placed on the store appear here as soon as they are saved." actions={<Btn href="/admin/orders/new" icon="plus">Manual order</Btn>} />
      <Toolbar placeholder="Search order, name, email or city">
        <FilterSelect param="status" label="All statuses" options={STATUS_FILTERS.map((s) => ({ value: s, label: s }))} />
        <FilterSelect param="pay" label="All payments" options={["Paid", "COD pending", "COD collected", "Refund due", "Refunded"].map((s) => ({ value: s, label: s }))} />
        <FilterSelect param="country" label="All countries" options={countries.map((c) => ({ value: c, label: c }))} />
        <label className="adm-fsel" style={{ flex: "0 1 150px" }}><span className="adm-sr">From date</span><input type="date" className="adm-in" value={from} onChange={(e) => q.set({ from: e.target.value || undefined })} aria-label="From date" /></label>
        <label className="adm-fsel" style={{ flex: "0 1 150px" }}><span className="adm-sr">To date</span><input type="date" className="adm-in" value={to} onChange={(e) => q.set({ to: e.target.value || undefined })} aria-label="To date" /></label>
      </Toolbar>
      <DataTable rows={rows} cols={cols} rowKey={(o) => o.id} href={(o) => `/admin/orders/${o.id}`} exportName="orders" defaultSort={{ key: "id", dir: "desc" }} emptyTitle="No orders match" emptyText="Try clearing a filter." />
    </>
  );
}
