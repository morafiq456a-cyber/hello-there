import type {
  Banner,
  Category,
  Coupon,
  Product,
  Review,
  Settings,
} from "./types";

const img = (seed: string) => `https://picsum.photos/seed/${seed}/700/700`;

export const defaultSettings: Settings = {
  storeName: "Nova Store",
  logo: "",
  banner: "",
  favicon: "/favicon.ico",
  phone: "+201000000000",
  whatsapp: "201000000000",
  email: "hello@novastore.com",
  address: "12 Tahrir Square, Cairo, Egypt",
  googleMap: "https://maps.google.com/?q=Cairo",
  businessHours: "Sat - Thu: 10:00 AM - 10:00 PM",
  facebook: "https://facebook.com",
  instagram: "https://instagram.com",
  tiktok: "https://tiktok.com",
  primaryColor: "#6d28d9",
  secondaryColor: "#0ea5e9",
  buttonColor: "#6d28d9",
  textColor: "#0f172a",
  backgroundColor: "#ffffff",
  font: "Inter",
  darkMode: false,
  freeShippingThreshold: 1500,
  shippingFee: 60,
  currency: "EGP",
  seoTitle: "Nova Store — Premium Online Shopping in Egypt",
  seoDescription:
    "Shop the latest electronics, fashion, home essentials and more at Nova Store. Cash on delivery across Egypt with fast shipping.",
  payCodEnabled: true,
  payCardEnabled: false,
  payWalletEnabled: false,
  payBankEnabled: false,
  walletNumbers: "",
  bankDetails: "",
};

export const seedCategories: Category[] = [
  { id: "c1", name: "Electronics", slug: "electronics", description: "Phones, gadgets & accessories", image: img("electronics"), icon: "Smartphone", hidden: false, sort: 1 },
  { id: "c2", name: "Fashion", slug: "fashion", description: "Clothing, shoes & style", image: img("fashion"), icon: "Shirt", hidden: false, sort: 2 },
  { id: "c3", name: "Home & Kitchen", slug: "home-kitchen", description: "Everything for your home", image: img("home"), icon: "Home", hidden: false, sort: 3 },
  { id: "c4", name: "Beauty", slug: "beauty", description: "Skincare & cosmetics", image: img("beauty"), icon: "Sparkles", hidden: false, sort: 4 },
  { id: "c5", name: "Sports", slug: "sports", description: "Fitness & outdoor gear", image: img("sports"), icon: "Dumbbell", hidden: false, sort: 5 },
  { id: "c6", name: "Toys & Kids", slug: "toys-kids", description: "Fun for the little ones", image: img("toys"), icon: "ToyBrick", hidden: false, sort: 6 },
];

let pc = 0;
const makeProduct = (p: Partial<Product> & { name: string; categoryId: string; price: number }): Product => {
  pc += 1;
  const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return {
    id: `p${pc}`,
    slug,
    description:
      p.description ??
      "Crafted with premium materials and attention to detail, this product blends everyday functionality with a refined, modern design you'll love.",
    specifications: p.specifications ?? [
      { label: "Brand", value: "Nova" },
      { label: "Warranty", value: "1 Year" },
      { label: "Origin", value: "Imported" },
    ],
    images: p.images ?? [img(`${slug}-1`), img(`${slug}-2`), img(`${slug}-3`)],
    oldPrice: p.oldPrice,
    stock: p.stock ?? 25,
    sku: p.sku ?? `NOVA-${1000 + pc}`,
    barcode: p.barcode ?? `62900000${1000 + pc}`,
    weight: p.weight ?? 0.5,
    dimensions: p.dimensions ?? "20 × 15 × 8 cm",
    featured: p.featured ?? false,
    isNew: p.isNew ?? false,
    bestSeller: p.bestSeller ?? false,
    hidden: false,
    rating: p.rating ?? 4.5,
    reviewsCount: p.reviewsCount ?? 42,
    sort: pc,
    createdAt: new Date(Date.now() - pc * 86400000).toISOString(),
    ...p,
  } as Product;
};

