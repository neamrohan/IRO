"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSubmitting(true);
    // Wire this to a `contact_messages` table + insert, or an email service, for persistence.
    await new Promise((r) => setTimeout(r, 500));
    setSubmitting(false);
    setForm({ name: "", email: "", message: "" });
    toast.success("Message sent. We'll reply within 1 business day.");
  }

  return (
    <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display text-4xl mb-10">Contact Us</h1>
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <Phone size={18} className="mt-0.5 text-oxblood shrink-0" />
            <div>
              <p className="font-medium text-sm">Phone</p>
              <p className="text-sm text-ink/60">+880 1XXX-XXXXXX (10am–8pm, Sat–Thu)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail size={18} className="mt-0.5 text-oxblood shrink-0" />
            <div>
              <p className="font-medium text-sm">Email</p>
              <p className="text-sm text-ink/60">support@iro.com.bd</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin size={18} className="mt-0.5 text-oxblood shrink-0" />
            <div>
              <p className="font-medium text-sm">Studio</p>
              <p className="text-sm text-ink/60">Gulshan, Dhaka, Bangladesh</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border hairline px-3 py-2.5 text-sm"
          />
          <input
            type="email"
            placeholder="Your email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border hairline px-3 py-2.5 text-sm"
          />
          <textarea
            placeholder="Your message"
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full border hairline px-3 py-2.5 text-sm"
          />
          <button type="submit" disabled={submitting} className="bg-ink text-cream px-6 py-3 text-sm font-medium disabled:opacity-60">
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
