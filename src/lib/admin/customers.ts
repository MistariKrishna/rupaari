import type { Order } from "@/lib/orders";
import type { CustMeta, Data } from "./types";

export interface Customer {
  id: string; // lower-case contact (email first)
  name: string;
  contact: string;
  country: string;
  orders: Order[];
  spent: number;
  last?: string;
  meta: CustMeta;
}
const blank = (id: string, name: string, country: string): CustMeta => ({ id, name, country, notes: [], consent: { email: false, sms: false, whatsapp: false, at: "" } });

/** Customers are the people who placed orders, merged with the notes and consent kept in the admin. */
export function deriveCustomers(d: Pick<Data, "orders" | "custMeta" | "meta">): Customer[] {
  const map = new Map<string, Customer>();
  const live = d.orders.filter((o) => !d.meta[o.id]?.cancelled);
  d.orders.forEach((o) => {
    const id = o.contact.trim().toLowerCase();
    if (!id) return;
    const meta = d.custMeta.find((m) => m.id === id) ?? blank(id, o.address.name, o.address.country);
    const cur = map.get(id) ?? { id, name: meta.name || o.address.name, contact: o.contact, country: meta.country || o.address.country, orders: [], spent: 0, meta };
    cur.orders.push(o);
    if (live.includes(o)) cur.spent += o.total;
    if (!cur.last || o.placedAt > cur.last) cur.last = o.placedAt;
    map.set(id, cur);
  });
  d.custMeta.forEach((m) => {
    if (!map.has(m.id)) map.set(m.id, { id: m.id, name: m.name, contact: m.id, country: m.country, orders: [], spent: 0, meta: m });
  });
  return [...map.values()].sort((a, b) => (b.last ?? "").localeCompare(a.last ?? ""));
}
export const customerBlank = blank;
