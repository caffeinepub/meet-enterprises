import type { Principal } from "@icp-sdk/core/principal";

export type { Principal };

export interface UserProfile {
  id: Principal;
  name: string;
  whatsapp: string;
}

export interface Category {
  id: bigint;
  name: string;
}

export interface Product {
  id: bigint;
  name: string;
  description: string;
  mrp: bigint;
  discountAmount: bigint;
  categoryId: bigint;
  sizes: string[];
  colours: string[];
  image: Uint8Array;
  imageType: string;
  inStock: boolean;
}

export interface ProductSummary {
  id: bigint;
  name: string;
  description: string;
  mrp: bigint;
  discountAmount: bigint;
  categoryId: bigint;
  sizes: string[];
  colours: string[];
  inStock: boolean;
}

export interface ProductImage {
  imageData: Uint8Array;
  imageType: string;
}

export interface OrderItem {
  productId: bigint;
  quantity: bigint;
  price: bigint;
}

export interface Order {
  id: string;
  userId: Principal;
  items: OrderItem[];
  totalAmount: bigint;
  paymentMethod: string;
  status: string;
  createdAt: bigint;
  deliveryLocation: string;
}

export interface Voucher {
  id: bigint;
  userId: Principal;
  orderId: string;
  code: string;
  value: bigint;
  createdAt: bigint;
}

export interface Scheme {
  id: bigint;
  title: string;
  description: string;
  couponCode: string;
  createdAt: bigint;
}

export interface PaymentSettings {
  upiId: string;
  qrImage: Uint8Array;
  qrImageType: string;
}

export interface Reel {
  id: bigint;
  title: string;
  videoUrl: string;
  productId: bigint | null;
  createdAt: bigint;
}

export interface ProductRating {
  average: number;
  count: bigint;
}

export interface ReelComment {
  id: bigint;
  reelId: bigint;
  userId: Principal;
  userName: string;
  text: string;
  createdAt: bigint;
}

export interface BackendActor {
  // User profile
  getCallerUserProfile(): Promise<UserProfile | null>;
  getUserProfile(user: Principal): Promise<UserProfile | null>;
  saveCallerUserProfile(name: string, whatsapp: string): Promise<void>;
  getAllUsers(adminToken: string): Promise<UserProfile[]>;
  isCallerAdmin(): Promise<boolean>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(adminToken: string, name: string): Promise<Category>;
  updateCategory(
    adminToken: string,
    id: bigint,
    name: string,
  ): Promise<Category>;
  deleteCategory(adminToken: string, id: bigint): Promise<void>;

  // Products
  getProducts(): Promise<ProductSummary[]>;
  getProductById(id: bigint): Promise<Product>;
  getProductImages(productId: bigint): Promise<ProductImage[]>;
  addProductImage(
    adminToken: string,
    productId: bigint,
    imageData: Uint8Array,
    imageType: string,
  ): Promise<bigint>;
  removeProductImage(
    adminToken: string,
    productId: bigint,
    imageIndex: bigint,
  ): Promise<void>;
  createProduct(
    adminToken: string,
    info: {
      name: string;
      description: string;
      mrp: bigint;
      discountAmount: bigint;
      categoryId: bigint;
      sizes: string[];
      colours: string[];
      image: Uint8Array;
      imageType: string;
      inStock: boolean;
    },
  ): Promise<ProductSummary>;
  updateProduct(
    adminToken: string,
    id: bigint,
    info: {
      name: string;
      description: string;
      mrp: bigint;
      discountAmount: bigint;
      categoryId: bigint;
      sizes: string[];
      colours: string[];
      image: Uint8Array;
      imageType: string;
      inStock: boolean;
    },
  ): Promise<ProductSummary>;
  deleteProduct(adminToken: string, id: bigint): Promise<void>;

  // Orders
  createOrder(
    items: OrderItem[],
    paymentMethod: string,
    deliveryLocation: string,
  ): Promise<Order>;
  getOrderById(orderId: string): Promise<Order | null>;
  getUserOrders(userId: Principal): Promise<Order[]>;
  getAllOrders(adminToken: string): Promise<Order[]>;
  updateOrderStatus(
    adminToken: string,
    orderId: string,
    status: string,
  ): Promise<void>;
  deleteOrder(adminToken: string, orderId: string): Promise<void>;

  // Delivery codes
  generateDeliveryCode(adminToken: string, orderId: string): Promise<string>;
  getDeliveryCode(adminToken: string, orderId: string): Promise<string | null>;
  getOrderDeliveryCode(orderId: string): Promise<string | null>;
  verifyDeliveryCode(orderId: string, code: string): Promise<boolean>;

  // Vouchers
  getAllVouchers(adminToken: string): Promise<Voucher[]>;
  getUserVouchers(userId: Principal): Promise<Voucher[]>;

  // Payment settings
  getPaymentSettings(): Promise<PaymentSettings | null>;
  setPaymentSettings(
    adminToken: string,
    upiId: string,
    qrImage: Uint8Array,
    qrImageType: string,
  ): Promise<void>;

  // Schemes
  getSchemes(): Promise<Scheme[]>;
  createScheme(
    adminToken: string,
    title: string,
    description: string,
    couponCode: string,
  ): Promise<Scheme>;
  deleteScheme(adminToken: string, id: bigint): Promise<void>;

  // Reels
  getReels(): Promise<Reel[]>;
  createReel(
    adminToken: string,
    title: string,
    videoUrl: string,
    productId: bigint | null,
  ): Promise<Reel>;
  deleteReel(adminToken: string, id: bigint): Promise<void>;

  // Reel comments
  addReelComment(reelId: bigint, text: string): Promise<ReelComment>;
  getReelComments(reelId: bigint): Promise<ReelComment[]>;

  // Reel likes
  likeReel(reelId: bigint): Promise<void>;
  unlikeReel(reelId: bigint): Promise<void>;
  isReelLiked(reelId: bigint, userId: Principal): Promise<boolean>;
  getReelLikeCount(reelId: bigint): Promise<bigint>;

  // Wishlist
  addToWishlist(productId: bigint): Promise<void>;
  removeFromWishlist(productId: bigint): Promise<void>;
  getUserWishlist(userId: Principal): Promise<bigint[]>;

  // Ratings
  rateProduct(productId: bigint, rating: bigint): Promise<void>;
  getUserProductRating(productId: bigint): Promise<bigint | null>;
  getProductRating(productId: bigint): Promise<ProductRating>;

  // Theme
  getTheme(): Promise<string>;
  setTheme(adminToken: string, themeId: string): Promise<void>;

  // Instagram
  getInstagramHandle(): Promise<string>;
  setInstagramHandle(adminToken: string, handle: string): Promise<void>;
}
