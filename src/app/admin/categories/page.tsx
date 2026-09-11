import { createClient } from "@/lib/supabase/server";
import { CategoryManager } from "@/components/admin/category-manager";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Categories</h1>
      <CategoryManager initialCategories={categories ?? []} />
    </div>
  );
}
