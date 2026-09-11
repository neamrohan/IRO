"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteProduct } from "@/app/admin/products/actions";

export function ProductRowActions({ productId }: { productId: string }) {
  async function handleDelete() {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const result = await deleteProduct(productId);
    if (!result.success) {
      toast.error(result.error ?? "Could not delete product.");
      return;
    }
    toast.success("Product deleted.");
  }

  return (
    <div className="flex gap-3">
      <Link href={`/admin/products/edit/${productId}`} className="text-ink/60 hover:text-ink" aria-label="Edit">
        <Pencil size={15} />
      </Link>
      <button onClick={handleDelete} className="text-ink/60 hover:text-oxblood" aria-label="Delete">
        <Trash2 size={15} />
      </button>
    </div>
  );
}
