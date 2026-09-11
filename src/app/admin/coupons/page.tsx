import { createClient } from "@/lib/supabase/server";
import { CouponManager } from "@/components/admin/coupon-manager";

export default async function AdminCouponsPage() {
  const supabase = await createClient();
  const { data: coupons } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Coupons</h1>
      <CouponManager initialCoupons={coupons ?? []} />
    </div>
  );
}
