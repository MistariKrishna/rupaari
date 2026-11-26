import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "@/components/InfoPage";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Visit us", description: "Where to find RUPAARI, and how to see the sarees in person." };

export default function Page() {
  const { address, phone, email } = site.contact;
  return (
    <InfoPage eyebrow="Visit" title="Visit us" intro="See the silk in person, with a cup of tea.">
      {address ? (
        <section className="info-sec">
          <h2>Our studio</h2>
          <p>{address}</p>
          <p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer">Open in Google Maps</a></p>
          {phone && <p>Phone: {phone}</p>}
          {email && <p>Email: {email}</p>}
          <p>Please <Link href="/consultation">book a visit</Link> so we can keep the pieces you want to see ready.</p>
        </section>
      ) : (
        <section className="info-sec">
          <h2>Studio details coming soon</h2>
          <p>We are preparing a space where you can see and feel the sarees. Until then, you can meet us on a video call, or ask us anything.</p>
          <ul>
            <li><Link href="/consultation">Book a video consultation</Link></li>
            <li><Link href="/waitlist">Join the waitlist</Link> to hear when the studio opens</li>
            <li><Link href="/contact">Contact us</Link></li>
          </ul>
        </section>
      )}
    </InfoPage>
  );
}
