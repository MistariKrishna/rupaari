"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createAccount, idTaken, isPassword, safeNext, signInWithProvider, type Provider } from "@/lib/auth";
import { DEMO, sendCode, verifyCode } from "@/lib/checkout";
import { guessCountry } from "@/lib/countries";
import { emptyIdent, identValue, idNoun, maskId, type Ident } from "@/lib/identity";
import AuthShell from "./AuthShell";
import { IdentField, PasswordField, SocialRow } from "./AuthFields";
import { Icon } from "./Icon";
import OtpBoxes from "./OtpBoxes";
import { useSession } from "./useSession";

export default function SignupForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const { user, ready } = useSession();

  const [name, setName] = useState("");
  const [ident, setIdent] = useState<Ident>(emptyIdent());
  const [pw, setPw] = useState("");
  const [agree, setAgree] = useState(false);
  const [step, setStep] = useState<"details" | "code">("details");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => setIdent((i) => ({ ...i, dial: guessCountry().dial })), []);
  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, next, router]);

  const id = identValue(ident);
  const details = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setErr("Enter your full name.");
    if (!id) return setErr(ident.mode === "email" ? "Enter a valid email address." : "Enter a valid mobile number.");
    if (!isPassword(pw)) return setErr("Use at least 8 characters for your password.");
    if (!agree) return setErr("Please accept the Terms and Privacy Policy to continue.");
    if (idTaken(id)) return setErr("An account with these details already exists. Try signing in.");
    setBusy(true);
    setErr("");
    const r = await sendCode(id);
    setBusy(false);
    if (!r.ok) return setErr(r.message ?? "Couldn't send the code.");
    setCode(["", "", "", "", "", ""]);
    setStep("code");
  };
  const verify = async () => {
    setBusy(true);
    setErr("");
    const v = await verifyCode(code.join(""));
    if (!v.ok) {
      setBusy(false);
      return setErr(v.message ?? "That code didn't work.");
    }
    const r = await createAccount(name.trim(), id, pw);
    setBusy(false);
    if (!r.ok) return setErr(r.message ?? "We couldn't create your account.");
    router.replace(next);
  };
  const social = async (p: Provider) => {
    setBusy(true);
    setErr("");
    const r = await signInWithProvider(p);
    setBusy(false);
    if (!r.ok) return setErr(r.message ?? "We couldn't sign you in.");
    router.replace(next);
  };

  return (
    <AuthShell
      eyebrow="Account · 02"
      title="Create Account."
      lead="Save your favourite weaves, book bridal consultations and follow every order."
      foot={
        <p className="au-new">
          Already have an account? <Link href={next === "/account" ? "/login" : `/login?next=${encodeURIComponent(next)}`} className="au-cta">Sign in <Icon name="arrow-right" /></Link>
        </p>
      }
    >
      {step === "details" ? (
        <form className="au-fields" onSubmit={details} noValidate>
          <div className="rp-field">
            <label htmlFor="su-name">Full Name</label>
            <input id="su-name" autoComplete="name" placeholder="Your full name" value={name} onChange={(e) => { setName(e.target.value); setErr(""); }} />
          </div>
          <IdentField id="su-id" ident={ident} onChange={(i) => { setIdent(i); setErr(""); }} />
          <PasswordField id="su-pw" label="Create Password" placeholder="At least 8 characters" autoComplete="new-password" value={pw} onChange={(v) => { setPw(v); setErr(""); }} />
          <label className="rp-check au-check au-agree">
            <input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); setErr(""); }} />
            <span className="rp-box" aria-hidden="true"><Icon name="check" /></span>
            <span>I agree to the <Link href="/terms" className="au-small">Terms &amp; Conditions</Link> and <Link href="/privacy" className="au-small">Privacy Policy</Link>.</span>
          </label>
          {err && <p className="rp-err" role="alert"><Icon name="warning" />{err}</p>}
          <button type="submit" className="btn au-btn" disabled={busy}>{busy ? "Sending code…" : <>Create account <Icon name="arrow-right" /></>}</button>
          <SocialRow onPick={social} busy={busy} verb="Sign up" />
        </form>
      ) : (
        <div className="au-fields">
          <p className="ck-sent">Code sent to {maskId(id)} <button type="button" className="rp-link" onClick={() => setStep("details")}>Change {idNoun(id)}</button></p>
          <OtpBoxes value={code} onChange={setCode} onComplete={verify} />
          <button type="button" className="rp-link" onClick={() => sendCode(id)} disabled={busy}>Resend code</button>
          {err && <p className="rp-err" role="alert"><Icon name="warning" />{err}</p>}
          <button type="button" className="btn au-btn" disabled={busy || !code.every(Boolean)} onClick={verify}>{busy ? "Creating account…" : "Verify & create account"}</button>
          {DEMO && <p className="au-demo">Demo: any 6-digit code works.</p>}
        </div>
      )}
    </AuthShell>
  );
}