"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSite } from "@/lib/siteContent";

/** Applies the browser-tab icon chosen in the admin (Site content, Browser icon). Does nothing until one is set. */
export default function FaviconSync() {
  const icon = useSite().media["favicon"]?.image;
  const path = usePathname();
  useEffect(() => {
    if (!icon) return;
    document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]').forEach((l) => l.remove());
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = icon;
    document.head.appendChild(link);
  }, [icon, path]);
  return null;
}