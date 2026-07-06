export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image: string;
  icon: string;
  hidden: boolean;
  sort: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  specifications: { label: string; value: string }[];
  categoryId: string;
  price: number;
  oldPrice?: number;
  images: string[];
  stock: number;
  sku: string;
  barcode?: string;
  weight?: number;
  dimensions?: string;
  featured: boolean;
  isNew: boolean;
  bestSeller: boolean;
  hidden: boolean;
  rating: number;
  reviewsCount: number;
  sort: number;
  createdAt: string;
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type Coupon = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder?: number;
  active: boolean;
  usageLimit?: number;
  usedCount: number;
};

export type OrderStatus =
  | "New"
  | "Preparing"
  | "Ready"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "New",
  "Preparing",
  "Ready",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  number: string;
  customer: {
    fullName: string;
    phone: string;
    governorate: string;
    city: string;
    address: string;
    landmark?: string;
    notes?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode?: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
};

export type Customer = {
  id: string;
  fullName: string;
  phone: string;
  governorate: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt: string;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  link: string;
  active: boolean;
  sort: number;
};

export type Review = {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
};

export type Settings = {
  storeName: string;
  logo: string;
  banner: string;
  favicon: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  googleMap: string;
  businessHours: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  primaryColor: string;
  secondaryColor: string;
  buttonColor: string;
  textColor: string;
  backgroundColor: string;
  font: string;
  darkMode: boolean;
  freeShippingThreshold: number;
  shippingFee: number;
  currency: string;
  seoTitle: string;
  seoDescription: string;
};
