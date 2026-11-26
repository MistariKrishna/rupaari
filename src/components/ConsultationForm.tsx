"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { useSession } from "./useSession";

const KEY = "rupaari.consultations";
const TOPICS = ["Bridal sarees", "Wedding guest outfit", "Kurtis", "Gifting", "Something else"];
const MODES = ["Video call", "Phone call", "Visit the studio"];
const SLOTS = ["Morning (10am to 1pm)", "Afternoon (1pm to 4pm)", "Evening (4pm to 7pm)"];

export default function ConsultationForm() {
  const { user } = useSession();
  const today = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState({ name: "", contact: "", topic: TOPICS[0], mode: MODES[0], date: "", slot: SLOTS[0], note: "" });
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF((x) => ({ ...x, [k]: e.target.value }));
  const name = f.name || user?.name || "";
  const contact = f.contact || user?.id || "";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setErr("Enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim()) && contact.replace(/\D/g, "").length < 8) return setErr("Enter a valid email or mobile number.");
    if (!f.date || f.date < today) return setErr("Choose a date from today onwards.");
    try {
      const all = JSON.parse(localStorage.getItem(KEY) || "[]");
      all.unshift({ id: `CN-${Date.now().toString().slice(-6)}`, ...f, name, contact, at: new Date().toISOString() });
      localStorage.setItem(KEY, JSON.stringify(all));
    } catch { /* storage unavailable */ }
    setErr("");
    setDone(true);
  };

  if (done) {
    return (
      <div className="cs-done" role="status">
        <span className="cs-tick"><Icon name="check" /></span>
        <h2>Request received</h2>
        <p>Thank you, {name.split(" ")[0]}. We will confirm your {f.mode.toLowerCase()} for {new Date(f.date).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}, {f.slot.split(" (")[0].toLowerCase()}, on {contact}.</p>
      </div>
    );
  }

  return (
    <form className="cs-form" onSubmit={submit} noValidate>
      <div className="cs-two">
        <div><label className="field-label" htmlFor="cs-n">Name</label><input id="cs-n" className="input" autoComplete="name" value={name} onChange={set("name")} /></div>
        <div><label className="field-label" htmlFor="cs-c">Email or mobile number</label><input id="cs-c" className="input" autoComplete="email" value={contact} onChange={set("contact")} /></div>
      </div>
      <div className="cs-two">
        <div><label className="field-label" htmlFor="cs-t">What do you need help with?</label><select id="cs-t" className="input" value={f.topic} onChange={set("topic")}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div><label className="field-label" htmlFor="cs-m">How would you like to meet?</label><select id="cs-m" className="input" value={f.mode} onChange={set("mode")}>{MODES.map((t) => <option key={t}>{t}</option>)}</select></div>
      </div>
      <div className="cs-two">
        <div><label className="field-label" htmlFor="cs-d">Preferred date</label><input id="cs-d" className="input" type="date" min={today} value={f.date} onChange={set("date")} /></div>
        <div><label className="field-label" htmlFor="cs-s">Preferred time</label><select id="cs-s" className="input" value={f.slot} onChange={set("slot")}>{SLOTS.map((t) => <option key={t}>{t}</option>)}</select></div>
      </div>
      <div><label className="field-label" htmlFor="cs-x">Tell us a little (optional)</label><textarea id="cs-x" className="input" rows={4} placeholder="Occasion, budget, colours you like" value={f.note} onChange={set("note")} /></div>
      {err && <p className="field-error" role="alert"><Icon name="warning" /><span>{err}</span></p>}
      <button type="submit" className="btn">Request a consultation</button>
    </form>
  );
}
