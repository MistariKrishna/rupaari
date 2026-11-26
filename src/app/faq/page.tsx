import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "@/components/InfoPage";
import { RETURN_WINDOW_DAYS } from "@/lib/checkout";

export const metadata: Metadata = { title: "FAQs", description: "Answers about orders, delivery, returns and care." };

const groups: { title: string; items: [string, React.ReactNode][] }[] = [
  {
    title: "Orders and account",
    items: [
      ["Do I need an account to order?", <>Yes. An account lets us confirm your order and lets you track it, see its details and request a return. <Link href="/signup">Create one</Link> in a minute.</>],
      ["How do I track my order?", <>Go to <Link href="/account/track">Track an order</Link>, enter your order number and the email or mobile number you used, and you will see its status.</>],
      ["Can I change or cancel an order?", "Write to us as soon as you can, before the order is packed, and we will do our best to change or cancel it. Once it has shipped it can only be returned."],
      ["Where can I see my invoice?", <>Open <Link href="/account/orders">My orders</Link>, choose the order and use Download invoice.</>],
    ],
  },
  {
    title: "Delivery",
    items: [
      ["How long does delivery take?", "Within India, orders usually arrive in 4 to 7 days. International orders take 9 to 14 days. You will see the expected dates on the order page."],
      ["How much is shipping?", "The shipping charge for your address is shown at checkout before you pay."],
      ["Do you deliver outside India?", "Yes. Enter your country at checkout. Cash on delivery and UPI are available for India only."],
    ],
  },
  {
    title: "Returns and refunds",
    items: [
      ["What is your return window?", `You can request a return within ${RETURN_WINDOW_DAYS} days of delivery. The item must be unworn, unwashed and have its tags.`],
      ["Which items cannot be returned?", "Customised, altered and made-to-order pieces, and items marked non-returnable on their page."],
      ["When will I get my refund?", <>It goes back to your original payment method after we receive and check the item. Follow each step in <Link href="/account/returns">Returns and refunds</Link>.</>],
    ],
  },
  {
    title: "Products and care",
    items: [
      ["Is the colour exactly as in the photos?", "We photograph in natural light, but screens differ. Silk can look slightly different in person. Write to us if you would like more pictures."],
      ["How do I care for my saree or kurti?", <>Read our <Link href="/care">care guide</Link>. In short: dry clean silks, store them wrapped in soft cotton.</>],
      ["Do you offer a consultation?", <>Yes, for bridal and gifting choices. <Link href="/consultation">Book a consultation</Link>.</>],
    ],
  },
];

export default function Page() {
  return (
    <InfoPage eyebrow="Help" title="Frequently asked" intro="Quick answers. Cannot find yours? Write to us.">
      {groups.map((g) => (
        <section key={g.title} className="info-sec">
          <h2>{g.title}</h2>
          {g.items.map(([q, a]) => (
            <details key={q} className="faq">
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </section>
      ))}
      <p className="info-end">Still need help? <Link href="/contact">Contact us</Link>.</p>
    </InfoPage>
  );
}