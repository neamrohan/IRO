"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-actions";
import { toast } from "sonner";

const LINKS = [
  { href: "/account", label: "Profile" },
  { href: "/account/orders", label: "My Orders" },
  { href: "/wishlist", label: "Wishlist" },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    toast.success("Logged out.");
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="flex flex-col border hairline">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "px-4 py-3 text-sm border-b hairline last:border-none",
            pathname === link.href ? "bg-ink text-cream" : "hover:bg-line/20"
          )}
        >
          {link.label}
        </Link>
      ))}
      <button onClick={handleSignOut} className="px-4 py-3 text-sm text-left text-oxblood hover:bg-line/20">
        Log Out
      </button>
    </nav>
  );
}
