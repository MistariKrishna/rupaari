import type { Metadata } from "next";
import WishlistClient from "@/components/WishlistClient";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <section className="sec-0 min-h-[70svh] pb-section pt-16">
      <div className="container-x">
        <p className="h-eyebrow mb-6">Saved for later</p>
        <h1 className="h-display mb-14">Your wishlist</h1>
        <WishlistClient />
      </div>
    </section>
  );
}