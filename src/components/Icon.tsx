import type { ReactNode } from "react";

// Outline icon library (design system 04): 24x24 grid, 1.5px stroke, round ends.
const paths = {
  "arrow-right": <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="M5 12l5 5 9-10" />,
  warning: (<><path d="M12 4l9 16H3z" /><path d="M12 10v4.5M12 17h.01" /></>),
  instagram: (<><rect x="4" y="4" width="16" height="16" rx="4.5" /><circle cx="12" cy="12" r="3.6" /><path d="M16.8 7.2h.01" /></>),
  facebook: <path d="M14 8h2V4.5h-2.4C11.2 4.5 10 6 10 8.2V10H8v3.4h2V20h3.4v-6.6h2.3L16 10h-2.6V8.4c0-.3.2-.4.6-.4z" />,
  pinterest: (<><circle cx="12" cy="12" r="8.5" /><path d="M11 16.5l1.8-7.2M10.2 13.2c-.8-2.2.6-4.2 2.6-4.2 1.7 0 2.6 1.2 2.4 2.7-.2 1.6-1.2 2.7-2.3 2.7-.8 0-1.3-.6-1.1-1.4" /></>),
  linkedin: (<><rect x="4" y="4" width="16" height="16" rx="2.5" /><path d="M8.5 10.5V16M8.5 8h.01M11.5 16v-5.5M11.5 13c0-1.6 1-2.6 2.3-2.6 1.4 0 2.2.9 2.2 2.4V16" /></>),
  search: (<><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></>),
  user: (<><circle cx="12" cy="8.2" r="3.6" /><path d="M5 20c0-3.9 3.1-6.3 7-6.3s7 2.4 7 6.3" /></>),
  home: <path d="M4.5 10.5L12 4l7.5 6.5V19a1 1 0 0 1-1 1h-4v-5.5h-5V20h-4a1 1 0 0 1-1-1z" />,
  heart: <path d="M12 20s-7.5-4.5-7.5-10.1A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.5C19.5 15.5 12 20 12 20z" />,
  bag: (<><path d="M5 9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" /><path d="M9 7V6.5a3 3 0 0 1 6 0V7M9 11.5a3 3 0 0 0 6 0" /></>),
  "chevron-left": <path d="M14.5 6l-6 6 6 6" />,
  "chevron-right": <path d="M9.5 6l6 6-6 6" />,
  "chevron-up": <path d="M6 14.5l6-6 6 6" />,
  "arrow-left": <path d="M19 12H5M11 6l-6 6 6 6" />,
  sort: <path d="M8 19V5M4.5 8.5L8 5l3.5 3.5M16 5v14M12.5 15.5L16 19l3.5-3.5" />,
  gift: (<><rect x="4" y="9" width="16" height="4" rx="1" /><path d="M5.5 13v6.5a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V13M12 9v11.5" /><path d="M12 9c-1.4-3.2-5-3.6-5-1.6C7 9 9.6 9 12 9zm0 0c1.4-3.2 5-3.6 5-1.6C17 9 14.4 9 12 9z" /></>),
  location: (<><path d="M12 21s6-5.4 6-10.5a6 6 0 0 0-12 0C6 15.6 12 21 12 21z" /><circle cx="12" cy="10.5" r="2.2" /></>),
  calendar: (<><rect x="4" y="5.5" width="16" height="14.5" rx="2" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4M8 13.5h.01M12 13.5h.01M16 13.5h.01M8 16.5h.01M12 16.5h.01" /></>),
  info: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8h.01" /></>),
  share: (<><circle cx="6.5" cy="12" r="2.2" /><circle cx="17.5" cy="6" r="2.2" /><circle cx="17.5" cy="18" r="2.2" /><path d="M8.4 10.9l7.2-3.8M8.4 13.1l7.2 3.8" /></>),
  zoom: (<><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5M11 8.5v5M8.5 11h5" /></>),
  "chevron-down": <path d="M6 9.5l6 6 6-6" />,
  filter: (<><path d="M4 8h9M17 8h3M4 16h3M11 16h9" /><circle cx="15" cy="8" r="2" /><circle cx="9" cy="16" r="2" /></>),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  play: <path d="M8 5.5v13l10-6.5z" />,
  pause: <path d="M8.5 5.5v13M15.5 5.5v13" />,
  shield: (<><path d="M12 3.5l7 2.5v5.5c0 4.2-2.8 7.4-7 9-4.2-1.6-7-4.8-7-9V6z" /><path d="M9 12l2.2 2.2L15.5 10" /></>),
  return: (<><path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5" /><path d="M4.5 4.5v4h4" /></>),
  truck: (<><path d="M3 6.5h11v9H3zM14 9.5h3.8l2.2 2.8v3.2h-6" /><circle cx="7.5" cy="17.5" r="1.7" /><circle cx="16.5" cy="17.5" r="1.7" /></>),
  loom: <path d="M5 4v16M10 4v16M14 4v16M19 4v16M3 9h18M3 15h18" />,
} satisfies Record<string, ReactNode>;

// Names used in the design system (01 / Outline icon library) that map onto existing glyphs.
const aliases = { account: "user", wishlist: "heart", delivery: "truck" } as const;

export type IconName = keyof typeof paths | keyof typeof aliases;

export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    <svg className={`icon ${className}`.trim()} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {paths[(name in aliases ? aliases[name as keyof typeof aliases] : name) as keyof typeof paths]}
    </svg>
  );
}
