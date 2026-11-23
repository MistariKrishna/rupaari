"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Badge, Btn, Card, Empty, Field, Modal, PageHeader, StatusBadge, Thumb, money, uid } from "@/components/admin/ui";
import { useAdmin } from "@/components/admin/AdminShell";
import { parseRetId } from "@/lib/admin/orders";
import { RETURN_STEPS, fmtShort, fmtTime, itemKey, itemMeta, sameItem, type ReturnInfo } from "@/lib/orders";
import { RETURN_WINDOW_DAYS } from "@/lib/checkout";

export default function ReturnReview() {
  const { id } = useParams<{ id: string }>();
  const { orderId, itemId, size } = parseRetId(id ?? "");
  const { d, set, role, can, why, log, toast, confirm, session } = useAdmin();
  const o = d.orders.find((x) => x.id === orderId);
  const it = o?.items.find((i) => sameItem(i, { id: itemId, size }));
  const rejected = o ? (d.meta[o.id]?.rejectedReturns ?? []).find((r) => r.itemKey === `${itemId}|${size ?? ""}`) : undefined;
  const [rej, setRej] = useState(false);
  const [rejNote, setRejNote] = useState("");
  const [result, setResult] = useState<"accepted" | "damaged">("accepted");
  const [inspect, setInspect] = useState("");

  if (!o || !it || (!it.return && !rejected)) return <Empty title="Return not found" action={<Btn href="/admin/returns" variant="ghost">Back to returns</Btn>} />;
  const r = it.return;
  const status = r?.status ?? "rejected";
  const amount = it.price * it.qty;
  const needOwner = amount > d.settings.refundLimit && !can("refund_big");
  const mayAct = ["owner", "manager", "operations", "support"].includes(role);
  const deliveredAt = o.deliveredAt ?? o.placedAt;
  const daysLeft = Math.max(0, RETURN_WINDOW_DAYS - Math.floor((new Date(r?.requestedAt ?? Date.now()).getTime() - new Date(deliveredAt).getTime()) / 86_400_000));

  const patchReturn = (patch: Partial<ReturnInfo>, label: string, note?: string) => {
    set("orders", (prev) => prev.map((x) => (x.id === o.id ? { ...x, items: x.items.map((i) => (sameItem(i, it) && i.return ? { ...i, return: { ...i.return, ...patch } } : i)) } : x)));
    set("meta", (prev) => {
      const m = prev[o.id] ?? { id: o.id, notes: [], timeline: [] };
      return { ...prev, [o.id]: { ...m, timeline: [...m.timeline, { at: new Date().toISOString(), label: `Return: ${label}`, by: session.name, note }] } };
    });
    log("Return", `${o.id} ${it.name}`, label, note);
  };
  const now = () => new Date().toISOString();

  const approve = () => {
    patchReturn({ status: "approved", pickupDate: new Date(Date.now() + 2 * 86_400_000).toISOString() }, "Approved");
    toast("Return approved. Pickup booked for two days from now.");
  };
  const reject = () => {
    set("orders", (prev) => prev.map((x) => (x.id === o.id ? { ...x, items: x.items.map((i) => (sameItem(i, it) ? { ...i, return: undefined, nonReturnable: true } : i)) } : x)));
    set("meta", (prev) => {
      const m = prev[o.id] ?? { id: o.id, notes: [], timeline: [] };
      return { ...prev, [o.id]: { ...m, rejectedReturns: [...(m.rejectedReturns ?? []), { itemKey: itemKey(it), at: now(), note: rejNote, reason: r?.reason ?? "", by: session.name }], timeline: [...m.timeline, { at: now(), label: "Return: Rejected", by: session.name, note: rejNote }] } };
    });
    log("Return", `${o.id} ${it.name}`, "Rejected", rejNote);
    setRej(false);
    toast("Return rejected");
  };
  const refund = async () => {
    if (!(await confirm({ title: `Refund ${money(amount)}?`, body: result === "accepted" ? "The piece goes back into stock and the refund is recorded." : "The piece is quarantined (not restocked) and the refund is recorded.", label: "Issue refund" }))) return;
    patchReturn({ status: "refunded", refundedAt: now() }, "Refunded", `${result === "accepted" ? "Restocked" : "Quarantined"}. ${inspect}`.trim());
    if (result === "accepted") {
      set("stock", (prev) => prev.map((s) => (s.id === it.id ? { ...s, onHand: s.onHand + it.qty, sizes: s.sizes && it.size ? { ...s.sizes, [it.size]: (s.sizes[it.size] ?? 0) + it.qty } : s.sizes } : s)));
      set("ledger", (prev) => [{ id: uid("mv"), at: now(), productId: it.id, size: it.size, type: "return", qty: it.qty, by: session.name, note: `Return ${o.id}` }, ...prev]);
    }
    toast(`Refund of ${money(amount)} recorded`);
  };

  const steps = [
    { k: "requested", at: r?.requestedAt },
    { k: "approved", at: r?.pickupDate && r.status !== "requested" ? r.pickupDate : undefined },
    { k: "picked-up", at: r?.pickedUpAt },
    { k: "received", at: r?.receivedAt },
    { k: "refunded", at: r?.refundedAt },
  ];
  const idx = r ? RETURN_STEPS.indexOf(r.status) : -1;

  return (
    <>
      <PageHeader back={{ href: "/admin/returns", label: "Returns" }} title={`RT-${o.id.slice(3)}`} sub={<>Order <Link href={`/admin/orders/${o.id}`} className="adm-link">{o.id}</Link> · {o.address.name}</>} actions={<StatusBadge s={status} label={status.replace("-", " ")} />} />
      <div className="adm-cols">
        <div>
          <Card title="Request">
            <div className="adm-line-i" style={{ paddingTop: 0 }}>
              <Thumb tone={it.tone} src={d.products.find((p) => p.id === it.id)?.images[0]?.src} large />
              <div><b style={{ fontWeight: 500 }}>{it.name}</b><small>{itemMeta(it)}</small></div>
              <b style={{ fontWeight: 500 }}>{money(amount)}</b>
            </div>
            <dl className="adm-kv" style={{ marginTop: 12 }}>
              <div><dt>Reason</dt><dd>{r?.reason ?? rejected?.reason}</dd></div>
              <div><dt>Requested</dt><dd>{fmtTime(r?.requestedAt ?? rejected!.at)}</dd></div>
              <div><dt>Return window</dt><dd>{RETURN_WINDOW_DAYS} days{r && r.status === "requested" ? ` · ${daysLeft} days were left at request` : ""}</dd></div>
            </dl>
            {r?.details && <p className="adm-pre" style={{ marginTop: 12 }}>{r.details}</p>}
            {r && r.photos.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                {r.photos.map((p, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={p} alt={`Customer photo ${i + 1}`} style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 3 }} />
                ))}
              </div>
            )}
            {r && r.photos.length === 0 && <p className="adm-hint" style={{ marginTop: 10 }}>No photos were attached.</p>}
          </Card>
          {rejected && (
            <Card title="Rejected"><p className="adm-sub">{rejected.by} on {fmtShort(rejected.at)}.</p><p className="adm-pre" style={{ marginTop: 8 }}>{rejected.note || "No note."}</p></Card>
          )}
          {r && (
            <Card title="Progress">
              <ol className="adm-tl">
                {steps.map((s, i) => (i <= idx ? (
                  <li key={s.k} className={i === idx ? "is-now" : ""}><b style={{ textTransform: "capitalize" }}>{s.k.replace("-", " ")}</b><span>{s.at ? fmtTime(s.at) : "Done"}</span></li>
                ) : null))}
              </ol>
            </Card>
          )}
        </div>

        <div>
          {r && mayAct && r.status !== "refunded" && (
            <Card title="Next step">
              {r.status === "requested" && (
                <div style={{ display: "grid", gap: 10 }}>
                  <p className="adm-sub">Check the photos and reason, then approve or reject.</p>
                  <Btn onClick={approve}>Approve and book pickup</Btn>
                  <Btn variant="danger" onClick={() => setRej(true)}>Reject</Btn>
                </div>
              )}
              {r.status === "approved" && (
                <div style={{ display: "grid", gap: 10 }}>
                  <p className="adm-sub">Pickup on {r.pickupDate ? fmtShort(r.pickupDate) : "the booked date"}.</p>
                  <Btn onClick={() => { patchReturn({ status: "picked-up", pickedUpAt: now() }, "Picked up"); toast("Marked as picked up"); }}>Mark as picked up</Btn>
                </div>
              )}
              {r.status === "picked-up" && (
                <div style={{ display: "grid", gap: 10 }}>
                  <p className="adm-sub">On its way back to the studio.</p>
                  <Btn onClick={() => { patchReturn({ status: "received", receivedAt: now() }, "Received"); toast("Marked as received"); }}>Mark as received</Btn>
                </div>
              )}
              {r.status === "received" && (
                <div style={{ display: "grid", gap: 12 }}>
                  <Field label="Inspection result">
                    <select className="adm-in" value={result} onChange={(e) => setResult(e.target.value as "accepted" | "damaged")}>
                      <option value="accepted">Accepted: restock the piece</option>
                      <option value="damaged">Damaged: quarantine, do not restock</option>
                    </select>
                  </Field>
                  <Field label="Inspection notes"><textarea className="adm-in" value={inspect} onChange={(e) => setInspect(e.target.value)} /></Field>
                  <Field label="Resolution"><input className="adm-in" value={`Refund ${money(amount)} to the original payment method`} disabled /></Field>
                  {needOwner && <div className="adm-alert"><span>This refund is above {money(d.settings.refundLimit)}. {why("refund_big")}.</span></div>}
                  <Btn disabled={needOwner} onClick={refund}>Issue refund</Btn>
                </div>
              )}
            </Card>
          )}
          {r && r.status === "refunded" && <Card title="Resolved"><Badge tone="green">Refunded {money(amount)}</Badge><p className="adm-sub" style={{ marginTop: 8 }}>{r.refundedAt ? fmtTime(r.refundedAt) : ""}</p></Card>}
          <Card title="Customer">
            <p><Link href={`/admin/customers/${encodeURIComponent(o.contact.toLowerCase())}`} className="adm-link">{o.address.name}</Link></p>
            <p className="adm-sub">{o.contact}</p>
            <p className="adm-sub">{o.address.city}, {o.address.country}</p>
          </Card>
        </div>
      </div>
      <Modal open={rej} onClose={() => setRej(false)} title="Reject this return" footer={<><Btn variant="ghost" onClick={() => setRej(false)}>Cancel</Btn><Btn variant="danger" disabled={!rejNote.trim()} onClick={reject}>Reject return</Btn></>}>
        <Field label="Reason shown in the record" hint="The item is marked non-returnable on the customer's order page."><textarea className="adm-in" value={rejNote} onChange={(e) => setRejNote(e.target.value)} /></Field>
      </Modal>
    </>
  );
}
