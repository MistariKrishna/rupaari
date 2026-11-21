"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "./Icon";

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/** Demo sign-up: validates the address but sends nothing until a mailing service is connected. */
export default function NewsletterForm({ className = "max-w-[26rem]" }: { className?: string }) {
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    if (!isEmail(email)) {
      setError("Enter a valid email address.");
      setDone(false);
      return;
    }
    setError("");
    setDone(true);
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} noValidate className={className}>
      <label htmlFor="nl-email" className="field-label">Email address</label>
      <input id="nl-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" className="input" aria-invalid={error ? true : undefined} aria-describedby="nl-msg" />
      <button type="submit" className="btn mt-3 w-full">Subscribe</button>
      <div id="nl-msg" aria-live="polite" className="mt-3 text-[13px]">
        {error && (
          <p className="field-error">
            <Icon name="warning" />
            <span>{error}</span>
          </p>
        )}
        {done && <p className="text-burgundy">Thank you. This is a demo form, so nothing was sent.</p>}
      </div>
    </form>
  );
}