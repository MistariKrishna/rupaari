"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Btn, Field } from "@/components/admin/ui";
import { ROLES } from "@/lib/admin/roles";
import { readSession, writeSession } from "@/lib/admin/useAdminData";
import type { Role } from "@/lib/admin/types";

const BLURB: Record<Role, string> = {
  owner: "Everything, including settings and refunds.",
  manager: "All screens except Settings.",
  catalogue: "Products and images.",
  operations: "Orders, packing, stock and returns.",
  support: "Orders, returns and customers.",
  marketing: "Collections, banners and offers.",
  finance: "Reports and exports.",
};
const NAMES: Record<Role, string> = { owner: "Owner", manager: "Store Manager", catalogue: "Catalogue Editor", operations: "Packing Lead", support: "Customer Care", marketing: "Marketing", finance: "Accounts" };

function Login() {
  const router = useRouter();
  const sp = useSearchParams();
  const [role, setRole] = useState<Role>("owner");
  const [email, setEmail] = useState("owner@rupaari.example");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (readSession()) router.replace(sp.get("next") || "/admin");
  }, [router, sp]);

  const pick = (r: Role) => {
    setRole(r);
    setEmail(`${r}@rupaari.example`);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid email address.");
    if (pw.length < 1) return setErr("Enter a password. Any value works in this demo.");
    writeSession({ role, name: NAMES[role], email });
    router.replace(sp.get("next") && sp.get("next")!.startsWith("/admin") ? sp.get("next")! : "/admin");
  };

  return (
    <div className="adm-login">
      <div className="adm-login-art">
        <span className="adm-logo">RUPAARI</span>
        <p>Back office for orders, catalogue and customers. Rediscover yourself.</p>
      </div>
      <div className="adm-login-form">
        <form className="adm-login-card" onSubmit={submit} noValidate>
          <div>
            <h1 className="adm-title">Sign in</h1>
            <p className="adm-sub">Demo mode: pick a role to preview what that person sees. Any password works.</p>
          </div>
          <div className="adm-roles" role="radiogroup" aria-label="Role">
            {ROLES.map((r) => (
              <button key={r.id} type="button" role="radio" aria-checked={role === r.id} className={`adm-roleb ${role === r.id ? "is-on" : ""}`} onClick={() => pick(r.id)}>
                <b>{r.label}</b>
                <small>{BLURB[r.id]}</small>
              </button>
            ))}
          </div>
          <Field label="Email">
            <input className="adm-in" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </Field>
          <Field label="Password" error={err}>
            <input className="adm-in" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
          </Field>
          <Btn type="submit">Sign in</Btn>
          <p className="adm-hint">Real accounts and two-factor sign-in arrive with the backend. Nothing here leaves this browser.</p>
        </form>
      </div>
    </div>
  );
}
export default function Page() {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}
