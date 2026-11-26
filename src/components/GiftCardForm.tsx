"use client";

import Link from "next/link";
import { useState } from "react";
import { INBOX, isEmail, pushInbox } from "@/lib/inbox";
import { money } from "@/lib/products";
import { Icon } from "./Icon";
import { useSession } from "./useSession";

const AMOUNTS = [2000, 5000, 10000, 25000];

export default function GiftCardForm() {
  const { user, ready } = useSession();
  const [amt, setAmt] = useState(5000);
  const [custom, setCustom] = useState("");
  const [to, setTo] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [date, setDate] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const value = custom ? Number(custom.replace(/\D/g, "")) : amt;
  const today = new Date().toISOString().slice(0, 10);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!value || value < 1000 || value > 100000) return setErr("Choose an amount from ₹1,000 to ₹1,00,000.");
    if (to.trim().length < 2) return setErr("Enter the name of the person who will receive it.");
    if (!isEmail(email)) return setErr("Enter a valid email for the recipient.");
    if (date && date < today) return setErr("Choose today or a later date.");
    pushInbox(INBOX.giftcards, { from: user.name, fromId: user.id, to: to.trim(), email: email.trim(), message: msg.trim(), value, sendOn: date || today, status: "requested" }, "GC");
    setErr("");
    setDone(true);
  };

  if (ready && !user) {
    return (
      <div className="cs-done">
        <h2>Sign in to send a gift card</h2>
        <p>An account lets us keep your gift card with your orders.</p>
        <p><Link href="/login?next=/gift-cards" className="btn">Sign in</Link></p>
        <p>New here? <Link href="/signup?next=/gift-cards" className="rp-link">Create an account</Link></p>
      </div>
    );
  }
  if (done) {
    return (
      <div className="cs-done" role="status">
        <span className="cs-tick"><Icon name="check" /></span>
        <h2>Gift card requested</h2>
        <p>Your {money(value)} gift card for {to} is saved. We will confirm it and send it to {email} on {new Date(date || today).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}.</p>
      </div>
    );
  }
  return (
    <form className="cs-form" onSubmit={submit} noValidate>
      <fieldset className="wl-int">
        <legend className="field-label">Amount</legend>
        {AMOUNTS.map((a) => (
          <label key={a} className="wl-chip" data-on={!custom && amt === a}>
            <input type="radio" name="gc-amt" checked={!custom && amt === a} onChange={() => { setAmt(a); setCustom(""); }} />
            {money(a)}
          </label>
        ))}
      </fieldset>
      <div><label className="field-label" htmlFor="gc-c">Or enter your own amount (in rupees)</label><input id="gc-c" className="input" inputMode="numeric" placeholder="e.g. 7500" value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))} /></div>
      <div className="cs-two">
        <div><label className="field-label" htmlFor="gc-t">Recipient name</label><input id="gc-t" className="input" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <div><label className="field-label" htmlFor="gc-e">Recipient email</label><input id="gc-e" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      </div>
      <div><label className="field-label" htmlFor="gc-m">Message (optional)</label><textarea id="gc-m" className="input" rows={3} maxLength={300} value={msg} onChange={(e) => setMsg(e.target.value)} /></div>
      <div><label className="field-label" htmlFor="gc-d">Send on (optional)</label><input id="gc-d" className="input" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} /></div>
      {err && <p className="field-error" role="alert"><Icon name="warning" /><span>{err}</span></p>}
      <button type="submit" className="btn">Request gift card · {money(value || 0)}</button>
    </form>
  );
}
