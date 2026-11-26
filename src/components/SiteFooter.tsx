"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isAuthPath } from "@/lib/site";
import CollectionsFooter from "./CollectionsFooter";

/** Full footer everywhere; a slim one on bag-to-order pages (checkout, orders, returns), as designed. */
export default function SiteFooter() {
  const path = usePathname();
  const slim = path.startsWith("/checkout") || path.startsWith("/account/") || path.startsWith("/order-confirmation");
  if (isAuthPath(path)) return null;
  if (!slim) return <CollectionsFooter />;
  return (
    <footer className="rp-slim">
      <div>
        <p>© 2026 RUPAARI</p>
        <nav aria-label="Legal">
          <Link href="/shipping-returns">Shipping &amp; returns</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms &amp; Conditions</Link>
        </nav>
        <p>India · INR ₹</p>
      </div>
    </footer>
  );
}