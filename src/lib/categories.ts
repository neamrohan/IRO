import type { Category } from "@/lib/types";

export function getCategoryPath(category: Category, categories: Category[]): Category[] {
  const byId = new Map(categories.map((item) => [item.id, item]));
  const path: Category[] = [];
  const visited = new Set<string>();
  let current: Category | undefined = category;

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    path.unshift(current);
    current = current.parent_id ? byId.get(current.parent_id) : undefined;
  }

  return path;
}

export function getCategoryHref(category: Category, categories: Category[]): string {
  const path = getCategoryPath(category, categories);
  return path.length ? `/shop/${path.map((item) => item.slug).join("/")}` : "/shop";
}

export function getCategoryLabel(category: Category, categories: Category[]): string {
  return getCategoryPath(category, categories).map((item) => item.name).join(" / ");
}

export function findCategoryByPath(slugs: string[], categories: Category[]): Category | null {
  let parentId: string | null = null;
  let selected: Category | undefined;

  for (const slug of slugs) {
    selected = categories.find((category) => category.slug === slug && category.parent_id === parentId);
    if (!selected) return null;
    parentId = selected.id;
  }

  return selected ?? null;
}