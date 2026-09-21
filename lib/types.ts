export type Role = 'admin' | 'customer';

export type User = {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role?: string;
  referral_code?: string;
  referred_by_id?: number | null;
  referred_by_name?: string | null;
  referred_by_code?: string | null;
  referrals_count?: number;
  created_at?: string;
};

export type Category = {
  category_id: number;
  category_name: string;
  parent_category_id?: number | null;
  image_url?: string;
};

export type Product = {
  product_id: number;
  product_name: string;
  description: string;
  price: number | string;
  stock_quantity: number;
  category_id?: number;
  category_name?: string;
  image_url?: string;
  created_at?: string;
};

export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

export type Order = {
  order_id: number | string;
  user_id: number;
  order_date: string;
  total_amount: number | string;
  order_status: OrderStatus;
  shipping_address: string;
  customer_name?: string;
};

export type PaymentMethod = 'Credit Card' | 'PayPal' | 'Crypto' | 'Bank Transfer';
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded';

export type Payment = {
  payment_id: number;
  order_id: number | string;
  payment_date: string;
  amount: number | string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  customer_name?: string;
};

export type LowStockReport = {
  product_id: number;
  product_name: string;
  stock_quantity: number;
  price: number | string;
  category_name?: string;
};

export type TopCustomerReport = {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  orders_placed: number;
  lifetime_value: number | string;
};

export type MonthlySalesReport = {
  month: string;
  total_sales: number | string;
  order_count: number;
};

export type NewsletterSubscriber = {
  subscriber_id: number;
  email: string;
  status: 'active' | 'unsubscribed';
  subscribed_at: string;
};

export type AdminView =
  | 'dashboard'
  | 'users'
  | 'categories'
  | 'products'
  | 'orders'
  | 'payments'
  | 'subscribers';
