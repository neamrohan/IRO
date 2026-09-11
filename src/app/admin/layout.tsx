import Link from "next/link";
import {
  LayoutDashboard, Package, ShoppingCart, Users, FolderTree, TicketPercent, BarChart3,
} from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { href: "/admin/sales", label: "Sales Overview", icon: BarChart3 },
];

// Access to everything under here is already enforced by src/middleware.ts,
// which redirects non-admins before this layout ever renders.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        <nav className="border hairline h-fit lg:sticky lg:top-24">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2.5 px-4 py-3 text-sm border-b hairline last:border-none hover:bg-line/20"
            >
              <link.icon size={15} /> {link.label}
            </Link>
          ))}
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}
