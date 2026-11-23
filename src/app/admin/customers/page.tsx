"use client";

import Link from "next/link";
import { useMemo } from "react";
import DataTable, { FilterSelect, Toolbar, type Col } from "@/components/admin/DataTable";
import { Badge, PageHeader, money, useQ } from "@/components/admin/ui";
import { useAdmin } from "@/components/admin/AdminShell";
import { deriveCustomers, type Customer } from "@/lib/admin/customers";
import { fmtShort } from "@/lib/orders";

export default function Customers() {
  const { d } = useAdmin();
  const q = useQ();
  const term = q.get("q").toLowerCase();
  const country = q.get("country");
  const consent = q.get("consent");
  const all = useMemo(() => deriveCustomers(d), [d]);
  const rows = all.filter((c) => (!country || c.country === country) && (!consent || (consent === "yes" ? c.meta.consent.email : !c.meta.consent.email)) && (!term || `${c.name} ${c.contact} ${c.country}`.toLowerCase().includes(term)));
  const countries = Array.from(new Set(all.map((c) => c.country))).sort();

  const cols: Col<Customer>[] = [
    { key: "name", label: "Customer", sort: (c) => c.name, csv: (c) => c.name, render: (c) => (<div><Link href={`/admin/customers/${encodeURIComponent(c.id)}`} className="adm-link">{c.name}</Link><small>{c.contact}</small></div>) },
    { key: "country", label: "Country", sort: (c) => c.country, hideOnMobile: true, render: (c) => c.country },
    { key: "orders", label: "Orders", sort: (c) => c.orders.length, className: "r", render: (c) => c.orders.length },
    { key: "spent", label: "Total spent", sort: (c) => c.spent, className: "r", render: (c) => money(c.spent) },
    { key: "last", label: "Last order", sort: (c) => c.last ?? "", csv: (c) => c.last ?? "", render: (c) => (c.last ? fmtShort(c.last) : "None") },
    { key: "consent", label: "Marketing", sort: (c) => Number(c.meta.consent.email), csv: (c) => (c.meta.consent.email ? "email" : "none"), render: (c) => (c.meta.consent.email ? <Badge tone="green">Opted in</Badge> : <Badge>No consent</Badge>) },
  ];
  return (
    <>
      <PageHeader title="Customers" sub="Everyone who has placed an order, with their notes and consent." />
      <Toolbar placeholder="Search name, email or country">
        <FilterSelect param="country" label="All countries" options={countries.map((c) => ({ value: c, label: c }))} />
        <FilterSelect param="consent" label="Any consent" options={[{ value: "yes", label: "Email consent" }, { value: "no", label: "No email consent" }]} />
      </Toolbar>
      <DataTable rows={rows} cols={cols} rowKey={(c) => c.id} href={(c) => `/admin/customers/${encodeURIComponent(c.id)}`} exportName="customers" defaultSort={{ key: "last", dir: "desc" }} emptyTitle="No customers match" />
    </>
  );
}
