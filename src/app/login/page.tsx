"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { signInWithPassword } from "@/lib/auth-actions";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await signInWithPassword(email, password);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Login failed. Please check your credentials.");
      return;
    }
    toast.success("Welcome back.");
    router.push(searchParams.get("redirect") || "/account");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl mb-2 text-center">Welcome Back</h1>
      <p className="text-sm text-ink/60 text-center mb-8">Log in to your IRO account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border hairline px-3 py-2.5 text-sm"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border hairline px-3 py-2.5 text-sm"
        />
        {error && <p className="text-sm text-oxblood">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-ink text-cream py-3 text-sm font-medium disabled:opacity-60"
        >
          {submitting ? "Logging in..." : "Log In"}
        </button>
      </form>

      <div className="flex justify-between mt-4 text-sm">
        <Link href="/forgot-password" className="text-oxblood hover:underline">Forgot password?</Link>
        <Link href="/register" className="text-ink/70 hover:underline">Create an account</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
