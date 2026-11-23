"use client";

import { useRef, useState } from "react";
import { Badge, Btn, Card, Empty, Field, Modal, PageHeader, Toggle, uid } from "@/components/admin/ui";
import { useAdmin } from "@/components/admin/AdminShell";
import { compressImage } from "@/lib/admin/export";
import type { Banner } from "@/lib/admin/types";
import type { Tone } from "@/lib/content";

const BG: Record<string, string> = { wine: "linear-gradient(135deg,#4a0b13,#7a1f2b)", burgundy: "linear-gradient(135deg,#680f1a,#9a2b38)", gold: "linear-gradient(135deg,#a07b2a,#c9a24d)", taupe: "linear-gradient(135deg,#8c7b6d,#bba99a)", ivory: "linear-gradient(135deg,#d8cbb4,#f1e8d8)" };
const today = () => new Date().toISOString().slice(0, 10);
const bannerState = (b: Banner) => (!b.active ? "Inactive" : b.startsAt > today() ? "Scheduled" : b.endsAt < today() ? "Ended" : "Live");
const blank = (): Banner => ({ id: "", heading: "", line: "", link: "/", tone: "burgundy", image: "", startsAt: today(), endsAt: new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10), active: true });

export default function Banners() {
  const { d, set, log, toast, confirm } = useAdmin();
  const [edit, setEdit] = useState<Banner | null>(null);
  const file = useRef<HTMLInputElement>(null);

  const save = () => {
    if (!edit) return;
    if (!edit.heading.trim()) return toast("Add a heading.", "err");
    if (edit.endsAt < edit.startsAt) return toast("The end date is before the start date.", "err");
    const b = { ...edit, id: edit.id || uid("bn") };
    if (!set("banners", (prev) => (prev.some((x) => x.id === b.id) ? prev.map((x) => (x.id === b.id ? b : x)) : [b, ...prev]))) return toast("Storage is full. Use a smaller image.", "err");
    log("Banner", b.heading, edit.id ? "Updated" : "Created");
    setEdit(null);
    toast("Banner saved");
  };
  const remove = async (b: Banner) => {
    if (!(await confirm({ title: `Delete “${b.heading}”?`, label: "Delete", danger: true }))) return;
    set("banners", (prev) => prev.filter((x) => x.id !== b.id));
    log("Banner", b.heading, "Deleted");
  };
  const stateTone = (s: string) => (s === "Live" ? "green" : s === "Scheduled" ? "blue" : "grey");

  return (
    <>
      <PageHeader back={{ href: "/admin/collections", label: "Collections" }} title="Homepage banners" sub="Scheduled banners switch on and off by date." actions={<Btn icon="plus" onClick={() => setEdit(blank())}>New banner</Btn>} />
      {d.banners.length === 0 ? <Empty title="No banners yet" action={<Btn onClick={() => setEdit(blank())}>New banner</Btn>} /> : (
        <div className="adm-g3">
          {d.banners.map((b) => {
            const st = bannerState(b);
            return (
              <Card key={b.id} pad={false}>
                <div className="adm-ban" style={{ background: b.image ? `center / cover url(${b.image})` : BG[b.tone] }}><b>{b.heading}</b><span>{b.line}</span></div>
                <div className="adm-card-b" style={{ display: "grid", gap: 10 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <Badge tone={stateTone(st) as "green" | "blue" | "grey"}>{st}</Badge>
                    <small>{b.startsAt} to {b.endsAt}</small>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Toggle checked={b.active} onChange={(v) => { set("banners", (prev) => prev.map((x) => (x.id === b.id ? { ...x, active: v } : x))); log("Banner", b.heading, v ? "Activated" : "Deactivated"); }} label="Active" />
                    <span className="adm-grow" />
                    <Btn size="sm" variant="ghost" icon="edit" onClick={() => setEdit({ ...b })}>Edit</Btn>
                    <button type="button" className="adm-ibtn" onClick={() => remove(b)} aria-label={`Delete ${b.heading}`}><span aria-hidden>×</span></button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Modal open={!!edit} onClose={() => setEdit(null)} wide title={edit?.id ? "Edit banner" : "New banner"} footer={<><Btn variant="ghost" onClick={() => setEdit(null)}>Cancel</Btn><Btn onClick={save}>Save banner</Btn></>}>
        {edit && (
          <div className="adm-form">
            <Field label="Heading" wide><input className="adm-in" value={edit.heading} onChange={(e) => setEdit({ ...edit, heading: e.target.value })} /></Field>
            <Field label="Line" wide><input className="adm-in" value={edit.line} onChange={(e) => setEdit({ ...edit, line: e.target.value })} /></Field>
            <Field label="Link"><input className="adm-in" value={edit.link} onChange={(e) => setEdit({ ...edit, link: e.target.value })} /></Field>
            <Field label="Colour when no image"><select className="adm-in" value={edit.tone} onChange={(e) => setEdit({ ...edit, tone: e.target.value as Tone })}>{Object.keys(BG).map((t) => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Starts"><input className="adm-in" type="date" value={edit.startsAt} onChange={(e) => setEdit({ ...edit, startsAt: e.target.value })} /></Field>
            <Field label="Ends"><input className="adm-in" type="date" value={edit.endsAt} onChange={(e) => setEdit({ ...edit, endsAt: e.target.value })} /></Field>
            <Field label="Image" wide>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Btn size="sm" variant="ghost" icon="upload" onClick={() => file.current?.click()}>Choose image</Btn>
                {edit.image && <Btn size="sm" variant="ghost" onClick={() => setEdit({ ...edit, image: "" })}>Remove</Btn>}
                <input ref={file} type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) setEdit({ ...edit, image: await compressImage(f, 1100) }); }} />
              </div>
            </Field>
            <div className="adm-field adm-field--wide"><div className="adm-ban" style={{ background: edit.image ? `center / cover url(${edit.image})` : BG[edit.tone] }}><b>{edit.heading || "Heading"}</b><span>{edit.line || "Line"}</span></div></div>
          </div>
        )}
      </Modal>
    </>
  );
}
