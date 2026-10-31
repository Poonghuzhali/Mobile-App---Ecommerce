export type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

export type Banner = {
  id: number;
  title: string;
  subtitle: string;
  image_url: string | null;
  gradient_start: string;
  gradient_end: string;
  category_id: number | null;
};

export type Category = { id: number; name: string; slug: string; icon: string; image_url: string | null };

export type Product = {
  id: number;
  name: string;
  slug: string;
  category: number;
  category_name: string;
  price: string;
  discount_price: string | null;
  effective_price: string;
  stock: number;
  is_featured: boolean;
  rating: string;
  primary_image: string | null;
  description?: string;
  sku?: string;
  images?: { id: number; url: string; is_primary: boolean }[];
};

export type CartItem = {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
  primary_image: string | null;
  stock: number;
};

export type Cart = { id: number; items: CartItem[]; total: string; item_count: number };

export type Address = {
  id: number;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
};

export type RazorpayConfig = {
  enabled: boolean;
  test_mode: boolean;
  test_mode_only: boolean;
};

export type RazorpayCreateOrderResponse = {
  key_id: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
  test_payment_hints?: {
    upi: string;
    domestic_card: string;
    international_cards: string;
  };
};

export type RazorpayPaymentSuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type Order = {
  id: number;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  payment_reference?: string;
  subtotal: string;
  shipping_fee: string;
  total: string;
  shipping_address: Record<string, string>;
  items: { product_name: string; quantity: number; line_total: string }[];
  status_history: { status: string; message: string; created_at: string }[];
  created_at: string;
};

export type NotificationItem = {
  id: number;
  title: string;
  body: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
};

export type UserProfile = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_staff?: boolean;
};

export type AdminStats = {
  order_count: number;
  customer_count: number;
  low_stock_count: number;
  total_sales: string;
};

export type AdminCustomer = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_joined: string;
  order_count: number;
};

export type AdminOrder = Order & {
  customer_email: string;
  customer_name: string;
};

export type AdminProduct = {
  id: number;
  name: string;
  sku: string;
  category: number;
  category_name: string;
  price: string;
  discount_price: string | null;
  effective_price: string;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
};
