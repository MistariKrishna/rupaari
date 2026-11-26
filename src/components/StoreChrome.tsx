"use client";

import { usePathname } from "next/navigation";
import { Fragment, useEffect } from "react";
import Analytics from "@/components/Analytics";
import CookieBanner from "@/components/CookieBanner";
import { initCurrency } from "@/lib/currency";
import { useCurrency } from "@/components/useCurrency";
import BagDrawer from "@/components/BagDrawer";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import PageTransition from "@/components/PageTransition";
import Preloader from "@/components/Preloader";
import SiteFooter from "@/components/SiteFooter";
import SmoothScroll from "@/components/SmoothScroll";

/** The storefront chrome (intro, curtain, header, footer, bag). The /admin back office renders bare, with its own shell. */
export default function StoreChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "";
  const cur = useCurrency();
  useEffect(() => initCurrency(), []);
  if (path === "/admin" || path.startsWith("/admin/")) return <main id="main">{children}</main>;
  return (
    <>
      <Preloader />
      <PageTransition />
      <SmoothScroll />
      <Fragment key={`h-${cur}`}><Header /></Fragment>
      <main id="main" key={`m-${cur}`}>{children}</main>
      <SiteFooter />
      <MobileNav />
      <CookieBanner />
      <Analytics />
      <Fragment key={`b-${cur}`}><BagDrawer /></Fragment>
    </>
  );
}
