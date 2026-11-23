"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isPassword, resetPassword } from "@/lib/auth";
import { DEMO, sendCode, verifyCode } from "@/lib/checkout";
import { guessCountry } from "@/lib/countries";
import { emptyIdent, identValue, idNoun, maskId, type Ident } from "@/lib/identity";
import AuthShell from "./AuthShell";
import { IdentField, PasswordField } from "./AuthFields";
import { Icon } from "./Icon";
import OtpBoxes from "./OtpBoxes";

export default function ForgotForm() {
  const [step, setStep] = useState<"phone" | "code" | "done">("phone");
  const [ident, setIdent] = useState<Ident>(emptyIdent());
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => setIdent((i) => ({ ...i, dial: guessCountry().dial })), []);
  const id = identValue(ident);

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!id) return setErr(ident.mode === "email" ? "Enter a valid email address." : "Enter a valid mobile number.");
    setBusy(true);
    setErr("");
    const r = await sendCode(id);
    setBusy(false);
    if (!r.ok) return setErr(r.message ?? "Couldn't send the code.");
    setCode(["", "", "", "", "", ""]);
    setStep("code");
  };
  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.every(Boolean)) return setErr("Enter the 6-digit code.");
    if (!isPassword(pw)) return setErr("Use at least 8 characters for your new password.");
    setBusy(true);
    setErr("");
    const v = await verifyCode(code.join(""));
    if (!v.ok) {
      setBusy(false);
      return setErr(v.message ?? "That code didn't work.");
    }
    const r = await resetPassword(id, pw);
    setBusy(false);
    if (!r.ok) return setErr(r.message ?? "We couldn't update your password.");
    setStep("done");
  };

  return (
    <AuthShell
      eyebrow="Account · 03"
      title={step === "done" ? "All Set." : "Reset Password."}
      lead={step === "done" ? "Your password has been updated. You can sign in with it now." : "Enter your email or mobile number and we’ll send a code to set a new password."}
      foot={
        <p className="au-new">
          Remembered it? <Link href="/login" className="au-cta">Back to sign in <Icon name="arrow-right" /></Link>
        </p>
      }
    >
      {step === "phone" && (
        <form className="au-fields" onSubmit={send} noValidate>
          <IdentField id="fp-id" ident={ident} onChange={(i) => { setIdent(i); setErr(""); }} invalid={!!err && !id} />
          {err && <p className="rp-err" role="alert"><Icon name="warning" />{err}</p>}
          <button type="submit" className="btn au-btn" disabled={busy || !id}>{busy ? "Sending…" : "Send code"}</button>
        </form>
      )}
      {step === "code" && (
        <form className="au-fields" onSubmit={reset} noValidate>
          <p className="ck-sent">If an account exists for {maskId(id)}, a code is on its way. <button type="button" className="rp-link" onClick={() => setStep("phone")}>Change {idNoun(id)}</button></p>
          <OtpBoxes value={code} onChange={(v) => { setCode(v); setErr(""); }} />
          <PasswordField id="fp-pw" label="New Password" placeholder="At least 8 characters" autoComplete="new-password" value={pw} onChange={(v) => { setPw(v); setErr(""); }} />
          <button type="button" className="rp-link" onClick={() => send()} disabled={busy}>Resend code</button>
          {err && <p className="rp-err" role="alert"><Icon name="warning" />{err}</p>}
          <button type="submit" className="btn au-btn" disabled={busy}>{busy ? "Updating…" : "Update password"}</button>
          {DEMO && <p className="au-demo">Demo: any 6-digit code works.</p>}
        </form>
      )}
      {step === "done" && (
        <div className="au-fields">
          <p className="ck-ver" role="status"><Icon name="check" /> Password updated</p>
          <Link href="/login" className="btn au-btn">Sign in <Icon name="arrow-right" /></Link>
        </div>
      )}
    </AuthShell>
  );
}