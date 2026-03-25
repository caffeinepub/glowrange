import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BlogPost {
    id: bigint;
    title: string;
    content: string;
    date: string;
    excerpt: string;
    imageId: string;
}
export interface CartItem {
    productId: bigint;
    quantity: bigint;
}
export interface Collection {
    id: bigint;
    name: string;
    description: string;
    imageId: string;
}
export interface Product {
    id: bigint;
    name: string;
    description: string;
    category: Category;
    rating: number;
    imageId: string;
    price: number;
    reviewCount: bigint;
}
export enum Category {
    hair = "hair",
    gifts = "gifts",
    wellness = "wellness",
    skincare = "skincare",
    makeup = "makeup"
}
export interface backendInterface {
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    addToWishlist(productId: bigint): Promise<void>;
    clearCart(): Promise<void>;
    getBlogPostCount(): Promise<bigint>;
    getBlogPosts(): Promise<Array<BlogPost>>;
    getCart(): Promise<Array<CartItem>>;
    getCollectionCount(): Promise<bigint>;
    getCollections(): Promise<Array<Collection>>;
    getProductById(productId: bigint): Promise<Product>;
    getProductCount(): Promise<bigint>;
    getProducts(): Promise<Array<Product>>;
    getProductsByCategory(category: Category): Promise<Array<Product>>;
    getProductsByCategoryText(category: string): Promise<Array<Product>>;
    getWishlist(): Promise<Array<bigint>>;
    hasInCart(productId: bigint): Promise<boolean>;
    hasInWishlist(productId: bigint): Promise<boolean>;
    removeFromCart(productId: bigint): Promise<void>;
    removeFromWishlist(productId: bigint): Promise<void>;
}
