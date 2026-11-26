import type { Metadata } from "next";
import AccountHome from "@/components/AccountHome";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return <AccountHome />;
}
