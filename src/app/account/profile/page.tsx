import type { Metadata } from "next";
import ProfileForm from "@/components/ProfileForm";

export const metadata: Metadata = { title: "My profile" };

export default function Page() {
  return <ProfileForm />;
}