"use client";

import { usePathname } from "next/navigation";
import CollectionsFooter from "./CollectionsFooter";
import Footer from "./Footer";

/** Collection pages use the footer from the approved collection design; every other page keeps the existing footer. */
export default function SiteFooter() {
  const pathname = usePathname();
  return pathname.startsWith("/collections") ? <CollectionsFooter /> : <Footer />;
}