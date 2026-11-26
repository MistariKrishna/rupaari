import { getSavedAddress, type Address } from "./orders";

/** An address in the customer's address book. */
export interface SavedAddress extends Address {
  id: string;
  label: string;
  isDefault: boolean;
}
const KEY = "rupaari.addresses";
const EVT = "rupaari:addresses";
export const addressEvent = EVT;

type Book = Record<string, SavedAddress[]>;
const read = (): Book => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "{}");
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Book) : {};
  } catch {
    return {};
  }
};
const write = (b: Book) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(b));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVT));
};
const same = (a: Address, b: Address) => a.line1.trim().toLowerCase() === b.line1.trim().toLowerCase() && a.pin.trim() === b.pin.trim() && a.name.trim().toLowerCase() === b.name.trim().toLowerCase();
const newId = () => `ad-${Date.now().toString(36)}${Math.floor(Math.random() * 1000).toString(36)}`;

/** The customer's addresses. The single address saved earlier from checkout or the profile page is brought in as the first one. */
export function loadAddresses(userId: string): SavedAddress[] {
  const list = read()[userId];
  if (list && list.length) return list;
  const legacy = getSavedAddress();
  if (legacy && legacy.line1) return [{ ...legacy, id: "ad-legacy", label: "Home", isDefault: true }];
  return [];
}
export function saveAddresses(userId: string, list: SavedAddress[]) {
  const fixed = list.length && !list.some((a) => a.isDefault) ? list.map((a, i) => ({ ...a, isDefault: i === 0 })) : list;
  write({ ...read(), [userId]: fixed });
}
export function upsertAddress(userId: string, a: Address & { id?: string; label?: string; makeDefault?: boolean }) {
  const list = loadAddresses(userId);
  const { id, label, makeDefault, ...addr } = a;
  const hit = list.find((x) => (id ? x.id === id : same(x, addr)));
  let next: SavedAddress[];
  if (hit) next = list.map((x) => (x.id === hit.id ? { ...x, ...addr, label: label ?? x.label } : x));
  else next = [...list, { ...addr, id: newId(), label: label ?? (list.length ? "Other" : "Home"), isDefault: false }];
  if (makeDefault || !next.some((x) => x.isDefault)) {
    const target = hit?.id ?? next[next.length - 1].id;
    next = next.map((x) => ({ ...x, isDefault: x.id === target }));
  }
  saveAddresses(userId, next);
}
export const removeAddress = (userId: string, id: string) => saveAddresses(userId, loadAddresses(userId).filter((a) => a.id !== id));
export const setDefaultAddress = (userId: string, id: string) => saveAddresses(userId, loadAddresses(userId).map((a) => ({ ...a, isDefault: a.id === id })));
