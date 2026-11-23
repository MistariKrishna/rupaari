// Checkout rules in one place. Until a payments + SMS provider is connected, checkout runs in DEMO mode:
// any 6-digit code verifies, every payment method succeeds, orders are saved on this device only.
// To go live: set NEXT_PUBLIC_CHECKOUT_LIVE=true and replace the three functions below with real API calls.

export const DEMO = process.env.NEXT_PUBLIC_CHECKOUT_LIVE !== "true";
/** Placeholder shipping rates in rupees until real courier rates are connected. */
/** Shipping per country. Reads the zones set in the admin (Settings, Shipping zones) when present; otherwise the placeholder rates. */
export const shippingFor = (country: string) => {
  try {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem("rupaari.admin.settings");
      const zones = raw ? ((JSON.parse(raw) as { zones?: { name: string; countries: string; rate: number }[] }).zones ?? []) : [];
      const c = country.trim().toLowerCase();
      const hit = zones.find((z) => z.countries.toLowerCase().split(",").map((x) => x.trim()).includes(c)) ?? zones.find((z) => /^rest of/i.test(z.name));
      if (hit && Number.isFinite(Number(hit.rate))) return Number(hit.rate);
    }
  } catch {
    /* fall back to the placeholder rates */
  }
  return country === "India" ? 150 : 2500;
};
/** Cash on delivery and UPI only work for addresses in India. */
export const indiaOnly = (country: string) => country === "India";
export const RETURN_WINDOW_DAYS = 7;
/** Demo: this PIN is the one that is "not serviceable", so the unavailable state can be seen. */
const UNSERVICEABLE = ["560099"];

export type PinStatus = "" | "invalid" | "ok" | "unavailable";
/** India uses a 6-digit PIN; other countries a 3-10 character postal / ZIP code. */
export const checkPin = (country: string, code: string): PinStatus => {
  const c = code.trim();
  if (!c) return "";
  if (country === "India") {
    if (!/^[1-9]\d{5}$/.test(c)) return c.length < 6 ? "" : "invalid";
  } else if (!/^[A-Za-z0-9][A-Za-z0-9 -]{1,8}[A-Za-z0-9]$/.test(c)) {
    return c.length < 3 ? "" : "invalid";
  }
  return UNSERVICEABLE.includes(c) ? "unavailable" : "ok";
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function sendCode(_to: string): Promise<{ ok: boolean; message?: string }> {
  await wait(500);
  return DEMO ? { ok: true } : { ok: false, message: "Code sending isn't connected yet." };
}
export async function verifyCode(code: string): Promise<{ ok: boolean; message?: string }> {
  await wait(500);
  if (!DEMO) return { ok: false, message: "Code sending isn't connected yet." };
  return /^\d{6}$/.test(code) ? { ok: true } : { ok: false, message: "Enter the 6-digit code." };
}
export async function startPayment(_method: "upi" | "card", _amount: number): Promise<{ ok: boolean; message?: string }> {
  await wait(1100);
  return DEMO ? { ok: true } : { ok: false, message: "Online payments aren't connected yet." };
}
