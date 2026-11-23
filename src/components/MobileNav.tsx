"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isAuthPath } from "@/lib/site";
import { Icon, type IconName } from "./Icon";
import { useStore } from "./StoreProvider";

/** Floating pill navigation for phones and tablets: Home, Wishlist, Bag, Account. The current page is shown filled. */
export default function MobileNav() {
  const pathname = usePathname();
  const { count, wish, bagOpen, openBag } = useStore();

  const items: { name: IconName; label: string; href: string; current: boolean }[] = [
    { name: "home", label: "Home", href: "/", current: pathname === "/" },
    { name: "heart", label: "Wishlist", href: "/wishlist", current: pathname.startsWith("/wishlist") },
    { name: "user", label: "Account", href: "/account", current: pathname.startsWith("/account") },
  ];

  if (isAuthPath(pathname)) return null;

  return (
    <nav className="bnav" aria-label="Quick navigation">
      {items.slice(0, 2).map((it) => (
        <Link key={it.label} href={it.href} className="bnav-i" aria-label={it.label} aria-current={it.current ? "page" : undefined}>
          <Icon name={it.name} />
          {it.name === "heart" && wish.length > 0 && <span className="bnav-n">{wish.length}</span>}
        </Link>
      ))}
      <button type="button" className="bnav-i" aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`} aria-pressed={bagOpen} onClick={openBag}>
        <Icon name="bag" />
        {count > 0 && <span className="bnav-n">{count}</span>}
      </button>
      {items.slice(2).map((it) => (
        <Link key={it.label} href={it.href} className="bnav-i" aria-label={it.label} aria-current={it.current ? "page" : undefined}>
          <Icon name={it.name} />
        </Link>
      ))}
    </nav>
  );
}