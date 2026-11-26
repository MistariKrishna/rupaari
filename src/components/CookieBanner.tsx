"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getConsent, setConsent } from "@/lib/analytics";

/** Asks once for permission to use analytics cookies (DPDP Act: clear consent, easy to refuse). */
export default function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => setShow(getConsent() === null), []);
  if (!show) return null;
  const choose = (v: "all" | "necessary") => { setConsent(v); setShow(false); };
  return (
    <div className="ck-banner" role="dialog" aria-label="Cookies" aria-live="polite">
      <p>We use a few cookies to keep the site working and, if you agree, to understand how it is used. Read our <Link href="/privacy">privacy policy</Link>.</p>
      <div>
        <button type="button" className="btn btn-secondary" onClick={() => choose("necessary")}>Only necessary</button>
        <button type="button" className="btn" onClick={() => choose("all")}>Accept all</button>
      </div>
    </div>
  );
}
