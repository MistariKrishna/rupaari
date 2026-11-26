"use client";

import { useState } from "react";
import { INBOX, isEmail, isPhone, pushInbox } from "@/lib/inbox";
import { Icon } from "./Icon";

const INTERESTS = ["Kanjivaram sarees", "Bridal edit", "Kurtis", "Gifting"];

export default function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [picks, setPicks] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setErr("Enter your name.");
    if (!isEmail(email) && !isPhone(phone)) return setErr("Enter an email or a WhatsApp number.");
    if (email && !isEmail(email)) return setErr("That email does not look right.");
    if (!consent) return setErr("Please tick the box so we can message you.");
    pushInbox(INBOX.waitlist, { name: name.trim(), email: email.trim(), phone: phone.trim(), interests: picks }, "WL");
    setErr("");
    setDone(true);
  };

  if (done) {
    return (
      <div className="cs-done" role="status">
        <span className="cs-tick"><Icon name="check" /></span>
        <h2>You are on the list</h2>
        <p>Thank you, {name.split(" ")[0]}. We will write to you first, with early access to the launch collection.</p>
      </div>
    );
  }
  return (
    <form className="cs-form" onSubmit={submit} noValidate>
      <div><label className="field-label" htmlFor="wl-n">Name</label><input id="wl-n" className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="cs-two">
        <div><label className="field-label" htmlFor="wl-e">Email</label><input id="wl-e" className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="field-label" htmlFor="wl-p">WhatsApp number</label><input id="wl-p" className="input" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
      </div>
      <fieldset className="wl-int">
        <legend className="field-label">What are you looking for?</legend>
        {INTERESTS.map((i) => (
          <label key={i} className="wl-chip" data-on={picks.includes(i)}>
            <input type="checkbox" checked={picks.includes(i)} onChange={() => setPicks((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]))} />
            {i}
          </label>
        ))}
      </fieldset>
      <label className="wl-consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> I agree to receive launch updates from RUPAARI by email or WhatsApp. I can opt out at any time.</label>
      {err && <p className="field-error" role="alert"><Icon name="warning" /><span>{err}</span></p>}
      <button type="submit" className="btn">Join the waitlist</button>
    </form>
  );
}
