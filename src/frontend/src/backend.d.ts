import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
    }): Promise<Product>;
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
    }): Promise<Product>;
    deleteProduct(adminToken: string, id: bigint): Promise<void>;
    createScheme(adminToken: string, title: string, description: string, couponCode: string): Promise<Scheme>;
    deleteScheme(adminToken: string, id: bigint): Promise<void>;
    getAllOrders(adminToken: string): Promise<Array<Order>>;
    getAllUsers(adminToken: string): Promise<Array<UserProfile>>;
    getAllVouchers(adminToken: string): Promise<Array<Voucher>>;
    updateOrderStatus(adminToken: string, orderId: string, status: string): Promise<void>;
    setPaymentSettings(adminToken: string, upiId: string, qrImage: Uint8Array, qrImageType: string): Promise<void>;
    // Public / user functions (no admin token)
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategories(): Promise<Array<Category>>;
    getOrderById(orderId: string): Promise<Order | null>;
    getPaymentSettings(): Promise<PaymentSettings | null>;
    getProductById(id: bigint): Promise<Product>;
    getProducts(): Promise<Array<Product>>;
    getSchemes(): Promise<Array<Scheme>>;
    getUserOrders(userId: Principal): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserVouchers(userId: Principal): Promise<Array<Voucher>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(name: string, whatsapp: string): Promise<void>;
    createOrder(items: Array<OrderItem>, paymentMethod: string, deliveryLocation: string): Promise<Order>;
}
