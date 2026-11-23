"use client";

import { useMemo, useState } from "react";
import DataTable, { FilterSelect, Toolbar, type Col } from "@/components/admin/DataTable";
import { Badge, Btn, Field, Modal, PageHeader, Tabs, Toggle, uid, useQ } from "@/components/admin/ui";
import { useAdmin } from "@/components/admin/AdminShell";
import { ROLES, roleLabel } from "@/lib/admin/roles";
import type { AuditEntry, Role, TeamUser } from "@/lib/admin/types";
import { fmtTime } from "@/lib/orders";

type Tab = "team" | "audit";
const blank = (): TeamUser => ({ id: "", name: "", email: "", role: "support", active: true });

export default function Team() {
  const { d, set, log, toast, session, can, why } = useAdmin();
  const q = useQ();
  const [tab, setTab] = useState<Tab>("team");
  const [edit, setEdit] = useState<TeamUser | null>(null);
  const term = q.get("q").toLowerCase();
  const entity = q.get("entity");

  const save = () => {
    if (!edit) return;
    if (!edit.name.trim() || !/^\S+@\S+\.\S+$/.test(edit.email)) return toast("Enter a name and a valid email.", "err");
    if (d.team.some((u) => u.id !== edit.id && u.email.toLowerCase() === edit.email.toLowerCase())) return toast("That email is already on the team.", "err");
    const u = { ...edit, id: edit.id || uid("u") };
    set("team", (p) => (p.some((x) => x.id === u.id) ? p.map((x) => (x.id === u.id ? u : x)) : [...p, u]));
    log("Team", u.email, edit.id ? "Updated" : "Added", roleLabel(u.role));
    setEdit(null);
    toast("Team member saved");
  };

  const teamCols: Col<TeamUser>[] = [
    { key: "name", label: "Name", sort: (u) => u.name, render: (u) => <div><b style={{ fontWeight: 500 }}>{u.name}</b><small>{u.email}</small></div> },
    { key: "role", label: "Role", sort: (u) => u.role, render: (u) => <Badge tone="wine">{roleLabel(u.role)}</Badge> },
    { key: "on", label: "Active", csv: (u) => (u.active ? "yes" : "no"), render: (u) => <Toggle checked={u.active} disabled={u.role === "owner" || !can("roles")} onChange={(v) => { set("team", (p) => p.map((x) => (x.id === u.id ? { ...x, active: v } : x))); log("Team", u.email, v ? "Activated" : "Deactivated"); }} /> },
    { key: "ed", label: "", csv: () => "", render: (u) => <Btn size="sm" variant="ghost" icon="edit" disabled={!can("roles")} title={why("roles")} onClick={() => setEdit({ ...u })}>Edit</Btn> },
  ];
  const audit = useMemo(() => d.audit.filter((a) => (!entity || a.entity === entity) && (!term || `${a.by} ${a.entity} ${a.ref} ${a.action} ${a.detail ?? ""}`.toLowerCase().includes(term))), [d.audit, entity, term]);
  const auditCols: Col<AuditEntry>[] = [
    { key: "at", label: "When", sort: (a) => a.at, csv: (a) => a.at, render: (a) => fmtTime(a.at) },
    { key: "by", label: "Who", sort: (a) => a.by, csv: (a) => `${a.by} (${roleLabel(a.role)})`, render: (a) => <div>{a.by}<small>{roleLabel(a.role)}</small></div> },
    { key: "ent", label: "Area", sort: (a) => a.entity, render: (a) => a.entity },
    { key: "ref", label: "Item", sort: (a) => a.ref, render: (a) => a.ref },
    { key: "act", label: "Action", sort: (a) => a.action, csv: (a) => `${a.action}${a.detail ? ": " + a.detail : ""}`, render: (a) => <div>{a.action}{a.detail && <small>{a.detail}</small>}</div> },
  ];

  return (
    <>
      <PageHeader back={{ href: "/admin/settings", label: "Settings" }} title="Team and audit log" sub={`Signed in as ${session.name}.`} actions={tab === "team" ? <Btn icon="plus" disabled={!can("roles")} title={why("roles")} onClick={() => setEdit(blank())}>Add member</Btn> : undefined} />
      <Tabs<Tab> tabs={[{ id: "team", label: "Team", count: d.team.length }, { id: "audit", label: "Audit log", count: d.audit.length }]} value={tab} onChange={setTab} />
      {tab === "team" ? (
        <DataTable rows={d.team} cols={teamCols} rowKey={(u) => u.id} exportName="team" />
      ) : (
        <>
          <Toolbar placeholder="Search who, area, item or action">
            <FilterSelect param="entity" label="All areas" options={Array.from(new Set(d.audit.map((a) => a.entity))).sort().map((e) => ({ value: e, label: e }))} />
          </Toolbar>
          <DataTable rows={audit} cols={auditCols} rowKey={(a) => a.id} exportName="audit-log" pageSize={15} defaultSort={{ key: "at", dir: "desc" }} emptyTitle="Nothing logged yet" emptyText="Every change made in the back office is recorded here." />
        </>
      )}
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Edit team member" : "Add team member"} footer={<><Btn variant="ghost" onClick={() => setEdit(null)}>Cancel</Btn><Btn onClick={save}>Save</Btn></>}>
        {edit && (
          <div className="adm-form" style={{ gridTemplateColumns: "1fr" }}>
            <Field label="Name"><input className="adm-in" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
            <Field label="Email"><input className="adm-in" type="email" value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></Field>
            <Field label="Role"><select className="adm-in" value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value as Role })}>{ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}</select></Field>
          </div>
        )}
      </Modal>
    </>
  );
}
