import { useAdmin } from "./AdminShell";
import { emptyMeta, entry } from "@/lib/admin/orders";
import { STAGES, type Address, type Order } from "@/lib/orders";
import type { OrderMeta } from "@/lib/admin/types";

/** Every order status change goes through here so the timeline, audit log and the customer's order page stay in step. */
export function useOrderActions() {
  const { set, session, log, toast, d } = useAdmin();

  const patch = (o: Order, orderPatch: Partial<Order>, label: string, metaPatch: Partial<OrderMeta> = {}, note?: string) => {
    set("orders", (prev) => prev.map((x) => (x.id === o.id ? { ...x, ...orderPatch } : x)));
    set("meta", (prev) => {
      const m = prev[o.id] ?? emptyMeta(o.id);
      return { ...prev, [o.id]: { ...m, ...metaPatch, timeline: [...m.timeline, entry(label, session.name, note)] } };
    });
    log("Order", o.id, label, note);
  };

  return {
    pack: (o: Order) => {
      patch(o, { stage: 1 }, "Packed", { packCheck: { sku: true, quality: true, photo: true } });
      toast(`${o.id} marked as packed`);
    },
    ship: (o: Order, courier: string, tracking: string) => {
      patch(o, { stage: 2 }, "Shipped", { courier, tracking, shippedAt: new Date().toISOString() }, `${courier} ${tracking}`);
      toast(`${o.id} marked as shipped`);
    },
    outForDelivery: (o: Order) => {
      patch(o, { stage: 3 }, STAGES[3]);
      toast(`${o.id} is out for delivery`);
    },
    deliver: (o: Order) => {
      patch(o, { stage: 4, deliveredAt: new Date().toISOString() }, "Delivered");
      toast(`${o.id} marked as delivered`);
    },
    cancel: (o: Order, reason: string) => {
      patch(o, {}, "Cancelled", { cancelled: { at: new Date().toISOString(), reason, by: session.name } }, reason);
      toast(`${o.id} cancelled`);
    },
    markRefunded: (o: Order) => {
      patch(o, {}, "Refund recorded", { refunded: true });
      toast("Refund recorded");
    },
    saveAddress: (o: Order, address: Address) => {
      patch(o, { address }, "Address edited");
      toast("Address updated");
    },
    addNote: (o: Order, text: string) => {
      set("meta", (prev) => {
        const m = prev[o.id] ?? emptyMeta(o.id);
        return { ...prev, [o.id]: { ...m, notes: [{ at: new Date().toISOString(), by: session.name, text }, ...m.notes] } };
      });
      log("Order", o.id, "Note added");
    },
    meta: (id: string) => d.meta[id],
  };
}
