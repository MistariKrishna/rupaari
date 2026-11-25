import type { Metadata } from "next";
import { Suspense } from "react";
import ReturnRequest from "@/components/ReturnRequest";

export const metadata: Metadata = { title: "Request a return" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="rp-page" />}>
      <ReturnRequest id={decodeURIComponent(id)} />
    </Suspense>
  );
}