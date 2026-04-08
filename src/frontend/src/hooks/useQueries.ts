import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Category,
  Order,
  OrderItem,
  PaymentSettings,
  Product,
  ProductRating,
  ProductSummary,
  Reel,
  Scheme,
  UserProfile,
  Voucher,
} from "../types";
import { getAdminToken } from "../utils/adminStore";
import { useActor } from "./useActor";

function requireActor(
  actor: unknown,
): asserts actor is NonNullable<typeof actor> {
  if (!actor)
    throw new Error("Backend not connected. Please refresh the page.");
}

function requireAdminToken(): string {
  const token = getAdminToken();
  if (!token)
    throw new Error("Admin session expired. Please re-enter the admin code.");
  return token;
}

export function useCategories() {
  const { actor } = useActor();
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => (actor ? actor.getCategories() : []),
    enabled: !!actor,
    staleTime: 0, // always fresh so newly added categories show immediately
  });
}

export function useProducts() {
  const { actor } = useActor();
  return useQuery<ProductSummary[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.getProducts();
        return result;
      } catch (err) {
        console.error("getProducts failed:", err);
        throw err;
      }
    },
    enabled: !!actor,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 min – avoid re-fetching on every page visit
    gcTime: 10 * 60 * 1000,
  });
}

export function useProductById(id: bigint | null) {
  const { actor } = useActor();
  return useQuery<Product | null>({
    queryKey: ["product", id?.toString()],
    queryFn: async () =>
      actor && id != null ? actor.getProductById(id) : null,
    enabled: !!actor && id != null,
  });
}

export function useCallerProfile() {
  const { actor } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => (actor ? actor.getCallerUserProfile() : null),
    enabled: !!actor,
  });
}

export function useIsAdmin() {
  const { actor } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor,
  });
}

export function useAllUsers() {
  const { actor } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ["allUsers"],
    queryFn: async () => (actor ? actor.getAllUsers(getAdminToken()) : []),
    enabled: !!actor,
  });
}

export function useAllOrders() {
  const { actor } = useActor();
  return useQuery<Order[]>({
    queryKey: ["allOrders"],
    queryFn: async () => (actor ? actor.getAllOrders(getAdminToken()) : []),
    enabled: !!actor,
  });
}

export function useAllVouchers() {
  const { actor } = useActor();
  return useQuery<Voucher[]>({
    queryKey: ["allVouchers"],
    queryFn: async () => (actor ? actor.getAllVouchers(getAdminToken()) : []),
    enabled: !!actor,
  });
}

export function usePaymentSettings() {
  const { actor } = useActor();
  return useQuery<PaymentSettings | null>({
    queryKey: ["paymentSettings"],
    queryFn: async () => (actor ? actor.getPaymentSettings() : null),
    enabled: !!actor,
  });
}

export function useUserVouchers() {
  const { actor } = useActor();
  const profileQuery = useCallerProfile();
  return useQuery<Voucher[]>({
    queryKey: ["userVouchers", profileQuery.data?.id?.toString()],
    queryFn: async () => {
      if (!actor || !profileQuery.data) return [];
      return actor.getUserVouchers(profileQuery.data.id);
    },
    enabled: !!actor && !!profileQuery.data,
  });
}

export function useSchemes() {
  const { actor } = useActor();
  return useQuery<Scheme[]>({
    queryKey: ["schemes"],
    queryFn: async () => (actor ? actor.getSchemes() : []),
    enabled: !!actor,
    staleTime: 5 * 60 * 1000,
  });
}

// ---- New feature hooks ----

export function useReels() {
  const { actor } = useActor();
  return useQuery<Reel[]>({
    queryKey: ["reels"],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getReels();
    },
    enabled: !!actor,
  });
}

export function useProductRating(productId: bigint | null) {
  const { actor } = useActor();
  return useQuery<ProductRating>({
    queryKey: ["productRating", productId?.toString()],
    queryFn: async () => {
      if (!actor || productId == null) return { average: 0, count: BigInt(0) };
      try {
        return await (actor as any).getProductRating(productId);
      } catch {
        // Fallback to localStorage rating
        const saved = localStorage.getItem("meet-ratings");
        if (saved) {
          const ratings = JSON.parse(saved) as Record<string, number>;
          const r = ratings[productId.toString()];
          if (r) return { average: r, count: BigInt(1) };
        }
        return { average: 0, count: BigInt(0) };
      }
    },
    enabled: productId != null,
    staleTime: 5 * 60 * 1000,
  });
}

