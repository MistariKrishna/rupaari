import type { Metadata } from "next";
import { Suspense } from "react";
import ReturnsList from "@/components/ReturnsList";

export const metadata: Metadata = { title: "Returns and refunds" };

export default function Page() {
  return (
    <Suspense fallback={<div className="rp-page" />}>
      <ReturnsList />
    </Suspense>
  );
}