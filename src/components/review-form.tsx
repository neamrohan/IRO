"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      toast.error("Please fill in your name and a comment.");
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: user?.id ?? null,
      reviewer_name: name.trim(),
      rating,
      comment: comment.trim(),
    });

    setSubmitting(false);
    if (error) {
      toast.error("Couldn't submit your review. Please try again.");
      return;
    }
    toast.success("Thanks — your review has been posted.");
    setName("");
    setComment("");
    setRating(5);
  }

  return (
    <form onSubmit={handleSubmit} className="border hairline p-6 space-y-4">
      <h3 className="text-sm font-medium">Write a review</h3>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <button key={i} type="button" onClick={() => setRating(i + 1)} aria-label={`${i + 1} star`}>
            <Star size={20} className={cn(i < rating ? "fill-sand text-sand" : "text-line")} />
          </button>
        ))}
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="w-full border hairline px-3 py-2 text-sm"
      />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this product"
        rows={3}
        className="w-full border hairline px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={submitting}
        className="bg-ink text-cream px-5 py-2.5 text-sm font-medium disabled:opacity-60"
      >
        {submitting ? "Posting..." : "Post Review"}
      </button>
    </form>
  );
}
