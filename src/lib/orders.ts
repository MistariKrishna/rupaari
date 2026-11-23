import type { Tone } from "./content";
import { getProduct } from "./products";
import { RETURN_WINDOW_DAYS } from "./checkout";

export type ReturnStatus = "requested" | "approved" | "picked-up" | "received" | "refunded";
export const RETURN_STEPS: ReturnStatus[] = ["requested", "approved", "picked-up", "received", "refunded"];

export interface ReturnInfo {
  status: ReturnStatus;
  reason: string;
  details: string;
  photos: string[];
  requestedAt: string;
  pickupDate?: string;
  pickedUpAt?: string;
  receivedAt?: string;
  refundedAt?: string;
}
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  colour: string;
  /** kurtis only */
  size?: string;
  tone: Tone;
  nonReturnable?: boolean;
  return?: ReturnInfo;
}
export interface Address {
  name: string;
  line1: string;
  area: string;
  pin: string;
  city: string;
  state: string;
  country: string;
  /** optional, for courier delivery updates */
  phone?: string;
}
export type PayMethod = "upi" | "card" | "cod";
export interface Order {
  id: string;
  placedAt: string;
  /** index into STAGES; 4 = delivered */
  stage: number;
  deliveredAt?: string;
  items: OrderItem[];
  address: Address;
  /** email or +country-code mobile number the order was placed with */
  contact: string;
  payment: PayMethod;
  subtotal: number;
  shipping: number;
  total: number;
  gift?: string;
}

export const STAGES = ["Confirmed", "Packed", "Shipped", "Out for delivery", "Delivered"] as const;
export const PAY_LABEL: Record<PayMethod, string> = { upi: "UPI", card: "Credit or debit card", cod: "Cash on delivery" };
export const RETURN_REASONS = ["Item arrived damaged", "Wrong item received", "Not as described", "Colour differs from the photographs", "Other"];

const COLOURWAY: Record<string, string> = {
  burgundy: "Burgundy & Gold",
  wine: "Wine & Gold",
  ivory: "Ivory & Gold",
  gold: "Gold & Crimson",
  taupe: "Taupe & Gold",
};
export const colourway = (tone: string) => COLOURWAY[tone] ?? "Gold";

/* ---------- storage (this device only) ---------- */
const KEY = "rupaari.orders.v1";
const EVT = "rupaari:orders";
export const loadOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as (Order & { phone?: string })[]) : [];
    // earlier versions saved `phone` (Indian mobile); keep those orders readable
    return Array.isArray(list) ? list.map((o) => ({ ...o, contact: o.contact ?? (o.phone ? `+91${o.phone}` : "") })) : [];
  } catch {
    return [];
  }
};
export const saveOrders = (orders: Order[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(orders));
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event(EVT));
};
export const orderEvent = EVT;
export const nextOrderId = (orders: Order[]) => {
  const n = orders.reduce((m, o) => Math.max(m, parseInt(o.id.replace(/\D/g, ""), 10) || 0), 10482);
  return `RP-${n + 1}`;
};

/* gift wrap choice carried from the bag to checkout */
const GIFT = "rupaari.gift";
export const getGift = (): { on: boolean; message: string } => {
  try {
    return JSON.parse(localStorage.getItem(GIFT) || "") as { on: boolean; message: string };
  } catch {
    return { on: false, message: "" };
  }
};
export const setGift = (g: { on: boolean; message: string }) => {
  try {
    localStorage.setItem(GIFT, JSON.stringify(g));
  } catch {
    /* ignore */
  }
};

/* saved delivery address */
const ADDR = "rupaari.address";
export const getSavedAddress = (): Address | null => {
  try {
    return JSON.parse(localStorage.getItem(ADDR) || "null") as Address | null;
  } catch {
    return null;
  }
};
export const saveAddress = (a: Address) => {
  try {
    localStorage.setItem(ADDR, JSON.stringify(a));
  } catch {
    /* ignore */
  }
};

/* ---------- formatting ---------- */
export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
export const fmtShort = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
export const fmtTime = (iso: string) =>
  `${fmtDate(iso)} · ${new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }).toLowerCase()} IST`;

/* ---------- returns ---------- */
export type ReturnState = "active" | "pending-delivery" | "non-returnable" | "closed" | "eligible";
export const returnState = (o: Order, it: OrderItem): ReturnState => {
  if (it.return) return "active";
  if (o.stage < 4) return "pending-delivery";
  if (it.nonReturnable) return "non-returnable";
  const days = (Date.now() - new Date(o.deliveredAt ?? o.placedAt).getTime()) / 86_400_000;
  return days > RETURN_WINDOW_DAYS ? "closed" : "eligible";
};
export const refundAmount = (it: OrderItem) => (it.return?.status === "refunded" ? it.price * it.qty : 0);

/** A sample order so every screen can be reviewed in demo mode (/account/orders?seed=1). */
export const demoOrder = (id: string): Order => {
  const day = (d: number, h = 10, m = 0) => new Date(Date.UTC(2026, 10, d, h - 5, m - 30)).toISOString();
  const a = getProduct("ambika-korvai-kanjivaram");
  const t = getProduct("thamarai-temple-kanjivaram");
  return {
    id,
    placedAt: day(9),
    stage: 4,
    deliveredAt: day(11),
    items: [
      { id: "ambika-korvai-kanjivaram", name: a?.name ?? "Ambika Korvai Kanjivaram", price: a?.price ?? 62000, qty: 1, colour: "Gold & Crimson", tone: a?.tone ?? "burgundy" },
      { id: "thamarai-temple-kanjivaram", name: t?.name ?? "Thamarai Temple Kanjivaram", price: t?.price ?? 48500, qty: 1, colour: "Burgundy & Gold", tone: t?.tone ?? "wine", nonReturnable: true },
    ],
    address: { name: "Meera Rao", line1: "Flat 3, 18 Lotus Lane", area: "Ashok Nagar", pin: "560001", city: "Bengaluru", state: "Karnataka", country: "India" },
    contact: "meera.rao@example.com",
    payment: "cod",
    subtotal: (a?.price ?? 62000) + (t?.price ?? 48500),
    shipping: 150,
    total: (a?.price ?? 62000) + (t?.price ?? 48500) + 150,
  };
};

export const sameItem = (a: { id: string; size?: string }, b: { id: string; size?: string }) => a.id === b.id && (a.size ?? "") === (b.size ?? "");
export const itemKey = (it: { id: string; size?: string }) => `${it.id}|${it.size ?? ""}`;
/** "Gold & Crimson · Size M · Qty 1" */
export const itemMeta = (it: OrderItem) => [it.colour, it.size ? `Size ${it.size}` : "", `Qty ${it.qty}`].filter(Boolean).join(" · ");