// Mutations

export function useCreateCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      requireActor(actor);
      const token = requireAdminToken();
      return actor.createCategory(token, name);
    },
    onSuccess: (newCategory: Category) => {
      qc.setQueryData(["categories"], (old: Category[] | undefined) => [
        ...(old || []),
        newCategory,
      ]);
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: bigint; name: string }) => {
      requireActor(actor);
      const token = requireAdminToken();
      return actor.updateCategory(token, id, name);
    },
    onSuccess: (updated: Category) => {
      qc.setQueryData(["categories"], (old: Category[] | undefined) =>
        (old || []).map((c) => (c.id === updated.id ? updated : c)),
      );
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      requireActor(actor);
      const token = requireAdminToken();
      return actor.deleteCategory(token, id);
    },
    onSuccess: (_, id: bigint) => {
      qc.setQueryData(["categories"], (old: Category[] | undefined) =>
        (old || []).filter((c) => c.id !== id),
      );
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

type ProductInfo = {
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
};

export function useCreateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (info: ProductInfo) => {
      requireActor(actor);
      const token = requireAdminToken();
      return actor.createProduct(token, info);
    },
    onSuccess: (newProduct: ProductSummary) => {
      qc.setQueryData(["products"], (old: ProductSummary[] | undefined) => [
        ...(old || []),
        newProduct,
      ]);
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, info }: { id: bigint; info: ProductInfo }) => {
      requireActor(actor);
      const token = requireAdminToken();
      return actor.updateProduct(token, id, info);
    },
    onSuccess: (updated: ProductSummary, { id }) => {
      qc.setQueryData(["products"], (old: ProductSummary[] | undefined) =>
        (old || []).map((p) => (p.id === updated.id ? updated : p)),
      );
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product", id.toString()] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      requireActor(actor);
      const token = requireAdminToken();
      return actor.deleteProduct(token, id);
    },
    onSuccess: (_, id: bigint) => {
      qc.setQueryData(["products"], (old: ProductSummary[] | undefined) =>
        (old || []).filter((p) => p.id !== id),
      );
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: { orderId: string; status: string }) => {
      requireActor(actor);
      const token = requireAdminToken();
      return actor.updateOrderStatus(token, orderId, status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allOrders"] }),
  });
}

export function useDeleteOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      requireActor(actor);
      const token = requireAdminToken();
      return actor.deleteOrder(token, orderId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allOrders"] }),
  });
}

export function useCreateOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      items,
      paymentMethod,
      deliveryLocation,
    }: {
      items: OrderItem[];
      paymentMethod: string;
      deliveryLocation: string;
    }) => {
      requireActor(actor);
      return actor.createOrder(items, paymentMethod, deliveryLocation);
    },
    onSuccess: (newOrder: Order) => {
      // Save order ID to localStorage for profile page retrieval
      try {
        const existing = JSON.parse(
          localStorage.getItem("meet-order-ids") || "[]",
        ) as string[];
        if (!existing.includes(newOrder.id)) {
          existing.unshift(newOrder.id);
          localStorage.setItem("meet-order-ids", JSON.stringify(existing));
        }
      } catch {}
      qc.invalidateQueries({ queryKey: ["allOrders"] });
      qc.invalidateQueries({ queryKey: ["userVouchers"] });
      qc.invalidateQueries({ queryKey: ["myOrders"] });
    },
  });
}

export function useMyOrders() {
  const { actor } = useActor();
  return useQuery<Order[]>({
    queryKey: ["myOrders"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const orderIds = JSON.parse(
          localStorage.getItem("meet-order-ids") || "[]",
        ) as string[];
        if (!orderIds.length) return [];
        const orders = await Promise.all(
          orderIds.map((id) => actor.getOrderById(id)),
        );
        return orders.filter((o): o is Order => o != null);
      } catch {
        return [];
      }
    },
    enabled: !!actor,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, whatsapp }: { name: string; whatsapp: string }) => {
      requireActor(actor);
      return actor.saveCallerUserProfile(name, whatsapp);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["callerProfile"] }),
  });
}

