import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Category,
  Order,
  OrderItem,
  PaymentSettings,
  Product,
  ProductSummary,
  Scheme,
  UserProfile,
  Voucher,
} from "../backend.d";
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
      // Directly update cache with new category
      qc.setQueryData(["categories"], (old: Category[] | undefined) => [
        ...(old || []),
        newCategory,
      ]);
      // Also trigger background sync
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
      const candid_info = {
        ...info,
        imageType: [info.imageType] as [] | [string],
      };
      return actor.createProduct(token, candid_info);
    },
    onSuccess: (newProduct: ProductSummary) => {
      // Immediately add the returned summary to the cache so it shows up right away
      qc.setQueryData(["products"], (old: ProductSummary[] | undefined) => [
        ...(old || []),
        newProduct,
      ]);
      // Also trigger a background sync from the backend
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
      const candid_info = {
        ...info,
        imageType: [info.imageType] as [] | [string],
      };
      return actor.updateProduct(token, id, candid_info);
    },
    onSuccess: (updated: ProductSummary, { id }) => {
      // Update the specific product in cache
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
      // Remove from cache immediately
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allOrders"] });
      qc.invalidateQueries({ queryKey: ["userVouchers"] });
    },
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
