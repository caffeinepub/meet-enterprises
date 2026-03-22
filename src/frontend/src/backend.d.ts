import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;

// Full product with image data - returned by getProductById()
export interface Product {
    id: bigint;
    mrp: bigint;
    categoryId: bigint;
    inStock: boolean;
    imageType: string;
    discountAmount: bigint;
    name: string;
    description: string;
    sizes: Array<string>;
    image: Uint8Array;
    colours: Array<string>;
}

// Lightweight product summary without image - returned by getProducts()
export interface ProductSummary {
    id: bigint;
    mrp: bigint;
    categoryId: bigint;
    inStock: boolean;
    discountAmount: bigint;
    name: string;
    description: string;
    sizes: Array<string>;
    colours: Array<string>;
}

export interface PaymentSettings {
    qrImage: Uint8Array;
    qrImageType: string;
    upiId: string;
}
export interface Voucher {
    id: bigint;
    value: bigint;
    code: string;
    userId: Principal;
    createdAt: bigint;
    orderId: string;
}
export interface Category {
    id: bigint;
    name: string;
}
export interface OrderItem {
    productId: bigint;
    quantity: bigint;
    price: bigint;
}
export interface Scheme {
    id: bigint;
    couponCode: string;
    title: string;
    createdAt: bigint;
    description: string;
}
export interface Order {
    id: string;
    status: string;
    paymentMethod: string;
    userId: Principal;
    createdAt: bigint;
    deliveryLocation: string;
    totalAmount: bigint;
    items: Array<OrderItem>;
}
export interface UserProfile {
    id: Principal;
    name: string;
    whatsapp: string;
}

export interface Reel {
    id: bigint;
    title: string;
    videoUrl: string;
    productId: bigint | null;
    createdAt: bigint;
}

export interface ReelComment {
    id: bigint;
    reelId: bigint;
    userId: Principal;
    userName: string;
    text: string;
    createdAt: bigint;
}

export interface ProductRating {
    average: number;
    count: bigint;
}

export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    // Admin functions (require adminToken)
    createCategory(adminToken: string, name: string): Promise<Category>;
    updateCategory(adminToken: string, id: bigint, name: string): Promise<Category>;
    deleteCategory(adminToken: string, id: bigint): Promise<void>;
    createProduct(adminToken: string, productInfo: {
        mrp: bigint;
        categoryId: bigint;
        inStock: boolean;
        imageType: string;
        discountAmount: bigint;
        name: string;
        description: string;
        sizes: Array<string>;
        image: Uint8Array;
        colours: Array<string>;
    }): Promise<ProductSummary>;
    updateProduct(adminToken: string, id: bigint, productInfo: {
        mrp: bigint;
        categoryId: bigint;
        inStock: boolean;
        imageType: string;
        discountAmount: bigint;
        name: string;
        description: string;
        sizes: Array<string>;
        image: Uint8Array;
        colours: Array<string>;
    }): Promise<ProductSummary>;
    deleteProduct(adminToken: string, id: bigint): Promise<void>;
    createScheme(adminToken: string, title: string, description: string, couponCode: string): Promise<Scheme>;
    deleteScheme(adminToken: string, id: bigint): Promise<void>;
    getAllOrders(adminToken: string): Promise<Array<Order>>;
    getAllUsers(adminToken: string): Promise<Array<UserProfile>>;
    getAllVouchers(adminToken: string): Promise<Array<Voucher>>;
    updateOrderStatus(adminToken: string, orderId: string, status: string): Promise<void>;
    setPaymentSettings(adminToken: string, upiId: string, qrImage: Uint8Array, qrImageType: string): Promise<void>;
    setInstagramHandle(adminToken: string, handle: string): Promise<void>;
    getInstagramHandle(): Promise<string>;
    // Public / user functions (no admin token)
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategories(): Promise<Array<Category>>;
    getOrderById(orderId: string): Promise<Order | null>;
    getPaymentSettings(): Promise<PaymentSettings | null>;
    getProductById(id: bigint): Promise<Product>;
    getProducts(): Promise<Array<ProductSummary>>;
    getSchemes(): Promise<Array<Scheme>>;
    getUserOrders(userId: Principal): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserVouchers(userId: Principal): Promise<Array<Voucher>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(name: string, whatsapp: string): Promise<void>;
    createReel(adminToken: string, title: string, videoUrl: string, productId: bigint | null): Promise<Reel>;
    deleteReel(adminToken: string, id: bigint): Promise<void>;
    getReels(): Promise<Array<Reel>>;
    generateDeliveryCode(adminToken: string, orderId: string): Promise<string>;
    verifyDeliveryCode(orderId: string, code: string): Promise<boolean>;
    getOrderDeliveryCode(orderId: string): Promise<string | null>;
    createOrder(items: Array<OrderItem>, paymentMethod: string, deliveryLocation: string): Promise<Order>;
    addReelComment(reelId: bigint, text: string): Promise<ReelComment>;
    getReelComments(reelId: bigint): Promise<Array<ReelComment>>;
    likeReel(reelId: bigint): Promise<void>;
    unlikeReel(reelId: bigint): Promise<void>;
    isReelLiked(reelId: bigint, userId: Principal): Promise<boolean>;
    getReelLikeCount(reelId: bigint): Promise<bigint>;
    getInstagramHandle(): Promise<string>;
    getUserWishlist(userId: Principal): Promise<Array<bigint>>;
    addToWishlist(productId: bigint): Promise<void>;
    removeFromWishlist(productId: bigint): Promise<void>;
    rateProduct(productId: bigint, rating: bigint): Promise<void>;
    getUserProductRating(productId: bigint): Promise<bigint | null>;
    getProductRating(productId: bigint): Promise<ProductRating>;
    getTheme(): Promise<string>;
    setTheme(adminToken: string, themeId: string): Promise<void>;
}
