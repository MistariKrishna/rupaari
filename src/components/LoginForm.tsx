"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { safeNext, signIn, signInWithProvider, type Provider } from "@/lib/auth";
import { guessCountry } from "@/lib/countries";
import { emptyIdent, identValue, type Ident } from "@/lib/identity";
import AuthShell from "./AuthShell";
import { IdentField, PasswordField, SocialRow } from "./AuthFields";
import { Icon } from "./Icon";
import { useSession } from "./useSession";

export default function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const { user, ready } = useSession();

  const [ident, setIdent] = useState<Ident>(emptyIdent());
  const [pw, setPw] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => setIdent((i) => ({ ...i, dial: guessCountry().dial })), []);
  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, next, router]);

  const id = identValue(ident);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return setErr(ident.mode === "email" ? "Enter a valid email address." : "Enter a valid mobile number.");
    if (!pw) return setErr("Enter your password.");
    setBusy(true);
    setErr("");
    const r = await signIn(id, pw, remember);
    setBusy(false);
    if (!r.ok) return setErr(r.message ?? "We couldn't sign you in.");
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
      title="Welcome Back."
      lead="Sign in to access your saved weaves, bridal consultations, and orders."
      foot={
        <p className="au-new">
          New to the House of RUPAARI? <Link href={next === "/account" ? "/signup" : `/signup?next=${encodeURIComponent(next)}`} className="au-cta">Create an account <Icon name="arrow-right" /></Link>
        </p>
      }
    >
      <form className="au-fields" onSubmit={submit} noValidate>
        <IdentField ident={ident} onChange={(i) => { setIdent(i); setErr(""); }} invalid={!!err && !id} />
        <PasswordField value={pw} onChange={(v) => { setPw(v); setErr(""); }} />
        <div className="au-row">
          <label className="rp-check au-check">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span className="rp-box" aria-hidden="true"><Icon name="check" /></span>
            Remember me
          </label>
          <Link href="/forgot-password" className="au-small">Forgot Password?</Link>
        </div>
        {err && <p className="rp-err" role="alert"><Icon name="warning" />{err}</p>}
        <button type="submit" className="btn au-btn" disabled={busy}>{busy ? "Signing in…" : <>Sign in <Icon name="arrow-right" /></>}</button>
        <SocialRow onPick={social} busy={busy} />
      </form>
    </AuthShell>
  );
}
