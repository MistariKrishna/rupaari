// Analytics hooks. Nothing loads until the visitor accepts cookies and an ID is set in the hosting settings:
//   NEXT_PUBLIC_GA_ID (GA4, like G-XXXXXXXXXX), NEXT_PUBLIC_META_PIXEL_ID, NEXT_PUBLIC_CLARITY_ID
export const CONSENT_KEY = "rupaari.consent";
export const consentEvent = "rupaari:consent";
export type Consent = "all" | "necessary" | null;

export const getConsent = (): Consent => {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "all" || v === "necessary" ? v : null;
  } catch {
    return null;
  }
};
export const setConsent = (v: "all" | "necessary") => {
  try {
    localStorage.setItem(CONSENT_KEY, v);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(consentEvent));
};

type W = Window & { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };
const META: Record<string, string> = { add_to_cart: "AddToCart", purchase: "Purchase", begin_checkout: "InitiateCheckout", view_item: "ViewContent", sign_up: "CompleteRegistration", generate_lead: "Lead" };

/** Record a shopping event. Does nothing unless analytics is loaded. */
export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || getConsent() !== "all") return;
  const w = window as W;
  try {
    w.gtag?.("event", event, params);
    if (META[event]) w.fbq?.("track", META[event], params.value !== undefined ? { value: params.value, currency: params.currency ?? "INR" } : undefined);
  } catch {
    /* never break the page for analytics */
  }
}
