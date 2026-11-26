"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="py-section text-center">
      <div className="container-x" style={{ paddingTop: 140 }}>
        <p className="h-eyebrow mb-4">Something went wrong</p>
        <h1 className="h-display mb-6" style={{ color: "#680f1a" }}>We could not load this page</h1>
        <p className="mb-8">Please try again. If it keeps happening, tell us on the contact page.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button type="button" className="btn" onClick={reset}>Try again</button>
          <Link href="/" className="btn btn-secondary">Back to home</Link>
        </div>
      </div>
    </section>
  );
}
