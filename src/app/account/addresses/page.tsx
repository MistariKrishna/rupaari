import type { Metadata } from "next";
import AddressBook from "@/components/AddressBook";

export const metadata: Metadata = { title: "My addresses" };

export default function Page() {
  return <AddressBook />;
}
