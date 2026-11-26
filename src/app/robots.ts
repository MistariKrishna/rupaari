import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/checkout", "/bag", "/order-confirmation", "/login", "/signup", "/forgot-password"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
