"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ACTION_NOTE, NAV, ROLES, canDo, canView, roleLabel, screenOf, type Action } from "@/lib/admin/roles";
import { ADMIN_EVENT, readSession, useAdminData, writeSession, type SetFn } from "@/lib/admin/useAdminData";
import type { AdminSession, Data, Role } from "@/lib/admin/types";
import AIcon from "./AIcon";
import { Btn, Empty, Modal, uid } from "./ui";

interface ConfirmOpts {
  title: string;
  body?: ReactNode;
  label?: string;
  danger?: boolean;
}
interface Ctx {
  d: Data;
  set: SetFn;
  session: AdminSession;
  role: Role;
  can: (a: Action) => boolean;
  why: (a: Action) => string | undefined;
  toast: (m: string, kind?: "ok" | "err") => void;
  confirm: (o: ConfirmOpts) => Promise<boolean>;
  log: (entity: string, ref: string, action: string, detail?: string) => void;
}
const AdminCtx = createContext<Ctx | null>(null);
export const useAdmin = () => {
  const c = useContext(AdminCtx);
  if (!c) throw new Error("useAdmin outside AdminShell");
  return c;
};

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/admin";
  const router = useRouter();
  const { d, set } = useAdminData();
  const [session, setSession] = useState<AdminSession | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [menu, setMenu] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; m: string; kind: "ok" | "err" }[]>([]);
  const [ask, setAsk] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null);
  const [term, setTerm] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    document.documentElement.setAttribute("data-ready", "");
    const read = () => setSession(readSession());
    read();
    try {
      setCollapsed(localStorage.getItem("rupaari.admin.collapsed") === "1");
    } catch {
      /* ignore */
    }
    window.addEventListener(ADMIN_EVENT, read);
    return () => window.removeEventListener(ADMIN_EVENT, read);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menu]);
  useEffect(() => {
    if (session === null && !isLogin) router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [session, isLogin, pathname, router]);

  const toast = useCallback((m: string, kind: "ok" | "err" = "ok") => {
    const id = uid("t");
    setToasts((t) => [...t, { id, m, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);
  const confirm = useCallback((o: ConfirmOpts) => new Promise<boolean>((resolve) => setAsk({ ...o, resolve })), []);
  const answer = (v: boolean) => {
    ask?.resolve(v);
    setAsk(null);
  };

  const ctx = useMemo<Ctx | null>(() => {
    if (!d || !session) return null;
    return {
      d,
      set,
      session,
      role: session.role,
      can: (a) => canDo(session.role, a),
      why: (a) => (canDo(session.role, a) ? undefined : ACTION_NOTE[a]),
      toast,
      confirm,
      log: (entity, ref, action, detail) =>
        set("audit", (p) => [{ id: uid("a"), at: new Date().toISOString(), by: session.name, role: session.role, entity, ref, action, detail }, ...p].slice(0, 400)),
    };
  }, [d, session, set, toast, confirm]);

  if (isLogin) return <div className="adm adm--bare">{children}</div>;
  if (!ctx || !session) return <div className="adm adm--bare"><div className="adm-load"><span className="adm-spin" /> Loading the back office…</div></div>;

  const screen = screenOf(pathname);
  const allowed = canView(session.role, screen);
  const current = NAV.flatMap((g) => g.items).find((i) => i.screen === screen);
  const toggleCollapse = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem("rupaari.admin.collapsed", c ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !c;
    });
  };
  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const t = term.trim();
    if (!t) return;
    if (/^rp-?\d/i.test(t) || t.includes("@")) router.push(`/admin/orders?q=${encodeURIComponent(t)}`);
    else router.push(`/admin/products?q=${encodeURIComponent(t)}`);
    setTerm("");
  };
  const initials = session.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  return (
    <AdminCtx.Provider value={ctx}>
      <div className={`adm ${collapsed ? "is-collapsed" : ""}`}>
        <aside className={`adm-side ${open ? "is-open" : ""}`} aria-label="Admin navigation">
          <div className="adm-brand">
            <Link href="/admin" className="adm-logo">
              RUPAARI
            </Link>
            <span className="adm-tag">Admin</span>
            <button type="button" className="adm-ibtn adm-only-m" onClick={() => setOpen(false)} aria-label="Close menu">
              <AIcon name="close" />
            </button>
          </div>
          <nav className="adm-nav">
            {NAV.map((g) => {
              const items = g.items.filter((i) => canView(session.role, i.screen));
              if (!items.length) return null;
              return (
                <div key={g.group || "top"} className="adm-ng">
                  {g.group && <p className="adm-nh">{g.group}</p>}
                  {items.map((i) => {
                    const on = i.screen === screen;
                    return (
                      <Link key={i.href} href={i.href} className={`adm-ni ${on ? "is-on" : ""}`} aria-current={on ? "page" : undefined} title={collapsed ? i.label : undefined}>
                        <AIcon name={i.icon} />
                        <span>{i.label}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>
          <div className="adm-sf">
            <a href="/" target="_blank" rel="noreferrer" className="adm-ni" title="View store">
              <AIcon name="external" />
              <span>View store</span>
            </a>
            <button type="button" className="adm-ni adm-only-d" onClick={toggleCollapse} title={collapsed ? "Expand menu" : "Collapse menu"}>
              <AIcon name="panel" />
              <span>Collapse</span>
            </button>
          </div>
        </aside>
        {open && <div className="adm-veil" onClick={() => setOpen(false)} />}

        <div className="adm-main">
          <header className="adm-top">
            <button type="button" className="adm-ibtn adm-only-m" onClick={() => setOpen(true)} aria-label="Open menu">
              <AIcon name="menu" />
            </button>
            <p className="adm-crumb">{current?.label ?? "Dashboard"}</p>
            <form className="adm-gs" onSubmit={search} role="search">
              <AIcon name="search" />
              <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Order number, email or product" aria-label="Search orders, customers and products" />
            </form>
            <span className="adm-grow" />
            <label className="adm-role">
              <span className="adm-sr">Viewing as</span>
              <select
                className="adm-in"
                value={session.role}
                onChange={(e) => {
                  const r = e.target.value as Role;
                  writeSession({ ...session, role: r });
                  toast(`Now viewing as ${roleLabel(r)}`);
                }}
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="adm-um" ref={menuRef}>
              <button type="button" className="adm-av" onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu} aria-label="Account menu">
                {initials}
              </button>
              {menu && (
                <div className="adm-pop" role="menu">
                  <p className="adm-pop-n">{session.name}</p>
                  <p className="adm-pop-e">{session.email}</p>
                  <p className="adm-pop-r">{roleLabel(session.role)}</p>
                  <button
                    type="button"
                    className="adm-pop-b"
                    role="menuitem"
                    onClick={() => {
                      writeSession(null);
                      router.replace("/admin/login");
                    }}
                  >
                    <AIcon name="logout" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </header>

          <div className="adm-content">
            <Suspense fallback={<div className="adm-load"><span className="adm-spin" /> Loading…</div>}>
              {allowed ? children : <Empty title="No access" text={`The ${roleLabel(session.role)} role cannot open this screen. Switch role in the top bar to preview other views.`} action={<Btn href="/admin" variant="ghost">Back to dashboard</Btn>} />}
            </Suspense>
          </div>
        </div>

        <div className="adm-toasts" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className={`adm-toast adm-toast--${t.kind}`}>
              <AIcon name={t.kind === "ok" ? "check" : "alert"} /> {t.m}
            </div>
          ))}
        </div>
        <Modal
          open={!!ask}
          onClose={() => answer(false)}
          title={ask?.title ?? ""}
          footer={
            <>
              <Btn variant="ghost" onClick={() => answer(false)}>Cancel</Btn>
              <Btn variant={ask?.danger ? "danger" : "primary"} onClick={() => answer(true)}>{ask?.label ?? "Confirm"}</Btn>
            </>
          }
        >
          {ask?.body}
        </Modal>
      </div>
    </AdminCtx.Provider>
  );
}
