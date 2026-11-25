import type { Metadata } from "next";
import { Suspense } from "react";
import TrackOrder from "@/components/TrackOrder";

export const metadata: Metadata = { title: "Track an order" };

export default function Page() {
  return (
    <Suspense fallback={<div className="rp-page" />}>
      <TrackOrder />
    </Suspense>
  );
}