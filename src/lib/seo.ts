// Set NEXT_PUBLIC_SITE_URL to the real address (for example https://rupaari.in) in the hosting settings.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://rupaari.in").replace(/\/$/, "");
export const abs = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
