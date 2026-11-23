import type { Role } from "./types";

export type Screen = "dashboard" | "products" | "collections" | "inventory" | "orders" | "fulfilment" | "returns" | "customers" | "offers" | "site" | "reports" | "settings";

export const ROLES: { id: Role; label: string }[] = [
  { id: "owner", label: "Owner" },
  { id: "manager", label: "Manager" },
  { id: "catalogue", label: "Catalogue" },
  { id: "operations", label: "Operations" },
  { id: "support", label: "Support" },
  { id: "marketing", label: "Marketing" },
  { id: "finance", label: "Finance" },
];
export const roleLabel = (r: Role) => ROLES.find((x) => x.id === r)?.label ?? r;

/** Which roles can open each screen (the Manager column is an assumption: everything except Settings). */
const ACCESS: Record<Screen, Role[] | "all"> = {
  dashboard: "all",
  products: ["owner", "manager", "catalogue"],
  collections: ["owner", "manager", "marketing"],
  inventory: ["owner", "manager", "operations"],
  orders: ["owner", "manager", "operations", "support"],
  fulfilment: ["owner", "manager", "operations"],
  returns: ["owner", "manager", "operations", "support"],
  customers: ["owner", "manager", "support"],
  offers: ["owner", "manager", "marketing"],
  site: ["owner", "manager", "marketing"],
  reports: ["owner", "manager", "finance"],
  settings: ["owner"],
};
export const canView = (role: Role, screen: Screen) => ACCESS[screen] === "all" || (ACCESS[screen] as Role[]).includes(role);

export type Action = "price" | "delete" | "refund_big" | "roles" | "cancel_packed" | "export_customer";
const ACTIONS: Record<Action, Role[]> = {
  price: ["owner"],
  delete: ["owner"],
  refund_big: ["owner"],
  roles: ["owner"],
  cancel_packed: ["owner", "manager"],
  export_customer: ["owner", "support"],
};
export const canDo = (role: Role, a: Action) => ACTIONS[a].includes(role);
/** Short reason shown on a disabled Owner-only button. */
export const ACTION_NOTE: Record<Action, string> = {
  price: "Only the Owner can change prices",
  delete: "Only the Owner can delete",
  refund_big: "Refunds above the limit need the Owner",
  roles: "Only the Owner can change roles",
  cancel_packed: "Only the Owner or Manager can cancel a packed order",
  export_customer: "Only the Owner or Support can export customer data",
};

export const NAV: { group: string; items: { screen: Screen; label: string; href: string; icon: string }[] }[] = [
  { group: "", items: [{ screen: "dashboard", label: "Dashboard", href: "/admin", icon: "dashboard" }] },
  {
    group: "Sell",
    items: [
      { screen: "orders", label: "Orders", href: "/admin/orders", icon: "orders" },
      { screen: "fulfilment", label: "Fulfilment", href: "/admin/fulfilment", icon: "box" },
      { screen: "returns", label: "Returns", href: "/admin/returns", icon: "return" },
      { screen: "customers", label: "Customers", href: "/admin/customers", icon: "users" },
    ],
  },
  {
    group: "Catalogue",
    items: [
      { screen: "products", label: "Products", href: "/admin/products", icon: "tag" },
      { screen: "collections", label: "Collections", href: "/admin/collections", icon: "layers" },
      { screen: "inventory", label: "Inventory", href: "/admin/inventory", icon: "stock" },
    ],
  },
  {
    group: "Grow",
    items: [
      { screen: "offers", label: "Offers", href: "/admin/offers", icon: "percent" },
      { screen: "site", label: "Site content", href: "/admin/site", icon: "image" },
      { screen: "reports", label: "Reports", href: "/admin/reports", icon: "chart" },
    ],
  },
  { group: "System", items: [{ screen: "settings", label: "Settings", href: "/admin/settings", icon: "settings" }] },
];

export const screenOf = (path: string): Screen => {
  const seg = path.replace(/^\/admin\/?/, "").split("/")[0];
  const known = ["products", "collections", "inventory", "orders", "fulfilment", "returns", "customers", "offers", "site", "reports", "settings"] as const;
  return (known as readonly string[]).includes(seg) ? (seg as Screen) : "dashboard";
};
