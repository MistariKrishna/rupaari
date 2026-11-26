"use client";

import { useId, type ReactNode } from "react";

export type BrandName = "instagram" | "facebook" | "whatsapp" | "youtube" | "pinterest" | "linkedin";

const PHONE = "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z";

/** Solid brand marks in the current text colour (footer, menu). 24x24 grid. */
export function BrandIcon({ name, className = "" }: { name: BrandName; className?: string }) {
  const id = useId();
  let body: ReactNode;
  switch (name) {
    case "instagram":
      body = <path fillRule="evenodd" d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3zm0 1.8A2.7 2.7 0 0 0 4.8 7.5v9a2.7 2.7 0 0 0 2.7 2.7h9a2.7 2.7 0 0 0 2.7-2.7v-9a2.7 2.7 0 0 0-2.7-2.7zM12 7.4a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2zm0 1.8a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6zM17.2 6a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z" />;
      break;
    case "facebook":
      body = (
        <>
          <mask id={id}>
            <rect width="24" height="24" fill="#fff" />
            <path fill="#000" d="M13.4 21.5v-7.3h2.4l.4-2.900h-2.800V9.500c0-.8.300-1.400 1.400-1.400h1.500V5.600c-.3 0-1.200-.1-2.200-.1-2.200 0-3.700 1.300-3.700 3.800v2.100H8v2.900h2.400v7.200z" />
          </mask>
          <circle cx="12" cy="12" r="10" mask={`url(#${id})`} />
        </>
      );
      break;
    case "youtube":
      body = <path fillRule="evenodd" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3z" />;
      break;
    case "linkedin":
      body = <path fillRule="evenodd" d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm3 3.7a1.35 1.35 0 1 0 0 2.7 1.35 1.35 0 0 0 0-2.7zM6.8 10.5V17h2.4v-6.5zm4 0V17h2.4v-3c0-1 .6-1.6 1.5-1.6.8 0 1.1.6 1.1 1.5V17h2.4v-3.7c0-2.1-.9-3.3-2.9-3.3-1 0-1.800.4-2.200 1.100v-.9z" />;
      break;
    case "whatsapp":
      body = (
        <>
          <mask id={id}>
            <rect width="24" height="24" fill="#fff" />
            <path d={PHONE} fill="#000" transform="translate(6.1 6.1) scale(.5)" />
          </mask>
          <path mask={`url(#${id})`} d="M12 2.5a9.5 9.5 0 0 0-8.2 14.3L2.5 21.5l4.8-1.2A9.5 9.5 0 1 0 12 2.5z" />
        </>
      );
      break;
    case "pinterest":
      body = (
        <>
          <mask id={id}>
            <rect width="24" height="24" fill="#fff" />
            <path d="M11.1 17.6l1.4-6M9.7 13.4c-.8-2.300.5-4.700 2.900-4.700 1.800 0 2.800 1.200 2.600 2.800-.2 1.700-1.200 2.900-2.400 2.900-.9 0-1.400-.7-1.200-1.600" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </mask>
          <circle cx="12" cy="12" r="9.5" mask={`url(#${id})`} />
        </>
      );
      break;
  }
  return (
    <svg className={`bi ${className}`.trim()} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      {body}
    </svg>
  );
}

/** Sign-in provider marks (full colour). */
export function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`bi ${className}`.trim()} viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573A8.9965 8.9965 0 0 0 0 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z" />
      <path fill="#EA4335" d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z" />
    </svg>
  );
}

export function AppleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`bi ${className}`.trim()} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M16.6 12.6c0-2.3 1.9-3.4 2-3.5-1.100-1.600-2.800-1.800-3.400-1.800-1.400-.1-2.800.9-3.500.9-.7 0-1.800-.8-3-.8-1.500 0-3 .9-3.800 2.300-1.600 2.800-.4 7 1.200 9.300.8 1.100 1.700 2.400 2.900 2.300 1.200 0 1.600-.7 3-.7s1.800.7 3 .7c1.300 0 2.100-1.100 2.800-2.300.9-1.300 1.300-2.500 1.300-2.600-.1 0-2.500-1-2.500-3.800zM14.300 5.800c.6-.8 1.100-1.900.9-3-.9 0-2.100.6-2.700 1.400-.6.700-1.100 1.800-1 2.900 1.100.1 2.200-.5 2.800-1.300z" />
    </svg>
  );
}

export function FacebookRoundIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`bi ${className}`.trim()} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10.5" fill="#1877F2" />
      <path fill="#fff" d="M13.6 20.5v-6.9h2.3l.4-2.800h-2.700V9.1c0-.8.3-1.400 1.400-1.400h1.400V5.200c-.3 0-1.100-.1-2.100-.1-2.100 0-3.500 1.300-3.500 3.600v2.100H8.500v2.800h2.300v6.900z" />
    </svg>
  );
}
