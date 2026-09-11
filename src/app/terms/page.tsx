import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      <h1 className="font-display text-4xl mb-8">Terms &amp; Conditions</h1>
      <div className="space-y-6 text-sm text-ink/70 leading-relaxed">
        <p>Last updated: January 2026</p>
        <section>
          <h2 className="font-medium text-ink text-base mb-2">Orders</h2>
          <p>By placing an order on IRO, you confirm that all information provided is accurate. We reserve the right to cancel any order in cases of suspected fraud or unavailable stock.</p>
        </section>
        <section>
          <h2 className="font-medium text-ink text-base mb-2">Pricing</h2>
          <p>All prices are listed in Bangladeshi Taka (৳) and are subject to change without prior notice. The price at the time of order confirmation applies.</p>
        </section>
        <section>
          <h2 className="font-medium text-ink text-base mb-2">Payment</h2>
          <p>Cash on Delivery orders must be paid in full to the delivery agent upon receipt. Refusal to accept a confirmed order may affect your ability to place future Cash on Delivery orders.</p>
        </section>
        <section>
          <h2 className="font-medium text-ink text-base mb-2">Intellectual Property</h2>
          <p>All designs, photography, and content on this site are the property of IRO and may not be reproduced without permission.</p>
        </section>
      </div>
    </div>
  );
}
