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
    createCategory(name: string): Promise<Category>;
    createOrder(items: Array<OrderItem>, paymentMethod: string, deliveryLocation: string): Promise<Order>;
    createProduct(productInfo: {
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
    createScheme(title: string, description: string, couponCode: string): Promise<Scheme>;
    deleteCategory(id: bigint): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    deleteScheme(id: bigint): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getAllUsers(): Promise<Array<UserProfile>>;
    getAllVouchers(): Promise<Array<Voucher>>;
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
    setPaymentSettings(upiId: string, qrImage: Uint8Array, qrImageType: string): Promise<void>;
    updateCategory(id: bigint, name: string): Promise<Category>;
    updateOrderStatus(orderId: string, status: string): Promise<void>;
    updateProduct(id: bigint, productInfo: {
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
}
