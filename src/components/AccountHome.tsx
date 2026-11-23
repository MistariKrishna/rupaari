"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signOut } from "@/lib/auth";
import { maskId } from "@/lib/identity";
import Crumbs from "./Crumbs";
import { Icon } from "./Icon";
import { useSession } from "./useSession";

export default function AccountHome() {
  const { user, ready } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (ready && !user) router.replace("/login?next=/account");
  }, [ready, user, router]);
  if (!user) return <div className="rp-page" />;

  const cards = [
    { href: "/account/orders", icon: "bag" as const, t: "My orders", d: "Track orders, request returns." },
    { href: "/wishlist", icon: "heart" as const, t: "Wishlist", d: "Sarees you’ve saved for later." },
    { href: "/contact", icon: "calendar" as const, t: "Bridal consultation", d: "Book a time with our team." },
  ];
  return (
    <div className="rp-page">
      <div className="rp-wrap">
        <Crumbs items={[{ label: "Home", href: "/" }, { label: "Account" }]} />
        <h1 className="rp-title">Hello, {user.name.split(" ")[0]}</h1>
        <p className="od-lead">{maskId(user.id)}</p>
        <div className="ac-grid">
          {cards.map((c) => (
            <Link key={c.t} href={c.href} className="rp-card ac-card">
              <Icon name={c.icon} />
              <h2>{c.t}</h2>
              <p>{c.d}</p>
              <span aria-hidden="true"><Icon name="arrow-right" /></span>
            </Link>
          ))}
        </div>
        <button type="button" className="rp-link ac-out" onClick={() => { signOut(); router.replace("/"); }}>Sign out</button>
      </div>
    </div>
  );
}