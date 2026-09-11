"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { saveCategory, deleteCategory } from "@/app/admin/categories/actions";
import type { Category } from "@/lib/types";

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [form, setForm] = useState({ name: "", description: "", sortOrder: initialCategories.length + 1, isActive: true });
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Category name is required.");
      return;
    }
    setSaving(true);
    const result = await saveCategory(form);
    setSaving(false);
    if (!result.success) {
      toast.error(result.error ?? "Could not save category.");
      return;
    }
    toast.success("Category added.");
    window.location.reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? Products in it will become uncategorized.")) return;
    const result = await deleteCategory(id);
    if (!result.success) {
      toast.error(result.error ?? "Could not delete category.");
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast.success("Category deleted.");
  }

  return (
    <div className="space-y-8">
      <div className="border hairline divide-y hairline">
        {categories.map((cat) => (
          <div key={cat.id} className="flex justify-between items-center px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{cat.name}</p>
              <p className="text-xs text-ink/50">/{cat.slug} · {cat.is_active ? "Active" : "Inactive"}</p>
            </div>
            <button onClick={() => handleDelete(cat.id)} className="text-ink/50 hover:text-oxblood">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {categories.length === 0 && <p className="px-4 py-6 text-sm text-ink/50">No categories yet.</p>}
      </div>

      <form onSubmit={handleAdd} className="border hairline p-5 space-y-3 max-w-md">
        <h3 className="font-medium text-sm">Add Category</h3>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border hairline px-3 py-2 text-sm" />
        <input placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border hairline px-3 py-2 text-sm" />
        <button type="submit" disabled={saving} className="flex items-center gap-1.5 bg-ink text-cream px-4 py-2 text-sm disabled:opacity-60">
          <Plus size={14} /> {saving ? "Adding..." : "Add Category"}
        </button>
      </form>
    </div>
  );
}
