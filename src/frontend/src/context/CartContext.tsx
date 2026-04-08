import { type ReactNode, createContext, useContext, useState } from "react";
import type { ProductSummary } from "../types";

export interface CartItem {
  product: ProductSummary;
  quantity: number;
  selectedSize?: string;
  selectedColour?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: ProductSummary,
    selectedSize?: string,
    selectedColour?: string,
  ) => void;
  removeItem: (productId: bigint) => void;
  updateQuantity: (productId: bigint, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (
    product: ProductSummary,
    selectedSize?: string,
    selectedColour?: string,
  ) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) =>
          i.product.id === product.id &&
          i.selectedSize === selectedSize &&
          i.selectedColour === selectedColour,
      );
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id &&
          i.selectedSize === selectedSize &&
          i.selectedColour === selectedColour
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      return [...prev, { product, quantity: 1, selectedSize, selectedColour }];
    });
  };

  const removeItem = (productId: bigint) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: bigint, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i)),
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce(
    (sum, i) =>
      sum +
      (Number(i.product.mrp) - Number(i.product.discountAmount)) * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
