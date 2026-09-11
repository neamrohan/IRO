"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signUpWithPassword } from "@/lib/auth-actions";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    const result = await signUpWithPassword(form.email, form.password, form.fullName, form.phone);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Registration failed.");
      return;
    }
    toast.success("Account created. Check your email to verify, then log in.");
    router.push("/login");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl mb-2 text-center">Create Account</h1>
      <p className="text-sm text-ink/60 text-center mb-8">Join IRO for faster checkout and order tracking.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input required placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full border hairline px-3 py-2.5 text-sm" />
        <input required placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border hairline px-3 py-2.5 text-sm" />
        <input required type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border hairline px-3 py-2.5 text-sm" />
        <input required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border hairline px-3 py-2.5 text-sm" />
        <input required type="password" placeholder="Confirm password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="w-full border hairline px-3 py-2.5 text-sm" />
        {error && <p className="text-sm text-oxblood">{error}</p>}
        <button type="submit" disabled={submitting} className="w-full bg-ink text-cream py-3 text-sm font-medium disabled:opacity-60">
          {submitting ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="text-center mt-4 text-sm">
        Already have an account? <Link href="/login" className="text-oxblood hover:underline">Log in</Link>
      </p>
    </div>
  );
}
