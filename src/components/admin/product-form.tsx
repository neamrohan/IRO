"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageUploader, type UploadedImage } from "@/components/admin/image-uploader";
import { saveProduct } from "@/app/admin/products/actions";
import type { Product, Category } from "@/lib/types";

interface ProductFormProps {
  categories: Category[];
  product?: Product;
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    sku: product?.sku ?? "",
    categoryId: product?.category_id ?? categories[0]?.id ?? "",
    price: product?.price ?? 0,
    discountPrice: product?.discount_price ?? undefined as number | undefined,
    stockQuantity: product?.stock_quantity ?? 0,
    fabric: product?.fabric ?? "",
    colors: (product?.colors ?? []).join(", "),
    sizes: (product?.sizes ?? []).join(", "),
    kameezDetails: product?.kameez_details ?? "",
    salwarDetails: product?.salwar_details ?? "",
    ornaDetails: product?.orna_details ?? "",
    workType: product?.work_type ?? "",
    lengthInfo: product?.length_info ?? "",
    careInstructions: product?.care_instructions ?? "",
    isActive: product?.is_active ?? true,
    isFeatured: product?.is_featured ?? false,
    isNewArrival: product?.is_new_arrival ?? false,
    isBestSeller: product?.is_best_seller ?? false,
  });

  const [images, setImages] = useState<UploadedImage[]>(
    (product?.product_images ?? []).map((img) => ({ url: img.image_url, isPrimary: img.is_primary }))
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || form.price <= 0) {
      toast.error("Product name and a price greater than 0 are required.");
      return;
    }
    setSaving(true);
    const result = await saveProduct({
      id: product?.id,
      name: form.name,
      description: form.description,
      sku: form.sku,
      categoryId: form.categoryId || null,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      stockQuantity: Number(form.stockQuantity),
      fabric: form.fabric,
      colors: form.colors.split(",").map((c) => c.trim()).filter(Boolean),
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      kameezDetails: form.kameezDetails,
      salwarDetails: form.salwarDetails,
      ornaDetails: form.ornaDetails,
      workType: form.workType,
      lengthInfo: form.lengthInfo,
      careInstructions: form.careInstructions,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      isNewArrival: form.isNewArrival,
      isBestSeller: form.isBestSeller,
      images,
    });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error ?? "Could not save product.");
      return;
    }
    toast.success(product ? "Product updated." : "Product created.");
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <section>
        <h2 className="font-medium mb-4">Images</h2>
        <ImageUploader images={images} onChange={setImages} />
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-xs text-ink/50 mb-1 block">Product Name *</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border hairline px-3 py-2.5 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-ink/50 mb-1 block">Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border hairline px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-xs text-ink/50 mb-1 block">SKU</label>
          <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full border hairline px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-xs text-ink/50 mb-1 block">Category</label>
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full border hairline px-3 py-2.5 text-sm">
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-ink/50 mb-1 block">Price (৳) *</label>
          <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="w-full border hairline px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-xs text-ink/50 mb-1 block">Discount Price (৳)</label>
          <input type="number" value={form.discountPrice ?? ""} onChange={(e) => setForm({ ...form, discountPrice: e.target.value ? Number(e.target.value) : undefined })} className="w-full border hairline px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-xs text-ink/50 mb-1 block">Stock Quantity</label>
          <input type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })} className="w-full border hairline px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-xs text-ink/50 mb-1 block">Fabric</label>
          <input value={form.fabric} onChange={(e) => setForm({ ...form, fabric: e.target.value })} className="w-full border hairline px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-xs text-ink/50 mb-1 block">Colors (comma-separated)</label>
          <input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="Maroon, Ivory" className="w-full border hairline px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-xs text-ink/50 mb-1 block">Sizes (comma-separated)</label>
          <input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L, XL" className="w-full border hairline px-3 py-2.5 text-sm" />
        </div>
      </section>

      <section>
        <h2 className="font-medium mb-4">Three-Piece Details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-ink/50 mb-1 block">Kameez</label>
            <input value={form.kameezDetails} onChange={(e) => setForm({ ...form, kameezDetails: e.target.value })} className="w-full border hairline px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="text-xs text-ink/50 mb-1 block">Salwar</label>
            <input value={form.salwarDetails} onChange={(e) => setForm({ ...form, salwarDetails: e.target.value })} className="w-full border hairline px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="text-xs text-ink/50 mb-1 block">Orna / Dupatta</label>
            <input value={form.ornaDetails} onChange={(e) => setForm({ ...form, ornaDetails: e.target.value })} className="w-full border hairline px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="text-xs text-ink/50 mb-1 block">Work / Print Type</label>
            <input value={form.workType} onChange={(e) => setForm({ ...form, workType: e.target.value })} className="w-full border hairline px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="text-xs text-ink/50 mb-1 block">Length Info</label>
            <input value={form.lengthInfo} onChange={(e) => setForm({ ...form, lengthInfo: e.target.value })} className="w-full border hairline px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="text-xs text-ink/50 mb-1 block">Care Instructions</label>
            <input value={form.careInstructions} onChange={(e) => setForm({ ...form, careInstructions: e.target.value })} className="w-full border hairline px-3 py-2.5 text-sm" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-medium mb-4">Status</h2>
        <div className="flex flex-wrap gap-6">
          {[
            { key: "isActive", label: "Active" },
            { key: "isFeatured", label: "Featured" },
            { key: "isNewArrival", label: "New Arrival" },
            { key: "isBestSeller", label: "Best Seller" },
          ].map((opt) => (
            <label key={opt.key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={(form as any)[opt.key]}
                onChange={(e) => setForm({ ...form, [opt.key]: e.target.checked })}
                className="accent-oxblood"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </section>

      <button type="submit" disabled={saving} className="bg-oxblood text-cream px-6 py-3 text-sm font-medium disabled:opacity-60">
        {saving ? "Saving..." : product ? "Save Changes" : "Create Product"}
      </button>
    </form>
  );
}
