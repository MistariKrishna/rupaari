// A customer is identified by email (default) or by mobile number with a country code.

export interface Ident {
  mode: "email" | "phone";
  email: string;
  dial: string;
  phone: string;
}
export const emptyIdent = (dial = "+1"): Ident => ({ mode: "email", email: "", dial, phone: "" });

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isLocalPhone = (v: string) => /^\d{6,14}$/.test(v);

/** Normalised id ("name@site.com" or "+447700900123"), or "" when the entry isn't valid yet. */
export const identValue = (i: Ident) =>
  i.mode === "email" ? (isEmail(i.email) ? i.email.trim().toLowerCase() : "") : isLocalPhone(i.phone) ? `${i.dial}${i.phone}` : "";

export const maskId = (id: string) => {
  if (!id) return "";
  if (id.includes("@")) {
    const [u, d] = id.split("@");
    return `${u.slice(0, 1)}•••@${d}`;
  }
  return `•••••• ${id.slice(-4)}`;
};
export const idNoun = (id: string) => (id.includes("@") ? "email" : "mobile number");
