import { STAGES, type Order, type OrderItem } from "@/lib/orders";
import { RETURN_WINDOW_DAYS } from "@/lib/checkout";
import type { OrderMeta, TimelineEntry } from "./types";

export type StatusLabel = (typeof STAGES)[number] | "Cancelled";
export const STATUS_FILTERS: StatusLabel[] = [...STAGES, "Cancelled"];

export const statusOf = (o: Order, m?: OrderMeta): StatusLabel => (m?.cancelled ? "Cancelled" : STAGES[o.stage]);
export const hasReturn = (o: Order) => o.items.some((i) => !!i.return);
export const isClosed = (o: Order) => o.stage === 4 && !!o.deliveredAt && Date.now() - new Date(o.deliveredAt).getTime() > RETURN_WINDOW_DAYS * 86_400_000;

export const payStatus = (o: Order, m?: OrderMeta) => {
  if (m?.cancelled) return o.payment === "cod" ? "Cancelled" : m.refunded ? "Refunded" : "Refund due";
  if (o.payment === "cod") return o.stage === 4 ? "COD collected" : "COD pending";
  return "Paid";
};
export const gstOf = (o: Order, rate = 5) => Math.round((o.total * rate) / (100 + rate));
export const itemCount = (o: Order) => o.items.reduce((a, i) => a + i.qty, 0);

/** Next stage button label for an order, or null when nothing is allowed. */
export const NEXT_LABEL: Record<number, string> = { 0: "Mark as packed", 1: "Mark as shipped", 2: "Out for delivery", 3: "Mark as delivered" };

export const entry = (label: string, by: string, note?: string): TimelineEntry => ({ at: new Date().toISOString(), label, by, note });
export const emptyMeta = (id: string): OrderMeta => ({ id, notes: [], timeline: [] });

/** Timeline for display: always starts with the placed event even for orders made on the storefront. */
export const timelineOf = (o: Order, m?: OrderMeta): TimelineEntry[] => {
  const base: TimelineEntry[] = [{ at: o.placedAt, label: "Order placed", by: o.address.name }];
  const have = m?.timeline ?? [];
  const hasConfirm = have.some((t) => t.label === "Confirmed");
  const all = [...base, ...(hasConfirm ? [] : [{ at: o.placedAt, label: "Confirmed", by: "System" }]), ...have.filter((t) => t.label !== "Order placed")];
  return all.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
};

export const returnItems = (o: Order): OrderItem[] => o.items.filter((i) => !!i.return);

/* return rows are addressed as orderId~productId~size */
export const retId = (o: Order, i: OrderItem) => `${o.id}~${i.id}~${i.size ?? ""}`;
export const parseRetId = (s: string) => {
  const [orderId, itemId, size] = decodeURIComponent(s).split("~");
  return { orderId, itemId, size: size || undefined };
};
