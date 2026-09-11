import type { Metadata } from "next";

export const metadata: Metadata = { title: "Return & Refund Policy" };

export default function ReturnPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      <h1 className="font-display text-4xl mb-8">Return &amp; Refund Policy</h1>
      <div className="space-y-6 text-sm text-ink/70 leading-relaxed">
        <section>
          <h2 className="font-medium text-ink text-base mb-2">Exchange Window</h2>
          <p>Items may be exchanged within 7 days of delivery, provided they are unworn, unwashed, and have all original tags attached.</p>
        </section>
        <section>
          <h2 className="font-medium text-ink text-base mb-2">How to Request an Exchange</h2>
          <p>Contact support@iro.com.bd with your order number and the reason for exchange. We'll arrange pickup of the item and delivery of the replacement.</p>
        </section>
        <section>
          <h2 className="font-medium text-ink text-base mb-2">Refunds</h2>
          <p>Refunds are issued for orders that are cancelled before dispatch, or in cases where the received item is damaged or incorrect. Refunds are processed to the original payment method, or as store credit for Cash on Delivery orders.</p>
        </section>
        <section>
          <h2 className="font-medium text-ink text-base mb-2">Non-Returnable Items</h2>
          <p>Items marked as final sale, and products that show signs of wear or altered tags, are not eligible for return or exchange.</p>
        </section>
      </div>
    </div>
  );
}
