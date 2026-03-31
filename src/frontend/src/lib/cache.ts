import type { Category, ProductSummary } from "../backend.d";

// Module-level maps that persist across renders (not React state).
// These survive page navigations within the same session.

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const productsCache: { data: ProductSummary[] | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};

const categoriesCache: { data: Category[] | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};

// productId (string) -> array of blob URLs
const productImagesCache = new Map<string, string[]>();

function isFresh(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

// ----- Products -----

export function getCachedProducts(): ProductSummary[] | null {
  if (productsCache.data && isFresh(productsCache.timestamp)) {
    return productsCache.data;
  }
  return null;
}

export function setCachedProducts(products: ProductSummary[]): void {
  productsCache.data = products;
  productsCache.timestamp = Date.now();
}

export function invalidateProductsCache(): void {
  productsCache.data = null;
  productsCache.timestamp = 0;
}

// ----- Categories -----

export function getCachedCategories(): Category[] | null {
  if (categoriesCache.data && isFresh(categoriesCache.timestamp)) {
    return categoriesCache.data;
  }
  return null;
}

export function setCachedCategories(categories: Category[]): void {
  categoriesCache.data = categories;
  categoriesCache.timestamp = Date.now();
}

export function invalidateCategoriesCache(): void {
  categoriesCache.data = null;
  categoriesCache.timestamp = 0;
}

// ----- Product Images (blob URL cache) -----

export function getCachedProductImages(productId: string): string[] | null {
  return productImagesCache.get(productId) ?? null;
}

export function setCachedProductImages(
  productId: string,
  images: string[],
): void {
  productImagesCache.set(productId, images);
}

export function invalidateProductImagesCache(productId: string): void {
  productImagesCache.delete(productId);
}
