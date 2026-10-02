"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Plus, Pencil, ImagePlus, X } from "lucide-react";
import { saveCategory, deleteCategory } from "@/app/admin/categories/actions";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import type { Category } from "@/lib/types";

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    id: "",
    name: "",
    slug: "",
    parentId: "",
    imageUrl: "",
    description: "",
    sortOrder: initialCategories.length,
    isActive: true,
    slugEdited: false,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const sortedCategories = [...initialCategories].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  const childrenCount = new Map<string, number>();
  sortedCategories.forEach((category) => {
    if (category.parent_id) childrenCount.set(category.parent_id, (childrenCount.get(category.parent_id) ?? 0) + 1);
  });

  function flattenCategories(parentId: string | null = null, depth = 0, visited = new Set<string>()): { category: Category; depth: number }[] {
    return sortedCategories
      .filter((category) => category.parent_id === parentId && !visited.has(category.id))
      .flatMap((category) => {
        visited.add(category.id);
        return [
          { category, depth },
          ...flattenCategories(category.id, depth + 1, visited),
        ];
      });
  }

  const treeRows = flattenCategories();
  const listedIds = new Set(treeRows.map(({ category }) => category.id));
  sortedCategories.forEach((category) => {
    if (!listedIds.has(category.id)) treeRows.push({ category, depth: 0 });
  });

  function startCreate(parentId = "") {
    setForm({
      id: "",
      name: "",
      slug: "",
      parentId,
      imageUrl: "",
      description: "",
      sortOrder: initialCategories.length,
      isActive: true,
      slugEdited: false,
    });
  }

  function startEdit(category: Category) {
    setForm({
      id: category.id,
      name: category.name,
      slug: category.slug,
      parentId: category.parent_id ?? "",
      imageUrl: category.image_url ?? "",
      description: category.description ?? "",
      sortOrder: category.sort_order,
      isActive: category.is_active,
      slugEdited: true,
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Category name is required.");
      return;
    }
    setSaving(true);
    const result = await saveCategory({
      id: form.id || undefined,
      name: form.name,
      slug: form.slug || slugify(form.name),
      parentId: form.parentId || null,
      imageUrl: form.imageUrl,
      description: form.description,
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
    });
    setSaving(false);
    if (!result.success) {
      toast.error(result.error ?? "Could not save category.");
      return;
    }
    toast.success(form.id ? "Category updated." : "Category added.");
    startCreate();
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? Its products will become uncategorized and its subcategories will become main categories.")) return;
    const result = await deleteCategory(id);
    if (!result.success) {
      toast.error(result.error ?? "Could not delete category.");
      return;
    }
    if (form.id === id) startCreate();
    toast.success("Category deleted.");
    router.refresh();
  }

  async function toggleStatus(category: Category) {
    const result = await saveCategory({
      id: category.id,
      name: category.name,
      slug: category.slug,
      parentId: category.parent_id,
      imageUrl: category.image_url ?? "",
      description: category.description ?? "",
      sortOrder: category.sort_order,
      isActive: !category.is_active,
    });
    if (!result.success) {
      toast.error(result.error ?? "Could not update category.");
      return;
    }
    router.refresh();
  }

  async function uploadImage(file?: File) {
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const path = `categories/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) {
      toast.error(`Image upload failed: ${error.message}`);
    } else {
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((current) => ({ ...current, imageUrl: data.publicUrl }));
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button onClick={() => startCreate()} className="flex items-center gap-2 bg-oxblood text-cream px-4 py-2.5 text-sm">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="overflow-x-auto border hairline">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-line/20 text-xs text-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Subcategories</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y hairline">
            {treeRows.map(({ category, depth }) => (
              <tr key={category.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3" style={{ paddingLeft: `${depth * 18}px` }}>
                    {category.image_url ? <img src={category.image_url} alt="" className="h-9 w-9 object-cover" /> : null}
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-xs text-ink/50">/{category.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink/70">{childrenCount.get(category.id) ?? 0}</td>
                <td className="px-4 py-3 text-ink/70">{category.sort_order}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleStatus(category)} className="text-xs underline underline-offset-2" aria-label={`Set ${category.name} ${category.is_active ? "inactive" : "active"}`}>
                    {category.is_active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => startCreate(category.id)} title={`Add a subcategory under ${category.name}`} aria-label={`Add subcategory under ${category.name}`} className="text-ink/55 hover:text-oxblood"><Plus size={16} /></button>
                    <button onClick={() => startEdit(category)} title="Edit category" aria-label={`Edit ${category.name}`} className="text-ink/55 hover:text-oxblood"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(category.id)} title="Delete category" aria-label={`Delete ${category.name}`} className="text-ink/55 hover:text-oxblood"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {treeRows.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-ink/50">No categories yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleSave} className="border hairline p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">{form.id ? "Edit Category" : form.parentId ? "Add Subcategory" : "Add Category"}</h2>
          {form.id || form.parentId ? <button type="button" onClick={() => startCreate()} aria-label="Clear category form" className="p-1 text-ink/50 hover:text-ink"><X size={17} /></button> : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs text-ink/60">Name
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slugEdited ? form.slug : slugify(e.target.value) })} className="mt-1 w-full border hairline px-3 py-2.5 text-sm text-ink" />
          </label>
          <label className="text-xs text-ink/60">Slug
            <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value, slugEdited: true })} className="mt-1 w-full border hairline px-3 py-2.5 text-sm text-ink" />
          </label>
          <label className="text-xs text-ink/60">Parent category
            <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })} className="mt-1 w-full border hairline px-3 py-2.5 text-sm text-ink">
              <option value="">None (main category)</option>
              {treeRows.filter(({ category }) => category.id !== form.id).map(({ category, depth }) => (
                <option key={category.id} value={category.id}>{`${"— ".repeat(depth)}${category.name}`}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-ink/60">Display order
            <input type="number" min="0" step="1" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="mt-1 w-full border hairline px-3 py-2.5 text-sm text-ink" />
          </label>
          <label className="text-xs text-ink/60 sm:col-span-2">Description
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full border hairline px-3 py-2.5 text-sm text-ink" />
          </label>
          <div className="sm:col-span-2">
            <label className="text-xs text-ink/60">Category image URL</label>
            <div className="mt-1 flex gap-2">
              <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="min-w-0 flex-1 border hairline px-3 py-2.5 text-sm text-ink" />
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e.target.files?.[0])} />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex shrink-0 items-center gap-2 border hairline px-3 text-sm disabled:opacity-60"><ImagePlus size={16} />{uploading ? "Uploading" : "Upload"}</button>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-oxblood" /> Active
          </label>
        </div>
        <button type="submit" disabled={saving || uploading} className="bg-oxblood px-5 py-2.5 text-sm font-medium text-cream disabled:opacity-60">
          {saving ? "Saving..." : form.id ? "Save Changes" : "Create Category"}
        </button>
      </form>
    </div>
  );
}
