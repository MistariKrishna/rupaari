"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { checkPin } from "@/lib/checkout";
import { COUNTRIES } from "@/lib/countries";
import { addressEvent, loadAddresses, removeAddress, setDefaultAddress, upsertAddress, type SavedAddress } from "@/lib/addresses";
import Crumbs from "./Crumbs";
import { Icon } from "./Icon";
import { useSession } from "./useSession";

const blank = { name: "", line1: "", area: "", pin: "", city: "", state: "", country: "India", phone: "" };
const LABELS = ["Home", "Work", "Other"];

export default function AddressBook() {
  const { user, ready } = useSession();
  const router = useRouter();
  const [list, setList] = useState<SavedAddress[]>([]);
  const [form, setForm] = useState<(typeof blank & { id?: string; label: string; makeDefault: boolean }) | null>(null);
  const [err, setErr] = useState("");

  const refresh = useCallback(() => { if (user) setList(loadAddresses(user.id)); }, [user]);
  useEffect(() => { if (ready && !user) router.replace("/login?next=/account/addresses"); }, [ready, user, router]);
  useEffect(() => {
    refresh();
    window.addEventListener(addressEvent, refresh);
    return () => window.removeEventListener(addressEvent, refresh);
  }, [refresh]);
  if (!user) return <div className="rp-page" />;

  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => (f ? { ...f, [k]: k === "pin" && f.country === "India" ? e.target.value.replace(/\D/g, "").slice(0, 6) : e.target.value } : f));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    if (!form.name.trim() || !form.line1.trim() || !form.city.trim() || !form.state.trim()) return setErr("Fill in name, address, city and state.");
    if (checkPin(form.country, form.pin) !== "ok") return setErr("Check the PIN or postal code.");
    upsertAddress(user.id, form);
    setForm(null);
    setErr("");
  };

  return (
    <div className="rp-page">
      <div className="rp-wrap">
        <Crumbs items={[{ label: "Home", href: "/" }, { label: "Account", href: "/account" }, { label: "Addresses" }]} />
        <h1 className="rp-title">My addresses</h1>
        <p className="od-lead">Choose one at checkout. Your default is filled in for you.</p>

        {!form && (
          <>
            <div className="ab-grid">
              {list.map((a) => (
                <article key={a.id} className="rp-card ab-card">
                  <header><b>{a.label}</b>{a.isDefault && <span className="rp-badge rp-badge--dot"><i aria-hidden="true" />Default</span>}</header>
                  <address>{a.name}<br />{[a.line1, a.area].filter(Boolean).join(", ")}<br />{a.city}, {a.state} {a.pin}<br />{a.country}{a.phone ? <><br />{a.phone}</> : null}</address>
                  <div className="ab-acts">
                    <button type="button" className="rp-link" onClick={() => setForm({ ...blank, ...a, phone: a.phone ?? "", id: a.id, label: a.label, makeDefault: a.isDefault })}>Edit</button>
                    {!a.isDefault && <button type="button" className="rp-link" onClick={() => setDefaultAddress(user.id, a.id)}>Make default</button>}
                    <button type="button" className="rp-link" onClick={() => removeAddress(user.id, a.id)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
            {list.length === 0 && <p>You have no saved addresses yet.</p>}
            <button type="button" className="btn" onClick={() => { setErr(""); setForm({ ...blank, name: user.name, label: list.length ? "Other" : "Home", makeDefault: list.length === 0 }); }}>Add a new address</button>
          </>
        )}

        {form && (
          <form className="rp-card pf-card ab-form" onSubmit={save} noValidate>
            <h2 className="rp-h3">{form.id ? "Edit address" : "New address"}</h2>
            <div className="wl-int">
              {LABELS.map((l) => (
                <label key={l} className="wl-chip" data-on={form.label === l}><input type="radio" name="ab-l" checked={form.label === l} onChange={() => setForm({ ...form, label: l })} />{l}</label>
              ))}
            </div>
            <div className="rp-field"><label htmlFor="ab-n">Full name</label><input id="ab-n" autoComplete="name" value={form.name} onChange={set("name")} /></div>
            <div className="rp-field"><label htmlFor="ab-1">House / flat and street</label><input id="ab-1" autoComplete="address-line1" value={form.line1} onChange={set("line1")} /></div>
            <div className="rp-field"><label htmlFor="ab-2">Area or landmark (optional)</label><input id="ab-2" value={form.area} onChange={set("area")} /></div>
            <div className="pf-two">
              <div className="rp-field"><label htmlFor="ab-c">City</label><input id="ab-c" autoComplete="address-level2" value={form.city} onChange={set("city")} /></div>
              <div className="rp-field"><label htmlFor="ab-s">State</label><input id="ab-s" autoComplete="address-level1" value={form.state} onChange={set("state")} /></div>
            </div>
            <div className="pf-two">
              <div className="rp-field"><label htmlFor="ab-p">PIN / postal code</label><input id="ab-p" autoComplete="postal-code" value={form.pin} onChange={set("pin")} /></div>
              <div className="rp-field"><label htmlFor="ab-ph">Phone (for the courier)</label><input id="ab-ph" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} /></div>
            </div>
            <div className="rp-field">
              <label htmlFor="ab-k">Country / Region</label>
              <div className="rp-select"><select id="ab-k" value={form.country} onChange={set("country")}>{COUNTRIES.map((c) => <option key={c.code}>{c.name}</option>)}</select><Icon name="chevron-down" /></div>
            </div>
            <label className="wl-consent"><input type="checkbox" checked={form.makeDefault} onChange={(e) => setForm({ ...form, makeDefault: e.target.checked })} /> Make this my default address</label>
            {err && <p className="tk-err" role="alert">{err}</p>}
            <div className="ab-acts"><button type="submit" className="btn">Save address</button><button type="button" className="btn btn-secondary" onClick={() => { setForm(null); setErr(""); }}>Cancel</button></div>
          </form>
        )}
      </div>
    </div>
  );
}
