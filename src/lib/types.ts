export type OrderStatus =
  | "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";

export type PaymentMethod = "cod" | "bkash" | "nagad" | "online";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  stock_quantity: number;
}

export interface Product {
  id: string;
  sku: string | null;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  price: number;
  discount_price: number | null;
  stock_quantity: number;
  fabric: string | null;
  colors: string[];
  sizes: string[];
  kameez_details: string | null;
  salwar_details: string | null;
  orna_details: string | null;
  work_type: string | null;
  length_info: string | null;
  care_instructions: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  product_images?: ProductImage[];
  categories?: Category | null;
}

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  discountPrice: number | null;
  size: string | null;
  color: string | null;
  quantity: number;
  stock: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  phone: string;
  email: string | null;
  address_line: string;
  district: string;
  area: string | null;
  delivery_method: string;
  order_notes: string | null;
  payment_method: PaymentMethod;
  status: OrderStatus;
  subtotal: number;
  delivery_charge: number;
  discount_amount: number;
  coupon_code: string | null;
  total: number;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  size: string | null;
  color: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percent: number | null;
  discount_fixed: number | null;
  min_order_amount: number;
  expires_at: string | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
}
