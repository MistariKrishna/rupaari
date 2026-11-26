// Display currency for the storefront. Prices in the catalogue are stored in rupees (INR); other currencies are converted for display.
// Live rates are fetched in the browser (free, no key) and cached for 6 hours. If the fetch fails, the fallback rates below are used.
// Admin screens always show rupees.
export type Code = "INR" | "USD" | "GBP" | "EUR";
export const CURRENCIES: { code: Code; symbol: string; name: string; locale: string }[] = [
  { code: "INR", symbol: "₹", name: "Indian rupee", locale: "en-IN" },
  { code: "USD", symbol: "$", name: "US dollar", locale: "en-US" },
  { code: "GBP", symbol: "£", name: "British pound", locale: "en-GB" },
  { code: "EUR", symbol: "€", name: "Euro", locale: "en-IE" },
];

/** Used until live rates arrive, or when they cannot be fetched. Units of each currency for 1 rupee. Update these now and then. */
const FALLBACK: Record<Code, number> = { INR: 1, USD: 0.0113, GBP: 0.0085, EUR: 0.0098 };
const CODE_KEY = "rupaari.currency";
const RATE_KEY = "rupaari.currency.rates";
const MAX_AGE = 6 * 60 * 60 * 1000;
const RATE_URL = "https://open.er-api.com/v6/latest/INR";

let current: Code = "INR";
let rates: Record<Code, number> = { ...FALLBACK };
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export const currencyCode = () => current;
export const subscribeCurrency = (fn: () => void) => {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
};

const isCode = (v: unknown): v is Code => CURRENCIES.some((c) => c.code === v);

/** Call once in the browser: loads the saved currency and refreshes the rates when they are old. */
export function initCurrency() {
  try {
    const saved = localStorage.getItem(CODE_KEY);
    if (isCode(saved)) current = saved;
    const raw = JSON.parse(localStorage.getItem(RATE_KEY) || "null") as { at: number; r: Record<Code, number> } | null;
    if (raw && raw.r && [raw.r.USD, raw.r.GBP, raw.r.EUR].every((x) => typeof x === "number" && x > 0)) rates = { ...raw.r, INR: 1 };
    emit();
    if (!raw || Date.now() - raw.at > MAX_AGE) {
      fetch(RATE_URL)
        .then((r) => r.json())
        .then((j: { result?: string; rates?: Record<string, number> }) => {
          const r = j.rates;
          if (j.result !== "success" || !r || !(r.USD > 0 && r.GBP > 0 && r.EUR > 0)) return;
          rates = { INR: 1, USD: r.USD, GBP: r.GBP, EUR: r.EUR };
          try {
            localStorage.setItem(RATE_KEY, JSON.stringify({ at: Date.now(), r: rates }));
          } catch {
            /* ignore */
          }
          if (current !== "INR") emit();
        })
        .catch(() => {
          /* keep the cached or fallback rates */
        });
    }
  } catch {
    /* storage unavailable: stay on rupees */
  }
}

export function setCurrency(c: Code) {
  current = c;
  try {
    localStorage.setItem(CODE_KEY, c);
  } catch {
    /* ignore */
  }
  emit();
}

const inAdmin = () => typeof location !== "undefined" && location.pathname.startsWith("/admin");
export const fmtInr = (inr: number) => "₹" + Math.round(inr).toLocaleString("en-IN");

/** Format a price that is stored in rupees, in the selected currency. */
export function fmtMoney(inr: number): string {
  if (current === "INR" || inAdmin()) return fmtInr(inr);
  const c = CURRENCIES.find((x) => x.code === current)!;
  return new Intl.NumberFormat(c.locale, { style: "currency", currency: c.code, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(inr * rates[current]);
}
