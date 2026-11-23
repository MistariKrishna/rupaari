"use client";

import { usePathname } from "next/navigation";
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
  if (path === "/admin" || path.startsWith("/admin/")) return <main id="main">{children}</main>;
  return (
    <>
      <Preloader />
      <PageTransition />
      <SmoothScroll />
      <Header />
      <main id="main">{children}</main>
      <SiteFooter />
      <MobileNav />
      <BagDrawer />
    </>
  );
}
