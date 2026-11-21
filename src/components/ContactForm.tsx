"use client";

import { useRef, useState, type FormEvent } from "react";
import { Icon } from "./Icon";

type Field = "name" | "email" | "message";
type Errors = Partial<Record<Field, string>>;

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <div id={id} aria-live="polite">
      {message && (
        <p className="field-error">
          <Icon name="warning" />
          <span>{message}</span>
        </p>
      )}
    </div>
  );
}

export default function ContactForm() {
  const form = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const next: Errors = {};
    if (name.length < 2) next.name = "Enter your name.";
    if (!isEmail(email)) next.email = "Enter a valid email address.";
    if (message.length < 10) next.message = "Write at least 10 characters.";
    setErrors(next);
    setSent(false);

    const firstBad = (["name", "email", "message"] as const).find((k) => next[k]);
    if (firstBad) {
      const el = form.current?.elements.namedItem(firstBad);
      if (el instanceof HTMLElement) el.focus();
      return;
    }
    form.current?.reset();
    setSent(true);
  }

  return (
    <form ref={form} onSubmit={onSubmit} noValidate className="grid max-w-[620px] gap-6">
      <div>
        <label htmlFor="name" className="field-label">Name</label>
        <input id="name" name="name" type="text" autoComplete="name" className="input" aria-invalid={errors.name ? true : undefined} aria-describedby="e-name" />
        <FieldError id="e-name" message={errors.name} />
      </div>
      <div>
        <label htmlFor="email" className="field-label">Email address</label>
        <input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" className="input" aria-invalid={errors.email ? true : undefined} aria-describedby="e-email" />
        <FieldError id="e-email" message={errors.email} />
      </div>
      <div>
        <label htmlFor="message" className="field-label">Message</label>
        <textarea id="message" name="message" rows={5} className="input" aria-invalid={errors.message ? true : undefined} aria-describedby="e-message" />
        <FieldError id="e-message" message={errors.message} />
      </div>
      <button type="submit" className="btn justify-self-start">Send message <Icon name="arrow-right" /></button>
      {sent && (
        <p className="note" role="status">
          <Icon name="check" />
          <span>Thank you. This is a demo form, so no message was sent.</span>
        </p>
      )}
    </form>
  );
}
