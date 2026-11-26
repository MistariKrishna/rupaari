import type { Metadata } from "next";
import { Suspense } from "react";
import OrdersList from "@/components/OrdersList";

export const metadata: Metadata = { title: "My orders" };

export default function Page() {
  return (
    <Suspense fallback={<div className="rp-page" />}>
      <OrdersList />
    </Suspense>
  );
}
