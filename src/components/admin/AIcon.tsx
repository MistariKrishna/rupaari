import type { ReactNode } from "react";

// Admin icons share the storefront icon grid: 24x24, 1.5px stroke, round ends.
const P: Record<string, ReactNode> = {
  dashboard: (<><rect x="4" y="4" width="7" height="8" rx="1.5" /><rect x="13" y="4" width="7" height="5" rx="1.5" /><rect x="13" y="11" width="7" height="9" rx="1.5" /><rect x="4" y="14" width="7" height="6" rx="1.5" /></>),
  orders: (<><path d="M6 3.5h12v17l-3-1.8-3 1.8-3-1.8-3 1.8z" /><path d="M9 8.5h6M9 12h6" /></>),
  box: (<><path d="M4 8l8-4 8 4v8l-8 4-8-4z" /><path d="M4 8l8 4 8-4M12 12v8" /></>),
  return: (<><path d="M9 7L5 11l4 4" /><path d="M5 11h9a5 5 0 0 1 0 10h-3" /></>),
  users: (<><circle cx="9" cy="8.5" r="3.3" /><path d="M3 20c0-3.5 2.7-5.5 6-5.5s6 2 6 5.5" /><path d="M16 5.5a3.2 3.2 0 0 1 0 6M18 14.8c1.8.7 3 2.3 3 5.2" /></>),
  tag: (<><path d="M4 12.2V5a1 1 0 0 1 1-1h7.2a1 1 0 0 1 .7.3l7.3 7.3a1 1 0 0 1 0 1.4l-6.6 6.6a1 1 0 0 1-1.4 0L4.3 12.9a1 1 0 0 1-.3-.7z" /><circle cx="8.5" cy="8.5" r="1.2" /></>),
  layers: (<><path d="M12 4l8.5 4.5L12 13 3.5 8.5z" /><path d="M3.5 12.5L12 17l8.5-4.5M3.5 16.5L12 21l8.5-4.5" /></>),
  stock: (<><path d="M4 20V10M10 20V4M16 20v-7M21 20H3" /></>),
  percent: (<><path d="M19 5L5 19" /><circle cx="7.5" cy="7.5" r="2.3" /><circle cx="16.5" cy="16.5" r="2.3" /></>),
  chart: (<><path d="M4 4v16h16" /><path d="M8 15l3.5-4 3 2.5L19 8" /></>),
  settings: (<><circle cx="12" cy="12" r="3" /><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4L18 18M18 6l-1.6 1.6M7.6 16.4L6 18" /></>),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  search: (<><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></>),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  trash: (<><path d="M5 7h14M10 7V4.5h4V7M7 7l1 12.5h8L17 7" /><path d="M10.5 11v5M13.5 11v5" /></>),
  edit: (<><path d="M5 19l1-4L16.5 4.5a1.8 1.8 0 0 1 2.5 0l.5.5a1.8 1.8 0 0 1 0 2.5L9 18z" /><path d="M14.5 6.5l3 3" /></>),
  download: <path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14" />,
  upload: <path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 19.5h14" />,
  eye: (<><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.8" /></>),
  check: <path d="M5 12l5 5 9-10" />,
  "chevron-down": <path d="M6 9.5l6 6 6-6" />,
  "chevron-left": <path d="M14.5 6l-6 6 6 6" />,
  "chevron-right": <path d="M9.5 6l6 6-6 6" />,
  "arrow-left": <path d="M19 12H5M11 6l-6 6 6 6" />,
  "arrow-up": <path d="M12 19V5M6 11l6-6 6 6" />,
  "arrow-down": <path d="M12 5v14M6 13l6 6 6-6" />,
  logout: (<><path d="M10 4.5H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h4" /><path d="M15 8l4 4-4 4M19 12H9" /></>),
  external: <path d="M14 5h5v5M19 5l-8 8M17 14v4.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8.5a1 1 0 0 1 1-1H10" />,
  print: (<><path d="M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2" /><rect x="7" y="14" width="10" height="6" rx="1" /></>),
  drag: (<><circle cx="9" cy="7" r="1" /><circle cx="15" cy="7" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="17" r="1" /><circle cx="15" cy="17" r="1" /></>),
  alert: (<><path d="M12 4l9 16H3z" /><path d="M12 10v4.5M12 17h.01" /></>),
  image: (<><rect x="4" y="5" width="16" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M5 17l4.5-4.5 3 3 2.5-2.5L19 16" /></>),
  calendar: (<><rect x="4" y="5.5" width="16" height="14" rx="2" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" /></>),
  truck: (<><path d="M3.5 6.5h10v9h-10zM13.5 9.5h4l3 3v3h-7" /><circle cx="8" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></>),
  copy: (<><rect x="8.5" y="8.5" width="11" height="11" rx="1.5" /><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" /></>),
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  panel: (<><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M9.5 5v14" /></>),
  info: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8h.01" /></>),
  mail: (<><rect x="4" y="6" width="16" height="12" rx="2" /><path d="M4.5 7.5l7.5 5.5 7.5-5.5" /></>),
  star: <path d="M12 4.5l2.3 4.8 5.2.7-3.8 3.7.9 5.2L12 16.4l-4.6 2.5.9-5.2L4.5 10l5.2-.7z" />,
};

export type AIconName = keyof typeof P | (string & {});
export default function AIcon({ name, className = "" }: { name: AIconName; className?: string }) {
  return (
    <svg className={`icon ${className}`.trim()} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {P[name] ?? null}
    </svg>
  );
}
