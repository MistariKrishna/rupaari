import { RETURN_WINDOW_DAYS } from "./checkout";

export interface Faq { q: string; a: string; link?: { href: string; label: string } }
export const faqGroups: { title: string; items: Faq[] }[] = [
  { title: "Orders and account", items: [
    { q: "Do I need an account to order?", a: "Yes. An account lets us confirm your order and lets you track it, see its details and request a return.", link: { href: "/signup", label: "Create an account" } },
    { q: "How do I track my order?", a: "Go to Track an order, enter your order number and the email or mobile number you used, and you will see its status.", link: { href: "/account/track", label: "Track an order" } },
    { q: "Can I change or cancel an order?", a: "Write to us as soon as you can, before the order is packed, and we will do our best to change or cancel it. Once it has shipped it can only be returned." },
    { q: "Where can I see my invoice?", a: "Open My orders, choose the order and use Download invoice.", link: { href: "/account/orders", label: "My orders" } },
  ] },
  { title: "Delivery", items: [
    { q: "How long does delivery take?", a: "Within India, orders usually arrive in 4 to 7 days. International orders take 9 to 14 days. You will see the expected dates on the order page." },
    { q: "How much is shipping?", a: "The shipping charge for your address is shown at checkout before you pay." },
    { q: "Do you deliver outside India?", a: "Yes. Enter your country at checkout. Cash on delivery and UPI are available for India only." },
  ] },
  { title: "Returns and refunds", items: [
    { q: "What is your return window?", a: `You can request a return within ${RETURN_WINDOW_DAYS} days of delivery. The item must be unworn, unwashed and have its tags.` },
    { q: "Can I exchange a piece?", a: "Yes. Each order has one free exchange for a piece of equal or higher value. Choose Exchange when you request the return." },
    { q: "Which items cannot be returned?", a: "Customised, altered and made-to-order pieces, and items marked non-returnable on their page." },
    { q: "When will I get my refund?", a: "It goes back to your original payment method after we receive and check the item. You can follow each step in Returns and refunds.", link: { href: "/account/returns", label: "Returns and refunds" } },
  ] },
  { title: "Products and care", items: [
    { q: "Is the colour exactly as in the photos?", a: "We photograph in natural light, but screens differ. Silk can look slightly different in person. Slight variation in colour is natural in handloom." },
    { q: "How do I care for my saree or kurti?", a: "Dry clean silks, store them wrapped in soft cotton, and air them before folding. The care guide has the details.", link: { href: "/care", label: "Care guide" } },
    { q: "How can I be sure the silk is pure?", a: "We label fabric and zari honestly and show Silk Mark, Handloom Mark or GI tag only where a piece holds it.", link: { href: "/authenticity", label: "Authenticity promise" } },
    { q: "Do you offer a consultation?", a: "Yes, for bridal and gifting choices, by video, phone or a visit.", link: { href: "/consultation", label: "Book a consultation" } },
  ] },
];
