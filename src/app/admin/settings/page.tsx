"use client";

import { useState } from "react";
import { Btn, Card, Field, PageHeader, Tabs, Toggle, money, toNum, uid } from "@/components/admin/ui";
import { useAdmin } from "@/components/admin/AdminShell";
import { resetDemo } from "@/lib/admin/useAdminData";
import type { Settings, Zone } from "@/lib/admin/types";

type Tab = "zones" | "cod" | "returns" | "templates" | "data";

export default function SettingsPage() {
  const { d, set, log, toast, confirm } = useAdmin();
  const [s, setS] = useState<Settings>(d.settings);
  const [tab, setTab] = useState<Tab>("zones");
  const [dirty, setDirty] = useState(false);
  const up = (patch: Partial<Settings>) => { setS((x) => ({ ...x, ...patch })); setDirty(true); };
  const zone = (id: string, patch: Partial<Zone>) => up({ zones: s.zones.map((z) => (z.id === id ? { ...z, ...patch } : z)) });

  const save = () => {
    set("settings", s);
    log("Settings", tab, "Updated");
    setDirty(false);
    toast("Settings saved");
  };
  const reset = async () => {
    if (!(await confirm({ title: "Reset all demo data?", body: "Products, stock, collections, coupons, notes and the audit log return to the starting demo set, and the demo orders are reloaded. Orders you placed yourself on the store are kept.", label: "Reset demo data", danger: true }))) return;
    resetDemo();
    toast("Demo data reset");
  };

  return (
    <>
      <PageHeader title="Settings" sub="Owner only." />
      <Tabs<Tab> tabs={[{ id: "zones", label: "Shipping zones" }, { id: "cod", label: "Cash on delivery" }, { id: "returns", label: "Returns and refunds" }, { id: "templates", label: "Message templates" }, { id: "data", label: "Demo data" }]} value={tab} onChange={setTab} />

      {tab === "zones" && (
        <Card title="Shipping zones" actions={<Btn size="sm" variant="ghost" icon="plus" onClick={() => up({ zones: [...s.zones, { id: uid("z"), name: "New zone", countries: "", rate: 0, eta: "" }] })}>Add zone</Btn>}>
          <div className="adm-alert adm-alert--blue"><span>The store&apos;s bag and checkout read these rates in this browser. A zone matches a country by name; &ldquo;Rest of world&rdquo; catches the rest. The ₹2,500 rate outside India is a placeholder until you set real rates.</span></div>
          <div style={{ display: "grid", gap: 18 }}>
            {s.zones.map((z) => (
              <div key={z.id} className="adm-form" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", paddingBottom: 18, borderBottom: "1px solid var(--line)" }}>
                <Field label="Zone"><input className="adm-in" value={z.name} onChange={(e) => zone(z.id, { name: e.target.value })} /></Field>
                <Field label="Countries (comma separated)" wide><input className="adm-in" value={z.countries} onChange={(e) => zone(z.id, { countries: e.target.value })} /></Field>
                <Field label="Rate (₹)"><input className="adm-in" type="number" min={0} value={z.rate} onChange={(e) => zone(z.id, { rate: Number(toNum(e.target.value)) || 0 })} /></Field>
                <Field label="Delivery estimate"><input className="adm-in" value={z.eta} onChange={(e) => zone(z.id, { eta: e.target.value })} /></Field>
                <div style={{ display: "flex", alignItems: "end" }}><Btn size="sm" variant="danger" onClick={() => up({ zones: s.zones.filter((x) => x.id !== z.id) })}>Remove</Btn></div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "cod" && (
        <Card title="Cash on delivery">
          <div style={{ display: "grid", gap: 16, maxWidth: 520 }}>
            <Toggle checked={s.codEnabled} onChange={(v) => up({ codEnabled: v })} label="Offer cash on delivery (India only)" />
            <Field label="Maximum order value (₹)" hint="Orders above this must pay online."><input className="adm-in" type="number" min={0} value={s.codMax} onChange={(e) => up({ codMax: Number(toNum(e.target.value)) || 0 })} /></Field>
            <Field label="Eligible PIN codes" hint="Plain text for now. Serviceability checks come with the courier integration."><textarea className="adm-in" value={s.codPins} onChange={(e) => up({ codPins: e.target.value })} /></Field>
          </div>
        </Card>
      )}

      {tab === "returns" && (
        <Card title="Returns and refunds">
          <div style={{ display: "grid", gap: 16, maxWidth: 520 }}>
            <Field label="Return window (days)" hint="Shown to customers. The store still uses 7 days until it is connected to the backend."><input className="adm-in" type="number" min={0} value={s.returnWindow} onChange={(e) => up({ returnWindow: Number(toNum(e.target.value)) || 0 })} /></Field>
            <Field label="Refund limit before Owner approval (₹)" hint={`Refunds above ${money(s.refundLimit)} need the Owner role.`}><input className="adm-in" type="number" min={0} value={s.refundLimit} onChange={(e) => up({ refundLimit: Number(toNum(e.target.value)) || 0 })} /></Field>
            <Field label="Return reasons (one per line)"><textarea className="adm-in" style={{ minHeight: 130 }} value={s.returnReasons.join("\n")} onChange={(e) => up({ returnReasons: e.target.value.split("\n") })} /></Field>
          </div>
        </Card>
      )}

      {tab === "templates" && (
        <div style={{ display: "grid", gap: 16 }}>
          {s.templates.map((t) => (
            <Card key={t.id} title={t.name}>
              <div className="adm-form" style={{ gridTemplateColumns: "1fr" }}>
                <Field label="Subject"><input className="adm-in" value={t.subject} onChange={(e) => up({ templates: s.templates.map((x) => (x.id === t.id ? { ...x, subject: e.target.value } : x)) })} /></Field>
                <Field label="Message" hint="Placeholders such as {{order}} and {{name}} are filled in when emails are sent."><textarea className="adm-in" value={t.body} onChange={(e) => up({ templates: s.templates.map((x) => (x.id === t.id ? { ...x, body: e.target.value } : x)) })} /></Field>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "data" && (
        <Card title="Demo data">
          <p className="adm-sub" style={{ maxWidth: 560, marginBottom: 14 }}>Everything in the back office is stored in this browser. Resetting restores the starting demo set. It is the same data the storefront order pages read, so demo orders also show on the store&apos;s My orders page.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><Btn variant="danger" onClick={reset}>Reset demo data</Btn></div>
        </Card>
      )}

      {tab !== "data" && (
        <div className="adm-savebar">
          {dirty && <span className="adm-hint">You have unsaved changes.</span>}
          <span className="adm-grow" />
          <Btn onClick={save} disabled={!dirty}>Save settings</Btn>
        </div>
      )}
    </>
  );
}
