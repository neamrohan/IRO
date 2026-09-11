"use client";

import { useState } from "react";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Enter a valid email address.");
      return;
    }
    setSubmitting(true);
    // Newsletter capture is intentionally simple: stored client-side confirmation only.
    // Wire this to a `newsletter_subscribers` table + insert if you want persistence.
    await new Promise((r) => setTimeout(r, 500));
    setSubmitting(false);
    setEmail("");
    toast.success("Subscribed. Welcome to IRO.");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <p className="text-sm text-cream/70 sm:mr-4 shrink-0">
        Join the list for early access to new collections.
      </p>
      <div className="flex w-full sm:w-auto gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          required
          className="flex-1 sm:w-64 bg-transparent border border-cream/25 px-3 py-2 text-sm text-cream placeholder:text-cream/40 focus:border-cream/60"
        />
        <button
          type="submit"
          disabled={submitting}
          className="shrink-0 bg-cream text-ink px-4 py-2 text-sm font-medium hover:bg-cream/90 disabled:opacity-60"
        >
          {submitting ? "..." : "Subscribe"}
        </button>
      </div>
    </form>
  );
}
