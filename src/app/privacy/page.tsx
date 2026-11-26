import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "@/components/InfoPage";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy policy" };

export default function Page() {
  return (
    <InfoPage eyebrow="Policy" title="Privacy policy" intro="What we collect, why, and the choices you have." updated="26 November 2026">
      <section className="info-sec"><h2>What we collect</h2><ul>
        <li>Account details: your name, and the email or mobile number you sign in with.</li>
        <li>Order details: items, delivery address and phone number, so we can deliver and support your order.</li>
        <li>Messages you send us through the contact, consultation and newsletter forms.</li>
      </ul></section>
      <section className="info-sec"><h2>How we use it</h2><ul>
        <li>To process, deliver and support your orders, and to send order messages.</li>
        <li>To answer your questions and bookings.</li>
        <li>To send our newsletter, only if you subscribe. You can unsubscribe at any time.</li>
      </ul></section>
      <section className="info-sec"><h2>Sharing</h2><p>We share details only with the partners needed to serve you, such as couriers and payment providers. We do not sell your personal information.</p></section>
      <section className="info-sec"><h2>Your choices</h2><p>You can view and update your details in <Link href="/account/profile">My profile</Link>. To have your data corrected or deleted, write to us.</p></section>
      <section className="info-sec"><h2>Contact</h2><p>{site.contact.email ? <>Write to {site.contact.email}.</> : <>Use our <Link href="/contact">contact page</Link>.</>}</p></section>
    </InfoPage>
  );
}