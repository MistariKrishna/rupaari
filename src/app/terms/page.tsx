import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = { title: "Terms and conditions" };

export default function Page() {
  return (
    <InfoPage eyebrow="Policy" title="Terms and conditions" intro="The rules for using this website and buying from RUPAARI." updated="26 November 2026">
      <section className="info-sec"><h2>Using the site</h2><p>By using this website you agree to these terms. You must give correct details and keep your sign-in private.</p></section>
      <section className="info-sec"><h2>Products and prices</h2><ul>
        <li>Colours may look different on different screens. Handwoven pieces can vary slightly.</li>
        <li>Prices are shown in rupees and may change. The price you pay is the one at checkout.</li>
        <li>We may cancel an order if an item is out of stock or a price was shown wrongly, and we will refund you in full.</li>
      </ul></section>
      <section className="info-sec"><h2>Orders and payment</h2><p>An order is confirmed when you receive the order confirmation. You need an account to place an order.</p></section>
      <section className="info-sec"><h2>Shipping and returns</h2><p>These are set out in our <Link href="/shipping-returns">shipping and returns policy</Link>.</p></section>
      <section className="info-sec"><h2>Our content</h2><p>The text, photos and designs on this site belong to RUPAARI. Please do not copy or reuse them without our written permission.</p></section>
      <section className="info-sec"><h2>Changes</h2><p>We may update these terms. The date at the top shows the latest version.</p></section>
      <p className="info-end">Questions? <Link href="/contact">Contact us</Link>.</p>
    </InfoPage>
  );
}