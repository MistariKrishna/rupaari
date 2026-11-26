import type { Metadata } from "next";
import { Suspense } from "react";
import OrderDetail from "@/components/OrderDetail";

export const metadata: Metadata = { title: "Order details" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="rp-page" />}>
      <OrderDetail id={decodeURIComponent(id)} />
    </Suspense>
  );
}
