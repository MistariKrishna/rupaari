"use client";

import { useParams } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { useAdmin } from "@/components/admin/AdminShell";
import { Btn, Empty } from "@/components/admin/ui";

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const { d } = useAdmin();
  if (!d.products.some((p) => p.id === id)) return <Empty title="Product not found" action={<Btn href="/admin/products" variant="ghost">Back to products</Btn>} />;
  // key: opening another product resets the form state
  return <ProductForm key={id} id={id} />;
}
