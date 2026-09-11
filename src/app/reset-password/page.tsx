"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    toast.success("Password updated. Please log in.");
    router.push("/login");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl mb-2 text-center">Set New Password</h1>
      <p className="text-sm text-ink/60 text-center mb-8">
        This link is only valid if you arrived from a password reset email.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="password" required placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border hairline px-3 py-2.5 text-sm" />
        <input type="password" required placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full border hairline px-3 py-2.5 text-sm" />
        {error && <p className="text-sm text-oxblood">{error}</p>}
        <button type="submit" disabled={submitting} className="w-full bg-ink text-cream py-3 text-sm font-medium disabled:opacity-60">
          {submitting ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
