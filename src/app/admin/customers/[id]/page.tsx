"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Btn, Card, Empty, PageHeader, StatusBadge, Toggle, money } from "@/components/admin/ui";
import { useAdmin } from "@/components/admin/AdminShell";
import { customerBlank, deriveCustomers } from "@/lib/admin/customers";
import { statusOf, itemCount } from "@/lib/admin/orders";
import type { CustMeta } from "@/lib/admin/types";
import { fmtShort, fmtTime } from "@/lib/orders";

export default function CustomerProfile() {
  const { id } = useParams<{ id: string }>();
  const key = decodeURIComponent(id ?? "").toLowerCase();
  const { d, set, can, why, log, toast, confirm, session } = useAdmin();
  const router = useRouter();
  const c = useMemo(() => deriveCustomers(d).find((x) => x.id === key), [d, key]);
  const [note, setNote] = useState("");

  if (!c) return <Empty title="Customer not found" action={<Btn href="/admin/customers" variant="ghost">Back to customers</Btn>} />;

  const saveMeta = (fn: (m: CustMeta) => CustMeta) =>
    set("custMeta", (prev) => (prev.some((m) => m.id === c.id) ? prev.map((m) => (m.id === c.id ? fn(m) : m)) : [...prev, fn(c.meta)]));
  const setConsent = (k: "email" | "sms" | "whatsapp", v: boolean) => {
    saveMeta((m) => ({ ...m, consent: { ...m.consent, [k]: v, at: new Date().toISOString() } }));
    log("Customer", c.id, `Consent ${k} ${v ? "on" : "off"}`);
    toast("Consent updated");
  };
  const addNote = () => {
    if (!note.trim()) return;
    saveMeta((m) => ({ ...m, notes: [{ at: new Date().toISOString(), by: session.name, text: note.trim() }, ...m.notes] }));
    log("Customer", c.id, "Note added");
    setNote("");
  };
  const exportData = () => {
    const blob = new Blob([JSON.stringify({ customer: c.meta, orders: c.orders }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `customer-${c.id.replace(/[^a-z0-9]+/g, "-")}.json`;
    a.click();
    log("Customer", c.id, "Data exported");
  };
  const erase = async () => {
    if (!(await confirm({ title: `Erase ${c.name}'s personal data?`, body: "Name, email and address are removed from their orders and notes. Order totals stay for the accounts. This cannot be undone.", label: "Erase data", danger: true }))) return;
    const tag = `erased-${Math.random().toString(36).slice(2, 8)}@removed.invalid`;
    set("orders", (prev) => prev.map((o) => (o.contact.toLowerCase() === c.id ? { ...o, contact: tag, address: { ...o.address, name: "Erased customer", line1: "", area: "", phone: "" } } : o)));
    set("custMeta", (prev) => prev.filter((m) => m.id !== c.id));
    log("Customer", c.id, "Personal data erased");
    toast("Personal data erased");
    router.replace("/admin/customers");
  };

  const addresses = Array.from(new Map(c.orders.map((o) => [`${o.address.line1}|${o.address.pin}`, o.address])).values());
  const m = c.meta ?? customerBlank(c.id, c.name, c.country);

  return (
    <>
      <PageHeader
        back={{ href: "/admin/customers", label: "Customers" }}
        title={c.name}
        sub={`${c.contact} · ${c.country}`}
        actions={<>
          <Btn variant="ghost" icon="download" disabled={!can("export_customer")} title={why("export_customer")} onClick={exportData}>Export data</Btn>
          <Btn variant="danger" icon="trash" disabled={!can("delete")} title={why("delete")} onClick={erase}>Erase on request</Btn>
        </>}
      />
      <div className="adm-stats">
        <div className="adm-stat"><span className="adm-stat-l">Orders</span><span className="adm-stat-v">{c.orders.length}</span></div>
        <div className="adm-stat"><span className="adm-stat-l">Lifetime value</span><span className="adm-stat-v">{money(c.spent)}</span></div>
        <div className="adm-stat"><span className="adm-stat-l">Last order</span><span className="adm-stat-v" style={{ fontSize: "1.2rem" }}>{c.last ? fmtShort(c.last) : "None"}</span></div>
      </div>
      <div className="adm-cols">
        <div>
          <Card title="Order history" pad={false}>
            {c.orders.length === 0 ? <p className="adm-card-b adm-sub">No orders yet.</p> : (
              <ul className="adm-list">
                {c.orders.map((o) => (
                  <li key={o.id}>
                    <div><Link href={`/admin/orders/${o.id}`} className="adm-link">{o.id}</Link><small>{fmtShort(o.placedAt)} · {itemCount(o)} items</small></div>
                    <b style={{ fontWeight: 500 }}>{money(o.total)}</b>
                    <StatusBadge s={statusOf(o, d.meta[o.id])} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Notes">
            <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
              <textarea className="adm-in" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Visible to staff only" aria-label="New note" />
              <div><Btn size="sm" disabled={!note.trim()} onClick={addNote}>Add note</Btn></div>
            </div>
            {m.notes.length === 0 && <p className="adm-sub">No notes yet.</p>}
            {m.notes.map((n, i) => <div key={n.at + i} className="adm-note">{n.text}<small>{n.by} · {fmtTime(n.at)}</small></div>)}
          </Card>
        </div>
        <div>
          <Card title="Marketing consent">
            <div style={{ display: "grid", gap: 12 }}>
              <Toggle checked={m.consent.email} onChange={(v) => setConsent("email", v)} label="Email" />
              <Toggle checked={m.consent.sms} onChange={(v) => setConsent("sms", v)} label="SMS" />
              <Toggle checked={m.consent.whatsapp} onChange={(v) => setConsent("whatsapp", v)} label="WhatsApp" />
              <p className="adm-hint">{m.consent.at ? `Last changed ${fmtShort(m.consent.at)}` : "No consent recorded."} Opt-outs apply within 24 hours.</p>
            </div>
          </Card>
          <Card title="Addresses">
            {addresses.length === 0 && <p className="adm-sub">None saved.</p>}
            {addresses.map((a, i) => <p key={i} style={{ marginBottom: 10 }}>{a.name}<br />{a.line1}{a.area ? `, ${a.area}` : ""}<br />{a.city}, {a.state} {a.pin}<br />{a.country}</p>)}
          </Card>
        </div>
      </div>
    </>
  );
}