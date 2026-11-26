"use client";

import { AppleIcon, FacebookRoundIcon, GoogleIcon } from "./BrandIcon";
import { useState } from "react";
import { COUNTRIES } from "@/lib/countries";
import type { Provider } from "@/lib/auth";
import type { Ident } from "@/lib/identity";

/** Dialling-code picker + number. Shared by every "mobile number" field. */
export function DialPhone({ id, dial, phone, onDial, onPhone, invalid }: { id: string; dial: string; phone: string; onDial: (v: string) => void; onPhone: (v: string) => void; invalid?: boolean }) {
  const dials = Array.from(new Set(COUNTRIES.map((c) => c.dial)));
  return (
    <div className="au-phone" data-invalid={invalid}>
      <select aria-label="Country code" value={dial} onChange={(e) => onDial(e.target.value)}>
        {dials.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <input id={id} inputMode="tel" autoComplete="tel-national" placeholder="Mobile number" value={phone} aria-invalid={invalid} onChange={(e) => onPhone(e.target.value.replace(/\D/g, "").slice(0, 14))} />
    </div>
  );
}

/** Email by default, with a link to use a mobile number instead. */
export function IdentField({ id = "au-id", ident, onChange, invalid, hint }: { id?: string; ident: Ident; onChange: (i: Ident) => void; invalid?: boolean; hint?: string }) {
  const email = ident.mode === "email";
  return (
    <div className="rp-field" data-invalid={invalid}>
      <label htmlFor={id}>{email ? "Email" : "Mobile Number"}</label>
      {email ? (
        <input id={id} type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" value={ident.email} aria-invalid={invalid} onChange={(e) => onChange({ ...ident, email: e.target.value })} />
      ) : (
        <DialPhone id={id} dial={ident.dial} phone={ident.phone} invalid={invalid} onDial={(dial) => onChange({ ...ident, dial })} onPhone={(phone) => onChange({ ...ident, phone })} />
      )}
      {hint && <p className="rp-hint">{hint}</p>}
      <button type="button" className="au-switch" onClick={() => onChange({ ...ident, mode: email ? "phone" : "email" })}>
        {email ? "Use mobile number instead" : "Use email instead"}
      </button>
    </div>
  );
}

export function PasswordField({ id = "au-pw", value, onChange, label = "Password", placeholder = "Enter your password", autoComplete = "current-password", invalid }: { id?: string; value: string; onChange: (v: string) => void; label?: string; placeholder?: string; autoComplete?: string; invalid?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="rp-field" data-invalid={invalid}>
      <label htmlFor={id}>{label}</label>
      <div className="au-pw">
        <input id={id} type={show ? "text" : "password"} autoComplete={autoComplete} placeholder={placeholder} value={value} aria-invalid={invalid} onChange={(e) => onChange(e.target.value)} />
        <button type="button" onClick={() => setShow((v) => !v)} aria-pressed={show} aria-label={show ? "Hide password" : "Show password"}>{show ? "Hide" : "Show"}</button>
      </div>
    </div>
  );
}

const MARK = { google: GoogleIcon, apple: AppleIcon, facebook: FacebookRoundIcon } as const;
const PROVIDERS: { key: Provider; label: string }[] = [
  { key: "google", label: "Google" },
  { key: "apple", label: "Apple" },
  { key: "facebook", label: "Facebook" },
];

/** "OR" divider followed by Google / Apple / Facebook. */
export function SocialRow({ onPick, busy, verb = "Continue" }: { onPick: (p: Provider) => void; busy?: boolean; verb?: string }) {
  return (
    <>
      <p className="au-or"><span>or</span></p>
      <div className="au-social" role="group" aria-label={`${verb} with`}>
        {PROVIDERS.map((p) => (
          <button key={p.key} type="button" className="btn btn-secondary au-btn" disabled={busy} onClick={() => onPick(p.key)} aria-label={`${verb} with ${p.label}`}>
            {(() => { const Mark = MARK[p.key]; return <Mark className="au-mark" />; })()}
            <span>{p.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