export function useSetPaymentSettings() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      upiId,
      qrImage,
      qrImageType,
    }: {
      upiId: string;
      qrImage: Uint8Array;
      qrImageType: string;
    }) => {
      requireActor(actor);
      const token = requireAdminToken();
      return actor.setPaymentSettings(token, upiId, qrImage, qrImageType);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["paymentSettings"] }),
  });
}

export function useCreateScheme() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
      couponCode,
    }: {
      title: string;
      description: string;
      couponCode: string;
    }) => {
      requireActor(actor);
      const token = requireAdminToken();
      return actor.createScheme(token, title, description, couponCode);
    },
    onSuccess: (newScheme: Scheme) => {
      qc.setQueryData(["schemes"], (old: Scheme[] | undefined) => [
        ...(old || []),
        newScheme,
      ]);
      qc.invalidateQueries({ queryKey: ["schemes"] });
    },
  });
}

export function useDeleteScheme() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      requireActor(actor);
      const token = requireAdminToken();
      return actor.deleteScheme(token, id);
    },
    onSuccess: (_, id: bigint) => {
      qc.setQueryData(["schemes"], (old: Scheme[] | undefined) =>
        (old || []).filter((s) => s.id !== id),
      );
      qc.invalidateQueries({ queryKey: ["schemes"] });
    },
  });
}

export function useCreateReel() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      videoUrl,
      productId,
    }: {
      title: string;
      videoUrl: string;
      productId: bigint | null;
    }) => {
      requireActor(actor);
      const token = requireAdminToken();
      return actor.createReel(token, title, videoUrl, productId);
    },
    onSuccess: (newReel: Reel) => {
      qc.setQueryData(["reels"], (old: Reel[] | undefined) => [
        ...(old || []),
        newReel,
      ]);
      qc.invalidateQueries({ queryKey: ["reels"] });
    },
  });
}

export function useDeleteReel() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      requireActor(actor);
      const token = requireAdminToken();
      return actor.deleteReel(token, id);
    },
    onSuccess: (_, id: bigint) => {
      qc.setQueryData(["reels"], (old: Reel[] | undefined) =>
        (old || []).filter((r) => r.id !== id),
      );
      qc.invalidateQueries({ queryKey: ["reels"] });
    },
  });
}

export function useInstagramHandle() {
  const { actor } = useActor();
  return useQuery<string>({
    queryKey: ["instagramHandle"],
    queryFn: async () => {
      if (!actor) return "";
      try {
        return await actor.getInstagramHandle();
      } catch {
        return "";
      }
    },
    enabled: !!actor,
  });
}

export interface ProductImage {
  imageData: Uint8Array;
  imageType: string;
}

export function useProductImages(productId: bigint | null) {
  const { actor } = useActor();
  return useQuery<ProductImage[]>({
    queryKey: ["productImages", productId?.toString()],
    queryFn: async () => {
      if (!actor || productId == null) return [];
      try {
        return await actor.getProductImages(productId);
      } catch {
        return [];
      }
    },
    enabled: !!actor && productId != null,
    staleTime: 5 * 60 * 1000, // 5 min – images rarely change; prevents per-card refetch
    gcTime: 15 * 60 * 1000,
  });
}

export function useAddProductImage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  type AddImageVars = {
    productId: bigint;
    imageData: Uint8Array;
    imageType: string;
  };
  return useMutation<unknown, Error, AddImageVars>({
    mutationFn: async ({ productId, imageData, imageType }: AddImageVars) => {
      requireActor(actor);
      const token = requireAdminToken();
      return actor.addProductImage(token, productId, imageData, imageType);
    },
    onSuccess: (_: unknown, { productId }: AddImageVars) => {
      qc.invalidateQueries({
        queryKey: ["productImages", productId.toString()],
      });
    },
  });
}

export function useRemoveProductImage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  type RemoveImageVars = { productId: bigint; imageIndex: bigint };
  return useMutation<unknown, Error, RemoveImageVars>({
    mutationFn: async ({ productId, imageIndex }: RemoveImageVars) => {
      requireActor(actor);
      const token = requireAdminToken();
      return actor.removeProductImage(token, productId, imageIndex);
    },
    onSuccess: (_: unknown, { productId }: RemoveImageVars) => {
      qc.invalidateQueries({
        queryKey: ["productImages", productId.toString()],
      });
    },
  });
}
