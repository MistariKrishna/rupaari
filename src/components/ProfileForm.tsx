"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { loadAddresses, upsertAddress } from "@/lib/addresses";
import { changePassword, getProfile, hasPassword, updateProfile } from "@/lib/auth";
import { checkPin } from "@/lib/checkout";
import { COUNTRIES } from "@/lib/countries";
import { isEmail, isLocalPhone, maskId } from "@/lib/identity";
import { getSavedAddress, saveAddress, type Address } from "@/lib/orders";
import Crumbs from "./Crumbs";
import { Icon } from "./Icon";
import { useSession } from "./useSession";

const blank: Address = { name: "", line1: "", area: "", pin: "", city: "", state: "", country: "India", phone: "" };
type Msg = { ok: boolean; text: string } | null;

function Note({ m }: { m: Msg }) {
  return m ? <p className={m.ok ? "pf-ok" : "tk-err"} role={m.ok ? "status" : "alert"}>{m.text}</p> : null;
}

export default function ProfileForm() {
  const { user, ready } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [alt, setAlt] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [addr, setAddr] = useState<Address>(blank);
  const [m1, setM1] = useState<Msg>(null);
  const [m2, setM2] = useState<Msg>(null);
  const [m3, setM3] = useState<Msg>(null);
  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [again, setAgain] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/login?next=/account/profile");
  }, [ready, user, router]);
  useEffect(() => {
    if (!user) return;
    const p = getProfile(user.id);
    setName(user.name);
    setAlt(p.altContact ?? "");
    setDob(p.dob ?? "");
    setGender(p.gender ?? "");
    const book = loadAddresses(user.id);
    setAddr(book.find((a) => a.isDefault) ?? getSavedAddress() ?? { ...blank, name: user.name });
  }, [user]);

  if (!user) return <div className="rp-page" />;
  const byEmail = user.id.includes("@");
  const setA = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setAddr((a) => ({ ...a, [k]: e.target.value }));

  const saveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const a = alt.trim();
    if (a && (byEmail ? !isLocalPhone(a.replace(/[^\d]/g, "")) : !isEmail(a))) return setM1({ ok: false, text: byEmail ? "Enter a valid mobile number." : "Enter a valid email address." });
    const r = updateProfile(user.id, name, { altContact: a, dob, gender });
    setM1(r.ok ? { ok: true, text: "Your details are saved." } : { ok: false, text: r.message ?? "Could not save." });
  };
  const saveAddr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addr.name.trim() || !addr.line1.trim() || !addr.city.trim() || !addr.state.trim()) return setM2({ ok: false, text: "Fill in name, address, city and state." });
    if (checkPin(addr.country, addr.pin) !== "ok") return setM2({ ok: false, text: "Check the PIN or postal code." });
    saveAddress(addr);
    upsertAddress(user.id, { ...addr, makeDefault: true });
    setM2({ ok: true, text: "Your default delivery address is saved. It will be filled in at checkout." });
  };
  const savePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nw !== again) return setM3({ ok: false, text: "The new passwords do not match." });
    setBusy(true);
    const r = await changePassword(user.id, cur, nw);
    setBusy(false);
    setM3(r.ok ? { ok: true, text: "Your password is changed." } : { ok: false, text: r.message ?? "Could not change the password." });
    if (r.ok) { setCur(""); setNw(""); setAgain(""); }
  };

  return (
    <div className="rp-page">
      <div className="rp-wrap">
        <Crumbs items={[{ label: "Home", href: "/" }, { label: "Account", href: "/account" }, { label: "My profile" }]} />
        <h1 className="rp-title">My profile</h1>

        <div className="pf-top rp-card">
          <span className="pf-av" aria-hidden="true">{(user.name || "?").trim().charAt(0).toUpperCase()}</span>
          <div>
            <h2>{user.name}</h2>
            <p>{byEmail ? "Email" : "Mobile"}: {maskId(user.id)}</p>
          </div>
        </div>

        <div className="pf-grid">
          <form className="rp-card pf-card" onSubmit={saveDetails} noValidate>
            <h2 className="rp-h3">Personal details</h2>
            <div className="rp-field"><label htmlFor="pf-n">Full name</label><input id="pf-n" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="rp-field">
              <label htmlFor="pf-id">{byEmail ? "Email (your sign-in)" : "Mobile number (your sign-in)"}</label>
              <input id="pf-id" value={user.id} readOnly aria-readonly="true" />
              <p className="rp-hint">The sign-in can&apos;t be changed here because your orders are linked to it.</p>
            </div>
            <div className="rp-field">
              <label htmlFor="pf-a">{byEmail ? "Mobile number (optional)" : "Email (optional)"}</label>
              <input id="pf-a" inputMode={byEmail ? "tel" : "email"} placeholder={byEmail ? "+91 98765 43210" : "you@example.com"} value={alt} onChange={(e) => setAlt(e.target.value)} />
            </div>
            <div className="pf-two">
              <div className="rp-field"><label htmlFor="pf-d">Date of birth (optional)</label><input id="pf-d" type="date" max={new Date().toISOString().slice(0, 10)} value={dob} onChange={(e) => setDob(e.target.value)} /></div>
              <div className="rp-field">
                <label htmlFor="pf-g">Gender (optional)</label>
                <div className="rp-select">
                  <select id="pf-g" value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="">Prefer not to say</option><option>Female</option><option>Male</option><option>Other</option>
                  </select>
                  <Icon name="chevron-down" />
                </div>
              </div>
            </div>
            <Note m={m1} />
            <button type="submit" className="btn">Save details</button>
          </form>

          <form className="rp-card pf-card" onSubmit={saveAddr} noValidate>
            <h2 className="rp-h3">Delivery address</h2>
            <div className="rp-field"><label htmlFor="pa-n">Full name</label><input id="pa-n" autoComplete="name" value={addr.name} onChange={setA("name")} /></div>
            <div className="rp-field"><label htmlFor="pa-1">House / flat and street</label><input id="pa-1" autoComplete="address-line1" value={addr.line1} onChange={setA("line1")} /></div>
            <div className="rp-field"><label htmlFor="pa-2">Area or landmark (optional)</label><input id="pa-2" autoComplete="address-line2" value={addr.area} onChange={setA("area")} /></div>
            <div className="pf-two">
              <div className="rp-field"><label htmlFor="pa-c">City</label><input id="pa-c" autoComplete="address-level2" value={addr.city} onChange={setA("city")} /></div>
              <div className="rp-field"><label htmlFor="pa-s">State</label><input id="pa-s" autoComplete="address-level1" value={addr.state} onChange={setA("state")} /></div>
            </div>
            <div className="pf-two">
              <div className="rp-field"><label htmlFor="pa-p">PIN / postal code</label><input id="pa-p" autoComplete="postal-code" value={addr.pin} onChange={setA("pin")} /></div>
              <div className="rp-field"><label htmlFor="pa-ph">Phone (for the courier)</label><input id="pa-ph" inputMode="tel" autoComplete="tel" value={addr.phone ?? ""} onChange={setA("phone")} /></div>
            </div>
            <div className="rp-field">
              <label htmlFor="pa-k">Country / Region</label>
              <div className="rp-select">
                <select id="pa-k" autoComplete="country-name" value={addr.country} onChange={setA("country")}>{COUNTRIES.map((c) => <option key={c.code}>{c.name}</option>)}</select>
                <Icon name="chevron-down" />
              </div>
            </div>
            <Note m={m2} />
            <button type="submit" className="btn">Save address</button>
          </form>

          {hasPassword(user.id) && (
            <form className="rp-card pf-card" onSubmit={savePass} noValidate>
              <h2 className="rp-h3">Change password</h2>
              <div className="rp-field"><label htmlFor="pw-c">Current password</label><input id="pw-c" type="password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} /></div>
              <div className="rp-field"><label htmlFor="pw-n">New password</label><input id="pw-n" type="password" autoComplete="new-password" value={nw} onChange={(e) => setNw(e.target.value)} /><p className="rp-hint">At least 8 characters.</p></div>
              <div className="rp-field"><label htmlFor="pw-r">Confirm new password</label><input id="pw-r" type="password" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} /></div>
              <Note m={m3} />
              <button type="submit" className="btn" disabled={busy}>{busy ? "Saving…" : "Change password"}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
