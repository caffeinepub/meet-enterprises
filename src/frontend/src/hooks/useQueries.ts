import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Category,
  Order,
  OrderItem,
  PaymentSettings,
  Product,
  Scheme,
  UserProfile,
  Voucher,
} from "../backend.d";
import { useActor } from "./useActor";

export function useCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => (actor ? actor.getCategories() : []),
    enabled: !!actor && !isFetching,
  });
}

export function useProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => (actor ? actor.getProducts() : []),
    enabled: !!actor && !isFetching,
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => (actor ? actor.getCallerUserProfile() : null),
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => (actor ? actor.isCallerAdmin() : false),
    enabled: !!actor && !isFetching,
  });
}

export function useAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ["allUsers"],
    queryFn: async () => (actor ? actor.getAllUsers() : []),
    enabled: !!actor && !isFetching,
  });
}

export function useAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["allOrders"],
    queryFn: async () => (actor ? actor.getAllOrders() : []),
    enabled: !!actor && !isFetching,
  });
}

export function useAllVouchers() {
  const { actor, isFetching } = useActor();
  return useQuery<Voucher[]>({
    queryKey: ["allVouchers"],
    queryFn: async () => (actor ? actor.getAllVouchers() : []),
    enabled: !!actor && !isFetching,
  });
}

export function usePaymentSettings() {
  const { actor, isFetching } = useActor();
  return useQuery<PaymentSettings | null>({
    queryKey: ["paymentSettings"],
    queryFn: async () => (actor ? actor.getPaymentSettings() : null),
    enabled: !!actor && !isFetching,
  });
}

export function useUserVouchers() {
  const { actor, isFetching } = useActor();
  const profileQuery = useCallerProfile();
  return useQuery<Voucher[]>({
    queryKey: ["userVouchers", profileQuery.data?.id?.toString()],
    queryFn: async () => {
      if (!actor || !profileQuery.data) return [];
      return actor.getUserVouchers(profileQuery.data.id);
    },
    enabled: !!actor && !isFetching && !!profileQuery.data,
  });
}

export function useSchemes() {
  const { actor, isFetching } = useActor();
  return useQuery<Scheme[]>({
    queryKey: ["schemes"],
    queryFn: async () => (actor ? actor.getSchemes() : []),
    enabled: !!actor && !isFetching,
  });
}

// Mutations

export function useCreateCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => actor!.createCategory(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: bigint; name: string }) =>
      actor!.updateCategory(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
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
    mutationFn: (info: ProductInfo) => actor!.createProduct(info),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, info }: { id: bigint; info: ProductInfo }) =>
      actor!.updateProduct(id, info),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      actor!.updateOrderStatus(orderId, status),
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
    }) => actor!.createOrder(items, paymentMethod, deliveryLocation),
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
    mutationFn: ({ name, whatsapp }: { name: string; whatsapp: string }) =>
      actor!.saveCallerUserProfile(name, whatsapp),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["callerProfile"] }),
  });
}

export function useSetPaymentSettings() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      upiId,
      qrImage,
      qrImageType,
    }: {
      upiId: string;
      qrImage: Uint8Array;
      qrImageType: string;
    }) => actor!.setPaymentSettings(upiId, qrImage, qrImageType),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["paymentSettings"] }),
  });
}

export function useCreateScheme() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      title,
      description,
      couponCode,
    }: {
      title: string;
      description: string;
      couponCode: string;
    }) => actor!.createScheme(title, description, couponCode),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schemes"] }),
  });
}

export function useDeleteScheme() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteScheme(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schemes"] }),
  });
}
