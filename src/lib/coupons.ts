// Coupons and offers. The codes are the ones set up in the admin (Offers); until the admin has been opened, a few defaults apply.
// The code a shopper applies is remembered on this device, and checked again whenever the bag total changes.
import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { Coupon } from "./admin/types";
import { money } from "./products";

const APPLIED = "rupaari.coupon";
const ADMIN_COUPONS = "rupaari.admin.coupons";
const EVENT = "rupaari:coupon";

const base = { startsAt: "", endsAt: "", usageLimit: "" as const, perCustomerLimit: "" as const, active: true, used: 0, maxDiscount: "" as const };
const DEFAULTS: Coupon[] = [
  { ...base, id: "d1", code: "WELCOME10", type: "percent", value: 10, minBag: 5000, maxDiscount: 2000 },
  { ...base, id: "d2", code: "FESTIVE20", type: "percent", value: 20, minBag: 15000, maxDiscount: 5000 },
  { ...base, id: "d3", code: "FREESHIP", type: "free_shipping", value: 0, minBag: 20000 },
];

export function listCoupons(): Coupon[] {
  try {
    const raw = window.localStorage.getItem(ADMIN_COUPONS);
    if (raw) return JSON.parse(raw) as Coupon[];
  } catch {
    /* use the defaults */
  }
  return DEFAULTS;
}

const today = () => new Date().toISOString().slice(0, 10);
const num = (v: number | "") => (v === "" || !Number.isFinite(Number(v)) ? 0 : Number(v));
const live = (c: Coupon) => c.active && (!c.startsAt || c.startsAt <= today()) && (!c.endsAt || c.endsAt >= today()) && (!num(c.usageLimit) || c.used < num(c.usageLimit));

/** Offers a shopper can see and use right now. */
export const liveOffers = (): Coupon[] => listCoupons().filter(live);

export function describe(c: Coupon): string {
  const min = num(c.minBag) ? ` on orders over ${money(num(c.minBag))}` : "";
  if (c.type === "free_shipping") return `Free delivery${min}`;
  if (c.type === "flat") return `${money(c.value)} off${min}`;
  const cap = num(c.maxDiscount) ? `, up to ${money(num(c.maxDiscount))}` : "";
  return `${c.value}% off${min}${cap}`;
}

export interface CouponResult {
  ok: boolean;
  message: string;
  coupon?: Coupon;
  discount: number;
  freeShip: boolean;
}

export function evaluate(code: string, subtotal: number): CouponResult {
  const none = { discount: 0, freeShip: false };
  const c = listCoupons().find((x) => x.code.toLowerCase() === code.trim().toLowerCase());
  if (!c) return { ok: false, message: "This code isn't valid.", ...none };
  if (!c.active) return { ok: false, message: "This offer isn't running right now.", ...none };
  if (c.startsAt && c.startsAt > today()) return { ok: false, message: "This offer hasn't started yet.", ...none };
  if (c.endsAt && c.endsAt < today()) return { ok: false, message: "This offer has ended.", ...none };
  if (num(c.usageLimit) && c.used >= num(c.usageLimit)) return { ok: false, message: "This offer has been fully claimed.", ...none };
  const min = num(c.minBag);
  if (subtotal < min) return { ok: false, message: `Add ${money(min - subtotal)} more to use ${c.code}.`, coupon: c, ...none };
  if (c.type === "free_shipping") return { ok: true, message: "Free delivery applied.", coupon: c, discount: 0, freeShip: true };
  const raw = c.type === "flat" ? c.value : (subtotal * c.value) / 100;
  const cap = num(c.maxDiscount);
  const discount = Math.max(0, Math.min(Math.round(cap ? Math.min(raw, cap) : raw), subtotal));
  return { ok: true, message: `${c.code} applied. You save ${money(discount)}.`, coupon: c, discount, freeShip: false };
}

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
};
const readApplied = () => {
  try {
    return window.localStorage.getItem(APPLIED) ?? "";
  } catch {
    return "";
  }
};

/** The applied coupon for a bag total: `apply` checks a code and keeps it only if it works. */
export function useCoupon(subtotal: number) {
  const code = useSyncExternalStore(subscribe, readApplied, () => "");
  const result = useMemo(() => (code ? evaluate(code, subtotal) : null), [code, subtotal]);
  const apply = useCallback(
    (input: string): CouponResult => {
      const r = evaluate(input, subtotal);
      if (r.ok && r.coupon) {
        try {
          window.localStorage.setItem(APPLIED, r.coupon.code);
        } catch {
          /* kept for this visit only */
        }
        window.dispatchEvent(new Event(EVENT));
      }
      return r;
    },
    [subtotal],
  );
  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(APPLIED);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  const ok = !!result?.ok;
  return { code, result, apply, remove, discount: ok ? result!.discount : 0, freeShip: ok && result!.freeShip };
}

/** After an order is placed: count the use in the admin and clear the applied code. */
export function consumeCoupon(code: string) {
  try {
    const list = listCoupons().map((c) => (c.code.toLowerCase() === code.toLowerCase() ? { ...c, used: c.used + 1 } : c));
    if (window.localStorage.getItem(ADMIN_COUPONS)) window.localStorage.setItem(ADMIN_COUPONS, JSON.stringify(list));
    window.localStorage.removeItem(APPLIED);
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}