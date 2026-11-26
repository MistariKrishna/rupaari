import type { Metadata } from "next";
import BagPage from "@/components/BagPage";

export const metadata: Metadata = { title: "Your Bag" };

export default function Page() {
  return <BagPage />;
}
