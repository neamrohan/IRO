import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16 prose-sm">
      <h1 className="font-display text-4xl mb-8">Privacy Policy</h1>
      <div className="space-y-6 text-sm text-ink/70 leading-relaxed">
        <p>Last updated: January 2026</p>
        <section>
          <h2 className="font-medium text-ink text-base mb-2">Information We Collect</h2>
          <p>We collect the information you provide when creating an account or placing an order — name, phone number, email, and delivery address — along with your order and browsing history to improve our service.</p>
        </section>
        <section>
          <h2 className="font-medium text-ink text-base mb-2">How We Use Your Information</h2>
          <p>Your information is used to process orders, arrange delivery, respond to support requests, and — with your consent — send updates about new collections.</p>
        </section>
        <section>
          <h2 className="font-medium text-ink text-base mb-2">Data Storage</h2>
          <p>Your data is stored securely with Supabase, using row-level security so only you and authorized IRO staff can access your account information.</p>
        </section>
        <section>
          <h2 className="font-medium text-ink text-base mb-2">Your Rights</h2>
          <p>You may request a copy of your data, ask us to correct it, or request deletion of your account at any time by contacting support@iro.com.bd.</p>
        </section>
      </div>
    </div>
  );
}
