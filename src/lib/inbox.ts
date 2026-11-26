// Forms on the site (consultation, waitlist, gift cards, reviews, back-in-stock) save here, in this browser,
// until the backend exists. The admin "Enquiries" page reads the same keys.
export const INBOX = {
  consultations: "rupaari.consultations",
  waitlist: "rupaari.waitlist",
  giftcards: "rupaari.giftcards",
  reviews: "rupaari.reviews",
  notify: "rupaari.notify",
} as const;
export type InboxKey = (typeof INBOX)[keyof typeof INBOX];
export const inboxEvent = "rupaari:inbox";

export function readInbox<T = Record<string, unknown>>(key: InboxKey): T[] {
  try {
    const v = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
}
export function writeInbox<T>(key: InboxKey, list: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* storage full or unavailable */
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(inboxEvent));
}
export function pushInbox<T extends object>(key: InboxKey, item: T, prefix = "ID"): T & { id: string; at: string } {
  const full = { id: `${prefix}-${Date.now().toString().slice(-6)}`, at: new Date().toISOString(), ...item };
  writeInbox(key, [full, ...readInbox(key)]);
  return full;
}
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isPhone = (v: string) => v.replace(/\D/g, "").length >= 8;
