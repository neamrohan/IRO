import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountNav } from "@/components/account-nav";
import { ProfileForm } from "@/components/profile-form";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl mb-8">My Account</h1>
      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <AccountNav />
        <div className="border hairline p-6 max-w-lg">
          <h2 className="font-medium mb-4">Profile Information</h2>
          <ProfileForm
            email={user.email ?? ""}
            fullName={profile?.full_name ?? ""}
            phone={profile?.phone ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
