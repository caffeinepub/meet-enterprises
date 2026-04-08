import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Reel {
    id: bigint;
    title: string;
    createdAt: bigint;
    productId?: bigint;
    videoUrl: string;
}
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
export interface Voucher {
    id: bigint;
    value: bigint;
    code: string;
    userId: Principal;
    createdAt: bigint;
    orderId: string;
}
export interface ReelComment {
    id: bigint;
    userName: string;
    userId: Principal;
    createdAt: bigint;
    text: string;
    reelId: bigint;
}
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
export interface PaymentSettings {
    qrImage: Uint8Array;
    qrImageType: string;
    upiId: string;
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
export interface Category {
    id: bigint;
    name: string;
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
export interface RatingSummary {
    count: bigint;
    average: number;
}
export interface backendInterface {
    addProductImage(adminToken: string, productId: bigint, imageData: Uint8Array, imageType: string): Promise<bigint>;
    addReelComment(reelId: bigint, text: string): Promise<ReelComment>;
    addToWishlist(productId: bigint): Promise<void>;
    createCategory(adminToken: string, name: string): Promise<Category>;
    createOrder(items: Array<OrderItem>, paymentMethod: string, deliveryLocation: string): Promise<Order>;
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
    createReel(adminToken: string, title: string, videoUrl: string, productId: bigint | null): Promise<Reel>;
    createScheme(adminToken: string, title: string, description: string, couponCode: string): Promise<Scheme>;
    deleteCategory(adminToken: string, id: bigint): Promise<void>;
    deleteOrder(adminToken: string, orderId: string): Promise<void>;
    deleteProduct(adminToken: string, id: bigint): Promise<void>;
    deleteReel(adminToken: string, id: bigint): Promise<void>;
    deleteScheme(adminToken: string, id: bigint): Promise<void>;
    generateDeliveryCode(adminToken: string, orderId: string): Promise<string>;
    getAllOrders(adminToken: string): Promise<Array<Order>>;
    getAllUsers(adminToken: string): Promise<Array<UserProfile>>;
    getAllVouchers(adminToken: string): Promise<Array<Voucher>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCategories(): Promise<Array<Category>>;
    getDeliveryCode(adminToken: string, orderId: string): Promise<string | null>;
    getInstagramHandle(): Promise<string>;
    getOrderById(orderId: string): Promise<Order | null>;
    getOrderDeliveryCode(orderId: string): Promise<string | null>;
    getPaymentSettings(): Promise<PaymentSettings | null>;
    getProductById(id: bigint): Promise<Product>;
    getProductImages(productId: bigint): Promise<Array<ProductImage>>;
    getProductRating(productId: bigint): Promise<RatingSummary>;
    getProducts(): Promise<Array<ProductSummary>>;
    getReelComments(reelId: bigint): Promise<Array<ReelComment>>;
    getReelLikeCount(reelId: bigint): Promise<bigint>;
    getReels(): Promise<Array<Reel>>;
    getSchemes(): Promise<Array<Scheme>>;
    getTheme(): Promise<string>;
    getUserOrders(userId: Principal): Promise<Array<Order>>;
    getUserProductRating(productId: bigint): Promise<bigint | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserVouchers(userId: Principal): Promise<Array<Voucher>>;
    getUserWishlist(userId: Principal): Promise<Array<bigint>>;
    isReelLiked(reelId: bigint, userId: Principal): Promise<boolean>;
    likeReel(reelId: bigint): Promise<void>;
    rateProduct(productId: bigint, rating: bigint): Promise<void>;
    removeFromWishlist(productId: bigint): Promise<void>;
    removeProductImage(adminToken: string, productId: bigint, imageIndex: bigint): Promise<void>;
    saveCallerUserProfile(name: string, whatsapp: string): Promise<void>;
    setInstagramHandle(adminToken: string, handle: string): Promise<void>;
    setPaymentSettings(adminToken: string, upiId: string, qrImage: Uint8Array, qrImageType: string): Promise<void>;
    setTheme(adminToken: string, themeId: string): Promise<void>;
    unlikeReel(reelId: bigint): Promise<void>;
    updateCategory(adminToken: string, id: bigint, name: string): Promise<Category>;
    updateOrderStatus(adminToken: string, orderId: string, status: string): Promise<void>;
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
    verifyDeliveryCode(orderId: string, code: string): Promise<boolean>;
}
