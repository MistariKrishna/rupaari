import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <section className="sec-0 min-h-[70svh] pb-section pt-16">
      <div className="container-x max-w-[44rem]">
        <p className="h-eyebrow mb-6">Account</p>
        <h1 className="h-display mb-6">Sign in, coming soon</h1>
        <p className="t-lead mb-8 text-ink/75">Accounts, saved addresses and order tracking arrive together with online checkout. Until then, your bag and wishlist are saved on this device.</p>
        <Link href="/contact" className="link-arrow">
          Need help with an order? Contact us <Icon name="arrow-right" />
        </Link>
      </div>
    </section>
  );
}