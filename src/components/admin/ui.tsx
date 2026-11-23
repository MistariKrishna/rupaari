"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import AIcon from "./AIcon";

/* ---------- URL state: filters, search and page live in the address ---------- */
export function useQ() {
  const sp = useSearchParams();
  const path = usePathname();
  const router = useRouter();
  const get = (k: string, fallback = "") => sp.get(k) ?? fallback;
  const set = useCallback(
    (patch: Record<string, string | undefined>) => {
      const next = new URLSearchParams(sp.toString());
      Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
      if (!("page" in patch)) next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${path}?${qs}` : path, { scroll: false });
    },
    [sp, path, router],
  );
  return { get, set };
}

/* ---------- badges ---------- */
export type Tone = "green" | "amber" | "blue" | "red" | "grey" | "wine" | "gold";
export function Badge({ tone = "grey", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`adm-badge adm-badge--${tone}`}>{children}</span>;
}
const TONES: Record<string, Tone> = {
  Confirmed: "amber", Packed: "amber", Shipped: "blue", "Out for delivery": "blue", Delivered: "green", Cancelled: "red", Closed: "grey",
  Paid: "green", "COD pending": "amber", "COD collected": "green", "Refund due": "red", Refunded: "grey",
  requested: "amber", approved: "blue", "picked-up": "blue", received: "blue", refunded: "green", rejected: "red",
  live: "green", draft: "grey", archived: "grey", OK: "green", Low: "amber", Out: "red", Sold: "red", Available: "green",
  Live: "green", Scheduled: "blue", Ended: "grey", Active: "green", Inactive: "grey", Expired: "red",
};
export const StatusBadge = ({ s, label }: { s: string; label?: string }) => <Badge tone={TONES[s] ?? "grey"}>{label ?? s}</Badge>;

/* ---------- layout blocks ---------- */
export function PageHeader({ title, sub, actions, back }: { title: string; sub?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <header className="adm-ph">
      <div>
        {back && (
          <Link href={back.href} className="adm-back">
            <AIcon name="arrow-left" /> {back.label}
          </Link>
        )}
        <h1 className="adm-title">{title}</h1>
        {sub && <p className="adm-sub">{sub}</p>}
      </div>
      {actions && <div className="adm-ph-actions">{actions}</div>}
    </header>
  );
}

export function Card({ title, actions, children, pad = true, className = "" }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; pad?: boolean; className?: string }) {
  return (
    <section className={`adm-card ${className}`}>
      {(title || actions) && (
        <div className="adm-card-h">
          <h2 className="adm-card-t">{title}</h2>
          {actions && <div className="adm-card-a">{actions}</div>}
        </div>
      )}
      <div className={pad ? "adm-card-b" : ""}>{children}</div>
    </section>
  );
}

export function Stat({ label, value, sub, href, icon, tone }: { label: string; value: ReactNode; sub?: string; href?: string; icon: string; tone?: Tone }) {
  const body = (
    <>
      <span className={`adm-stat-i adm-stat-i--${tone ?? "wine"}`}>
        <AIcon name={icon} />
      </span>
      <span className="adm-stat-l">{label}</span>
      <span className="adm-stat-v">{value}</span>
      {sub && <span className="adm-stat-s">{sub}</span>}
    </>
  );
  return href ? (
    <Link href={href} className="adm-stat">
      {body}
    </Link>
  ) : (
    <div className="adm-stat">{body}</div>
  );
}

export function Empty({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="adm-empty">
      <span className="adm-empty-i">
        <AIcon name="box" />
      </span>
      <p className="adm-empty-t">{title}</p>
      {text && <p className="adm-empty-s">{text}</p>}
      {action}
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="adm-tabs" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} type="button" role="tab" aria-selected={value === t.id} className="adm-tab" onClick={() => onChange(t.id)}>
          {t.label}
          {t.count != null && <span className="adm-tab-c">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ---------- form controls ---------- */
export function Field({ label, hint, error, children, wide, required }: { label: string; hint?: string; error?: string; children: ReactNode; wide?: boolean; required?: boolean }) {
  return (
    <label className={`adm-field ${wide ? "adm-field--wide" : ""}`}>
      <span className="adm-label">{label}{required && <span className="adm-req" aria-hidden="true"> *</span>}</span>
      {children}
      {error ? <span className="adm-err">{error}</span> : hint ? <span className="adm-hint">{hint}</span> : null}
    </label>
  );
}
/** Native controls inherit the field id through aria-labelledby-free simple wrapper. */
export const inputCls = "adm-in";

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label?: string; disabled?: boolean }) {
  return (
    <label className={`adm-toggle ${disabled ? "is-disabled" : ""}`}>
      <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="adm-toggle-t" aria-hidden="true" />
      {label && <span className="adm-toggle-l">{label}</span>}
    </label>
  );
}

export function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode }) {
  return (
    <label className="adm-check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function Btn({ children, variant = "primary", size, icon, disabled, title, onClick, type = "button", href, className = "" }: {
  children?: ReactNode; variant?: "primary" | "ghost" | "danger" | "light"; size?: "sm"; icon?: string; disabled?: boolean; title?: string; onClick?: () => void; type?: "button" | "submit"; href?: string; className?: string;
}) {
  const cls = `adm-btn adm-btn--${variant} ${size === "sm" ? "adm-btn--sm" : ""} ${className}`;
  const inner = (
    <>
      {icon && <AIcon name={icon} />}
      {children}
    </>
  );
  if (href && !disabled) return <Link href={href} className={cls}>{inner}</Link>;
  return (
    <button type={type} className={cls} disabled={disabled} title={title} onClick={onClick}>
      {inner}
    </button>
  );
}

export function Modal({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="adm-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`adm-modal ${wide ? "adm-modal--wide" : ""}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <div className="adm-modal-h">
          <h2 className="adm-card-t">{title}</h2>
          <button type="button" className="adm-ibtn" onClick={onClose} aria-label="Close">
            <AIcon name="close" />
          </button>
        </div>
        <div className="adm-modal-b">{children}</div>
        {footer && <div className="adm-modal-f">{footer}</div>}
      </div>
    </div>
  );
}

export const money = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
export const num = (v: number | "") => (v === "" ? 0 : v);
export const toNum = (s: string): number | "" => (s.trim() === "" || isNaN(Number(s)) ? "" : Number(s));
export const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
export const uid = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
export const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} h ago`;
  return `${Math.round(m / 1440)} d ago`;
};

/* ---------- product thumbnail: photo if there is one, else the woven colour ---------- */
const TONE_BG: Record<string, string> = {
  wine: "linear-gradient(135deg,#4a0b13,#7a1f2b)",
  burgundy: "linear-gradient(135deg,#680f1a,#9a2b38)",
  gold: "linear-gradient(135deg,#c9a24d,#e5cf8c)",
  taupe: "linear-gradient(135deg,#bba99a,#d9cdc2)",
  ivory: "linear-gradient(135deg,#f1e8d8,#fffaf0)",
};
export function Thumb({ tone, src, large }: { tone?: string; src?: string; large?: boolean }) {
  return (
    <span className={`adm-thumb ${large ? "adm-thumb--lg" : ""}`} style={{ backgroundImage: src ? undefined : TONE_BG[tone ?? "burgundy"] }} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src && <img src={src} alt="" />}
    </span>
  );
}
export const productThumb = (p: { tone: string; images: { src: string; primary: boolean }[] }) => <Thumb tone={p.tone} src={(p.images.find((i) => i.primary) ?? p.images[0])?.src} />;