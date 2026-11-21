import Link from "next/link";
import PageHero from "@/components/PageHero";

export default function NotFound() {
  return (
    <>
      <PageHero eyebrow="404" title="Page not found" intro="The page you are looking for is not here." />
      <section className="py-section text-center">
        <div className="container-x">
          <Link href="/" className="btn">Back to home</Link>
        </div>
      </section>
    </>
  );
}
