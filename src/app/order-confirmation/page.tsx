import type { Metadata } from "next";
import { Suspense } from "react";
import OrderConfirmation from "@/components/OrderConfirmation";

export const metadata: Metadata = { title: "Order confirmation" };

export default function Page() {
  return (
    <Suspense fallback={<div className="rp-page" />}>
      <OrderConfirmation />
    </Suspense>
  );
}
