import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "@/components/InfoPage";
import { RETURN_WINDOW_DAYS } from "@/lib/checkout";

export const metadata: Metadata = { title: "Shipping and returns" };

export default function Page() {
  return (
    <InfoPage eyebrow="Policy" title="Shipping and returns" intro="How your order reaches you, and how to send it back.">
      <section className="info-sec">
        <h2>Shipping</h2>
        <ul>
          <li>We ship across India and to many countries abroad.</li>
          <li>Within India, delivery usually takes 4 to 7 days. International delivery takes 9 to 14 days.</li>
          <li>The shipping charge is shown at checkout, before you pay.</li>
          <li>You will see the status of your order under <Link href="/account/track">Track an order</Link>.</li>
          <li>Cash on delivery and UPI are available for addresses in India only.</li>
          <li>Customs duties and taxes for international orders are paid by the buyer, if the destination country charges them.</li>
        </ul>
      </section>
      <section className="info-sec">
        <h2>Returns</h2>
        <ul>
          <li>You can request a return within {RETURN_WINDOW_DAYS} days of delivery.</li>
          <li>The item must be unworn, unwashed and have its tags and packaging.</li>
          <li>Customised, altered and made-to-order pieces, and items marked non-returnable, cannot be returned.</li>
          <li>Request a return from <Link href="/account/orders">My orders</Link>. Once approved, we arrange the pickup.</li>
        </ul>
      </section>
      <section className="info-sec">
        <h2>Refunds</h2>
        <ul>
          <li>Refunds are made to your original payment method after we receive and check the item.</li>
          <li>Follow each step under <Link href="/account/returns">Returns and refunds</Link>.</li>
          <li>The shipping charge is not refunded unless the item was damaged or wrong.</li>
        </ul>
      </section>
      <section className="info-sec">
        <h2>Damaged or wrong item</h2>
        <p>Photograph the item and its packaging and write to us within 48 hours of delivery. We will replace it or refund you.</p>
      </section>
      <p className="info-end">Questions? <Link href="/contact">Contact us</Link>.</p>
    </InfoPage>
  );
}