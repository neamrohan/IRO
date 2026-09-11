"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function ProfileForm({ email, fullName, phone }: { email: string; fullName: string; phone: string }) {
  const [name, setName] = useState(fullName);
  const [phoneNumber, setPhoneNumber] = useState(phone);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name, phone: phoneNumber })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      toast.error("Could not update profile.");
      return;
    }
    toast.success("Profile updated.");
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <label className="text-xs text-ink/50 mb-1 block">Email</label>
        <input value={email} disabled className="w-full border hairline px-3 py-2.5 text-sm bg-line/20 text-ink/50" />
      </div>
      <div>
        <label className="text-xs text-ink/50 mb-1 block">Full Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border hairline px-3 py-2.5 text-sm" />
      </div>
      <div>
        <label className="text-xs text-ink/50 mb-1 block">Phone</label>
        <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full border hairline px-3 py-2.5 text-sm" />
      </div>
      <button type="submit" disabled={saving} className="bg-ink text-cream px-5 py-2.5 text-sm font-medium disabled:opacity-60">
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
