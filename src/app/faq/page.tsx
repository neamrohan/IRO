import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQ" };

const FAQS = [
  { q: "What payment methods do you accept?", a: "We currently accept Cash on Delivery nationwide. bKash, Nagad, and card payments are being rolled out soon." },
  { q: "How long does delivery take?", a: "Inside Dhaka, standard delivery takes 1–3 days and express delivery 1–2 days. Outside Dhaka, delivery typically takes 3–5 days." },
  { q: "What is the delivery charge?", a: "Delivery is ৳80 inside Dhaka and ৳130 outside Dhaka. Charges are confirmed at checkout based on your selected district." },
  { q: "Can I exchange or return a product?", a: "Yes — unworn items with tags attached can be exchanged within 7 days of delivery. See our Return & Refund Policy for details." },
  { q: "How do I track my order?", a: "Log in and visit My Orders to see the live status of every order you've placed." },
  { q: "Do you offer size exchanges?", a: "Yes, if the size doesn't fit, you can request a one-time size exchange within 7 days, subject to stock availability." },
  { q: "Is Cash on Delivery available everywhere?", a: "Yes, Cash on Delivery is available across all 64 districts of Bangladesh." },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      <h1 className="font-display text-4xl mb-10 text-center">Frequently Asked Questions</h1>
      <div className="divide-y hairline border-t border-b hairline">
        {FAQS.map((item) => (
          <details key={item.q} className="group py-5">
            <summary className="flex justify-between items-center cursor-pointer text-sm font-medium">
              {item.q}
              <span className="text-ink/40 group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="text-sm text-ink/60 leading-relaxed mt-3">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