export const seedProducts: Product[] = [
  makeProduct({ name: "Aurora Wireless Headphones", categoryId: "c1", price: 1850, oldPrice: 2400, featured: true, bestSeller: true, rating: 4.8, reviewsCount: 214 }),
  makeProduct({ name: "Pulse Smart Watch Series 7", categoryId: "c1", price: 2990, oldPrice: 3800, featured: true, isNew: true, rating: 4.7, reviewsCount: 176 }),
  makeProduct({ name: "Nimbus Bluetooth Speaker", categoryId: "c1", price: 990, oldPrice: 1300, bestSeller: true, rating: 4.6 }),
  makeProduct({ name: "Vortex 4K Action Camera", categoryId: "c1", price: 4200, isNew: true, featured: true, rating: 4.9, reviewsCount: 98 }),
  makeProduct({ name: "Flux Fast Charger 65W", categoryId: "c1", price: 650, oldPrice: 850, rating: 4.5 }),
  makeProduct({ name: "Echo Wireless Earbuds Pro", categoryId: "c1", price: 1200, oldPrice: 1600, bestSeller: true, rating: 4.7, reviewsCount: 320 }),

  makeProduct({ name: "Metro Leather Jacket", categoryId: "c2", price: 2450, oldPrice: 3200, featured: true, rating: 4.6 }),
  makeProduct({ name: "Classic Denim Jeans", categoryId: "c2", price: 890, oldPrice: 1200, bestSeller: true, rating: 4.4 }),
  makeProduct({ name: "Runner Sneakers X", categoryId: "c2", price: 1600, isNew: true, featured: true, rating: 4.8, reviewsCount: 150 }),
  makeProduct({ name: "Everyday Cotton Tee", categoryId: "c2", price: 320, oldPrice: 450, rating: 4.3 }),
  makeProduct({ name: "Aviator Sunglasses", categoryId: "c2", price: 750, oldPrice: 1000, bestSeller: true, rating: 4.5 }),

  makeProduct({ name: "Barista Espresso Machine", categoryId: "c3", price: 5400, oldPrice: 6900, featured: true, bestSeller: true, rating: 4.9, reviewsCount: 210 }),
  makeProduct({ name: "Nordic Ceramic Dinner Set", categoryId: "c3", price: 1350, oldPrice: 1800, rating: 4.6 }),
  makeProduct({ name: "Smart Robot Vacuum", categoryId: "c3", price: 6200, isNew: true, featured: true, rating: 4.7 }),
  makeProduct({ name: "Aroma Diffuser & Lamp", categoryId: "c3", price: 480, oldPrice: 650, rating: 4.4 }),
  makeProduct({ name: "Chef's Knife Set", categoryId: "c3", price: 990, bestSeller: true, rating: 4.6 }),

  makeProduct({ name: "Glow Vitamin C Serum", categoryId: "c4", price: 540, oldPrice: 720, featured: true, bestSeller: true, rating: 4.8, reviewsCount: 410 }),
  makeProduct({ name: "Velvet Matte Lipstick Set", categoryId: "c4", price: 380, oldPrice: 500, isNew: true, rating: 4.5 }),
  makeProduct({ name: "Hydra Facial Cleanser", categoryId: "c4", price: 290, rating: 4.4 }),

  makeProduct({ name: "Pro Yoga Mat", categoryId: "c5", price: 620, oldPrice: 800, bestSeller: true, rating: 4.7 }),
  makeProduct({ name: "Adjustable Dumbbell 20kg", categoryId: "c5", price: 2100, featured: true, rating: 4.6 }),
  makeProduct({ name: "Trail Running Backpack", categoryId: "c5", price: 980, isNew: true, rating: 4.5 }),

  makeProduct({ name: "Build & Play Blocks 200pc", categoryId: "c6", price: 560, oldPrice: 750, bestSeller: true, rating: 4.8 }),
  makeProduct({ name: "Remote Control Racer", categoryId: "c6", price: 890, featured: true, isNew: true, rating: 4.6 }),
];

export const seedBanners: Banner[] = [
  { id: "b1", title: "Summer Mega Sale", subtitle: "Up to 40% off on electronics & gadgets", image: "https://picsum.photos/seed/banner-tech/1600/700", cta: "Shop Electronics", link: "/category/electronics", active: true, sort: 1 },
  { id: "b2", title: "New Season Fashion", subtitle: "Fresh styles just landed for you", image: "https://picsum.photos/seed/banner-fashion/1600/700", cta: "Explore Fashion", link: "/category/fashion", active: true, sort: 2 },
  { id: "b3", title: "Upgrade Your Home", subtitle: "Premium kitchen & living essentials", image: "https://picsum.photos/seed/banner-home/1600/700", cta: "Shop Home", link: "/category/home-kitchen", active: true, sort: 3 },
];

export const seedReviews: Review[] = [
  { id: "r1", name: "Mona A.", avatar: "https://i.pravatar.cc/100?img=47", rating: 5, text: "Fast delivery and the product quality exceeded my expectations. Highly recommend!" },
  { id: "r2", name: "Ahmed K.", avatar: "https://i.pravatar.cc/100?img=12", rating: 5, text: "Great prices and cash on delivery made it super easy. Will order again." },
  { id: "r3", name: "Sara M.", avatar: "https://i.pravatar.cc/100?img=32", rating: 4, text: "Lovely packaging and helpful support team over WhatsApp." },
  { id: "r4", name: "Youssef H.", avatar: "https://i.pravatar.cc/100?img=15", rating: 5, text: "Best online store experience I've had in Egypt. Smooth checkout." },
];

export const seedFaq = [
  { q: "How does cash on delivery work?", a: "You pay in cash to the courier when your order arrives at your doorstep. No prepayment required." },
  { q: "How long does shipping take?", a: "Orders are typically delivered within 2–4 business days depending on your governorate." },
  { q: "Can I track my order?", a: "Yes! Use the Track Order page with your phone number and order number to see live status." },
  { q: "What is your return policy?", a: "You can return items within 14 days of delivery if they are unused and in original packaging." },
  { q: "Do you ship nationwide?", a: "Yes, we deliver to all governorates across Egypt." },
];

export const seedCoupons: Coupon[] = [
  { id: "cp1", code: "WELCOME10", type: "percent", value: 10, minOrder: 500, active: true, usageLimit: 1000, usedCount: 42 },
  { id: "cp2", code: "SAVE100", type: "fixed", value: 100, minOrder: 1000, active: true, usedCount: 15 },
  { id: "cp3", code: "FREESHIP", type: "fixed", value: 60, active: true, usedCount: 88 },
];

export const EGYPT_GOVERNORATES = [
  "Cairo", "Giza", "Alexandria", "Dakahlia", "Sharqia", "Qalyubia", "Gharbia",
  "Beheira", "Menoufia", "Minya", "Assiut", "Sohag", "Qena", "Aswan", "Luxor",
  "Fayoum", "Beni Suef", "Damietta", "Port Said", "Ismailia", "Suez", "Kafr El Sheikh",
  "Matrouh", "Red Sea", "North Sinai", "South Sinai", "New Valley",
];
