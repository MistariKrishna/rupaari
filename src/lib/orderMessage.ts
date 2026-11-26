import { PAY_LABEL, fmtDate, type Order } from "@/lib/orders";
import { money } from "@/lib/products";

/** The confirmation text a customer gets after placing an order. */
export function confirmationText(o: Order): string {
  const first = o.address.name.split(" ")[0] || "there";
  const lines = o.items.map((it) => `• ${it.name}${it.size ? ` (Size ${it.size})` : ""} × ${it.qty}`);
  return [
    `Hi ${first}, thank you for shopping with RUPAARI.`,
    `Your order #${o.id} is confirmed.`,
    "",
    ...lines,
    "",
    `Total: ${money(o.total)} (${PAY_LABEL[o.payment]})`,
    `Placed on ${fmtDate(o.placedAt)}`,
    `Delivering to: ${o.address.name}, ${o.address.city}, ${o.address.pin}`,
    "",
    "We will message you again when your order is packed and shipped.",
  ].join("\n");
}

const isEmail = (s: string) => s.includes("@");
const digits = (s: string) => s.replace(/[^\d]/g, "");

/** Opens WhatsApp (mobile number) or the mail app (email) with the message filled in. */
export function sendConfirmation(o: Order): "whatsapp" | "email" | "none" {
  const text = confirmationText(o);
  const phone = digits(isEmail(o.contact) ? o.address.phone ?? "" : o.contact);
  if (phone.length >= 10) {
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    return "whatsapp";
  }
  if (isEmail(o.contact)) {
    window.location.href = `mailto:${o.contact}?subject=${encodeURIComponent(`Order ${o.id} confirmed | RUPAARI`)}&body=${encodeURIComponent(text)}`;
    return "email";
  }
  return "none";
}
