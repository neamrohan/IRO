"use client";

import { useState } from "react";
import { sendPasswordReset } from "@/lib/auth-actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const result = await sendPasswordReset(email);
    setSubmitting(false);
    if (!result.success) {
      setError(result.error ?? "Could not send reset email.");
      return;
    }
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl mb-2 text-center">Reset Password</h1>
      <p className="text-sm text-ink/60 text-center mb-8">We&apos;ll email you a link to reset your password.</p>

      {sent ? (
        <p className="text-sm text-moss text-center">Check your email for a password reset link.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border hairline px-3 py-2.5 text-sm"
          />
          {error && <p className="text-sm text-oxblood">{error}</p>}
          <button type="submit" disabled={submitting} className="w-full bg-ink text-cream py-3 text-sm font-medium disabled:opacity-60">
            {submitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      )}
    </div>
  );
}
