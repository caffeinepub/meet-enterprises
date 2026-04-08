import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import {
  Check,
  Edit2,
  Gift,
  ImagePlus,
  Instagram,
  Key,
  Loader2,
  MapPin,
  Package,
  Palette,
  Play,
  Plus,
  Settings,
  ShoppingBag,
  Tag,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import {
  useAddProductImage,
  useAllOrders,
  useAllUsers,
  useCategories,
  useCreateCategory,
  useCreateProduct,
  useCreateReel,
  useCreateScheme,
  useDeleteCategory,
  useDeleteOrder,
  useDeleteProduct,
  useDeleteReel,
  useDeleteScheme,
  usePaymentSettings,
  useProductImages,
  useProducts,
  useReels,
  useRemoveProductImage,
  useSchemes,
  useSetPaymentSettings,
  useUpdateCategory,
  useUpdateOrderStatus,
  useUpdateProduct,
} from "../hooks/useQueries";
import type { Reel } from "../types";
import { getAdminToken, setAdminToken } from "../utils/adminStore";
import {
  fileToUint8Array,
  formatPrice,
  uint8ToDataUrl,
} from "../utils/imageUtils";
import { THEMES, type ThemeId, applyTheme } from "../utils/themes";

const ADMIN_CODE = "2537";
const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

export function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const handleUnlock = () => {
    if (code === ADMIN_CODE) {
      setAdminToken(code);
      setUnlocked(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  if (!unlocked) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-luxury p-10 w-full max-w-sm text-center"
        >
          <div className="w-12 h-12 bg-gold/10 flex items-center justify-center mx-auto mb-6">
            <Settings className="w-6 h-6 text-gold" />
          </div>
          <h1 className="font-serif text-2xl text-gold uppercase tracking-widest mb-2">
            Admin Panel
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Enter the 4-digit access code
          </p>
          <Input
            type="password"
            maxLength={4}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            placeholder="· · · ·"
            className={`text-center text-2xl tracking-[0.5em] bg-secondary border-gold-border mb-4 ${
              error ? "border-destructive" : ""
            }`}
            data-ocid="admin.passcode.input"
          />
          {error && (
            <p className="text-destructive text-xs mb-3">
              Incorrect code. Try again.
            </p>
          )}
          <Button
            className="btn-gold w-full tracking-widest uppercase"
            onClick={handleUnlock}
            data-ocid="admin.passcode.submit"
          >
            Unlock
          </Button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-serif text-4xl text-gold uppercase tracking-widest mb-2">
          Admin Panel
        </h1>
        <div className="w-16 h-px bg-gold mb-10" />

        <Tabs defaultValue="users">
          <TabsList className="grid grid-cols-5 md:grid-cols-9 mb-8 bg-secondary border border-gold-border">
            {[
              {
                value: "users",
                icon: <Users className="w-3.5 h-3.5" />,
                label: "Users",
              },
              {
                value: "categories",
                icon: <Tag className="w-3.5 h-3.5" />,
                label: "Categories",
              },
              {
                value: "products",
                icon: <Package className="w-3.5 h-3.5" />,
                label: "Products",
              },
              {
                value: "orders",
                icon: <ShoppingBag className="w-3.5 h-3.5" />,
                label: "Orders",
              },
              {
                value: "schemes",
                icon: <Gift className="w-3.5 h-3.5" />,
                label: "Schemes",
              },
              {
                value: "reels",
                icon: <Play className="w-3.5 h-3.5" />,
                label: "Reels",
              },
              {
                value: "appearance",
                icon: <Palette className="w-3.5 h-3.5" />,
                label: "Appearance",
              },
              {
                value: "instagram",
                icon: <Instagram className="w-3.5 h-3.5" />,
                label: "Instagram",
              },
              {
                value: "settings",
                icon: <Settings className="w-3.5 h-3.5" />,
                label: "Settings",
              },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5 text-xs tracking-widest uppercase data-[state=active]:text-gold data-[state=active]:bg-background"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
          <TabsContent value="categories">
            <CategoriesTab />
          </TabsContent>
          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>
          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>
          <TabsContent value="schemes">
            <SchemesTab />
          </TabsContent>
          <TabsContent value="reels">
            <ReelsTab />
          </TabsContent>
          <TabsContent value="appearance">
            <AppearanceTab />
          </TabsContent>
          <TabsContent value="instagram">
            <InstagramTab />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </main>
  );
}

function UsersTab() {
  const { data: users, isLoading } = useAllUsers();
  const { data: orders } = useAllOrders();

  const getOrderCount = (userId: string) =>
    orders?.filter((o) => o.userId.toString() === userId).length ?? 0;

  return (
    <div>
      <h2 className="font-serif text-2xl text-gold uppercase tracking-widest mb-6">
        Users
      </h2>
      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <div className="card-luxury overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-gold-border hover:bg-transparent">
                <TableHead className="text-gold-muted uppercase text-xs tracking-widest">
                  Name
                </TableHead>
                <TableHead className="text-gold-muted uppercase text-xs tracking-widest">
                  WhatsApp
                </TableHead>
                <TableHead className="text-gold-muted uppercase text-xs tracking-widest">
                  Orders
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!users?.length ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground py-8"
                  >
                    No users yet
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, idx) => (
                  <TableRow
                    key={user.id.toString()}
                    className="border-gold-border"
                    data-ocid={`admin.user.item.${idx + 1}`}
                  >
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.whatsapp}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-gold/10 text-gold border-gold-border">
                        {getOrderCount(user.id.toString())}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function CategoriesTab() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<bigint | null>(null);
  const [editName, setEditName] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createCategory.mutateAsync(newName.trim());
      setNewName("");
      toast.success("Category created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create category");
    }
  };

  const handleUpdate = async (id: bigint) => {
    if (!editName.trim()) return;
    try {
      await updateCategory.mutateAsync({ id, name: editName.trim() });
      setEditId(null);
      toast.success("Category updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update category");
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("Delete this category?")) return;
    try {
      await deleteCategory.mutateAsync(id);
      toast.success("Category deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete category");
    }
  };

  return (
    <div>
      <h2 className="font-serif text-2xl text-gold uppercase tracking-widest mb-6">
        Categories
      </h2>
      <div className="card-luxury p-4 mb-6 flex gap-3 items-center">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="bg-secondary border-gold-border"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          data-ocid="admin.category.input"
        />
        <Button
          className="btn-gold tracking-widest uppercase text-xs flex-shrink-0"
          onClick={handleCreate}
          disabled={createCategory.isPending}
          data-ocid="admin.category.add.button"
        >
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>
      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <div className="card-luxury overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-gold-border hover:bg-transparent">
                <TableHead className="text-gold-muted uppercase text-xs tracking-widest">
                  Name
                </TableHead>
                <TableHead className="text-gold-muted uppercase text-xs tracking-widest text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!categories?.length ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-muted-foreground py-8"
                  >
                    No categories yet
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat, idx) => (
                  <TableRow
                    key={cat.id.toString()}
                    className="border-gold-border"
                    data-ocid={`admin.category.item.${idx + 1}`}
                  >
                    <TableCell>
                      {editId === cat.id ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8 bg-secondary border-gold-border max-w-xs"
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleUpdate(cat.id)
                          }
                          autoFocus
                        />
                      ) : (
                        <span>{cat.name}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editId === cat.id ? (
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="icon"
                            className="w-7 h-7 btn-gold"
                            onClick={() => handleUpdate(cat.id)}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-7 h-7"
                            onClick={() => setEditId(null)}
                          >
                            <Settings className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-7 h-7 text-muted-foreground hover:text-gold"
                            onClick={() => {
                              setEditId(cat.id);
                              setEditName(cat.name);
                            }}
                            data-ocid={`admin.category.edit_button.${idx + 1}`}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-7 h-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(cat.id)}
                            data-ocid={`admin.category.delete_button.${idx + 1}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

type ProductForm = {
  name: string;
  description: string;
  mrp: string;
  discountAmount: string;
  categoryId: string;
  inStock: boolean;
  sizes: string[];
  colours: string[];
  image: Uint8Array | null;
  imageType: string;
};

const DEFAULT_FORM: ProductForm = {
  name: "",
  description: "",
  mrp: "",
  discountAmount: "0",
  categoryId: "",
  inStock: true,
  sizes: [],
  colours: [],
  image: null,
  imageType: "",
};

function parseCommaSeparated(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function ProductsTab() {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [form, setForm] = useState<ProductForm>(DEFAULT_FORM);
  const [sizeInput, setSizeInput] = useState("");
  const [colourInput, setColourInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const addImageRef = useRef<HTMLInputElement>(null);
  const bulkFileRef = useRef<HTMLInputElement>(null);
  const [addImagePending, setAddImagePending] = useState(false);
  const [pendingBulkImages, setPendingBulkImages] = useState<
    Array<{ bytes: Uint8Array; type: string }>
  >([]);

  const addProductImage = useAddProductImage();
  const removeProductImage = useRemoveProductImage();
  const { data: productImages, isLoading: imagesLoading } =
    useProductImages(editingId);

  const resetForm = () => {
    setPendingBulkImages([]);
    setForm(DEFAULT_FORM);
    setEditingId(null);
    setSizeInput("");
    setColourInput("");
  };

  const openEdit = (p: {
    id: bigint;
    name: string;
    description: string;
    mrp: bigint;
    discountAmount: bigint;
    categoryId: bigint;
    inStock: boolean;
    sizes: string[];
    colours: string[];
  }) => {
    // Open dialog instantly using already-loaded product list data.
    // No backend call needed – image is resolved from productImages on save.
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      mrp: Number(p.mrp).toString(),
      discountAmount: Number(p.discountAmount).toString(),
      categoryId: p.categoryId.toString(),
      inStock: p.inStock,
      sizes: [...p.sizes],
      colours: [...p.colours],
      image: null, // null = keep existing; resolved from productImages on save
      imageType: "",
    });
    setSizeInput(p.sizes.join(", "));
    setColourInput(p.colours.join(", "));
    setDialogOpen(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await fileToUint8Array(file);
      setForm((f) => ({
        ...f,
        image: result.bytes,
        imageType: result.type || "image/jpeg",
      }));
    } catch {
      toast.error("Could not load image. Please try a JPG or PNG file.");
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.mrp || !form.categoryId) {
      toast.error("Please fill name, MRP and category");
      return;
    }
    const parsedSizes = parseCommaSeparated(sizeInput);
    const parsedColours = parseCommaSeparated(colourInput);

    // Resolve image: use newly uploaded image if changed, else fall back to
    // the primary productImage (already loaded in background via useProductImages).
    let resolvedImage = form.image;
    let resolvedImageType = form.imageType;
    if (resolvedImage === null && editingId !== null) {
      if (productImages && productImages.length > 0) {
        resolvedImage = productImages[0].imageData;
        resolvedImageType = productImages[0].imageType;
      } else {
        // Images haven't loaded yet — use empty placeholder (shouldn't normally happen)
        resolvedImage = new Uint8Array();
        resolvedImageType = "image/jpeg";
      }
    }

    const info = {
      name: form.name,
      description: form.description,
      mrp: BigInt(Math.round(Number(form.mrp))),
      discountAmount: BigInt(Math.round(Number(form.discountAmount) || 0)),
      categoryId: BigInt(form.categoryId),
      inStock: form.inStock,
      sizes: parsedSizes,
      colours: parsedColours,
      image: resolvedImage ?? new Uint8Array(),
      imageType: resolvedImageType || "image/jpeg",
    };
    try {
      if (editingId !== null) {
        await updateProduct.mutateAsync({ id: editingId, info });
        toast.success("Product updated");
        setDialogOpen(false);
        resetForm();
      } else {
        const newProduct = await createProduct.mutateAsync(info);
        // Upload any pending bulk images
        if (pendingBulkImages.length > 0) {
          toast.success(
            `Product created! Uploading ${pendingBulkImages.length} additional image(s)...`,
          );
          const token = getAdminToken();
          if (token) {
            for (const img of pendingBulkImages) {
              try {
                await addProductImage.mutateAsync({
                  productId: newProduct.id,
                  imageData: img.bytes,
                  imageType: img.type || "image/jpeg",
                });
              } catch {
                /* continue */
              }
            }
          }
          setPendingBulkImages([]);
          toast.success("All images uploaded!");
        } else {
          toast.success("Product created! You can now add more images below.");
        }
        // Switch to edit mode so additional images section appears
        setEditingId(newProduct.id);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Operation failed");
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Product deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete product");
    }
  };

  const effectivePrice = (p: any) => Number(p.mrp) - Number(p.discountAmount);

  const previewSizes = parseCommaSeparated(sizeInput);
  const previewColours = parseCommaSeparated(colourInput);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-gold uppercase tracking-widest">
          Products
        </h2>
        <Dialog
          open={dialogOpen}
          onOpenChange={(o) => {
            if (!o) resetForm();
            setDialogOpen(o);
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="btn-gold text-xs tracking-widest uppercase"
              data-ocid="admin.product.add.open_modal_button"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent
            className="bg-card border-gold-border max-w-lg max-h-[90vh] overflow-y-auto"
            data-ocid="admin.product.dialog"
          >
            <DialogHeader>
              <DialogTitle className="font-serif text-gold uppercase tracking-widest">
                {editingId !== null ? "Edit Product" : "Add Product"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-4">
              <div>
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">
                  Name *
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="mt-1 bg-secondary border-gold-border"
                  data-ocid="admin.product.name.input"
                />
              </div>
              <div>
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">
                  Description
                </Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="mt-1 bg-secondary border-gold-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground">
                    MRP (₹) *
                  </Label>
                  <Input
                    type="number"
                    value={form.mrp}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, mrp: e.target.value }))
                    }
                    className="mt-1 bg-secondary border-gold-border"
                    data-ocid="admin.product.mrp.input"
                  />
                </div>
                <div>
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground">
                    Discount (₹)
                  </Label>
                  <Input
                    type="number"
                    value={form.discountAmount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, discountAmount: e.target.value }))
                    }
                    className="mt-1 bg-secondary border-gold-border"
                    data-ocid="admin.product.discount.input"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">
                  Category *
                </Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, categoryId: v }))
                  }
                >
                  <SelectTrigger
                    className="mt-1 bg-secondary border-gold-border"
                    data-ocid="admin.product.category.select"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-gold-border">
                    {categories?.map((c) => (
                      <SelectItem key={c.id.toString()} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sizes */}
              <div>
                <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-1.5 block">
                  Sizes
                </Label>
                <Input
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  placeholder="e.g. S, M, L, XL, XXL"
                  className="bg-secondary border-gold-border"
                  data-ocid="admin.product.sizes.input"
                />
                <p className="text-xs text-muted-foreground mt-1 mb-1.5">
                  Separate options with commas
                </p>
                {previewSizes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {previewSizes.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 text-xs border border-gold-border text-gold bg-gold/5 tracking-wider"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Colours */}
              <div>
                <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-1.5 block">
                  Colours
                </Label>
                <Input
                  value={colourInput}
                  onChange={(e) => setColourInput(e.target.value)}
                  placeholder="e.g. Red, Blue, Green"
                  className="bg-secondary border-gold-border"
                  data-ocid="admin.product.colours.input"
                />
                <p className="text-xs text-muted-foreground mt-1 mb-1.5">
                  Separate options with commas
                </p>
                {previewColours.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {previewColours.map((c) => (
                      <span
                        key={c}
                        className="px-2.5 py-1 text-xs border border-gold-border text-gold bg-gold/5 tracking-wider"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={form.inStock}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, inStock: v }))
                  }
                />
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">
                  In Stock
                </Label>
              </div>
              <div>
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">
                  Product Image
                </Label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <input
                  ref={bulkFileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;
                    try {
                      const result = await fileToUint8Array(files[0]);
                      setForm((f) => ({
                        ...f,
                        image: result.bytes,
                        imageType: result.type || "image/jpeg",
                      }));
                      if (files.length > 1) {
                        const additional = await Promise.all(
                          files.slice(1).map((file) => fileToUint8Array(file)),
                        );
                        setPendingBulkImages(
                          additional.map((r) => ({
                            bytes: r.bytes,
                            type: r.type || "image/jpeg",
                          })),
                        );
                        toast.success(
                          `1 primary + ${files.length - 1} additional image(s) queued. Save to upload all.`,
                        );
                      } else {
                        toast.success("1 image ready. Save product to upload.");
                      }
                    } catch {
                      toast.error(
                        "Could not load image. Please try a JPG or PNG file.",
                      );
                    }
                    if (bulkFileRef.current) bulkFileRef.current.value = "";
                  }}
                />
                <div className="mt-1 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-gold-border text-muted-foreground hover:text-gold"
                    onClick={() => fileRef.current?.click()}
                    data-ocid="admin.product.image.upload_button"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {form.image ? "Selected" : "Upload Image"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-gold/50 text-gold/70 hover:text-gold hover:border-gold"
                    onClick={() => bulkFileRef.current?.click()}
                    data-ocid="admin.product.bulk_image.upload_button"
                  >
                    <ImagePlus className="w-4 h-4 mr-2" />
                    Bulk Image
                  </Button>
                </div>
              </div>
              <Button
                className="btn-gold tracking-widest uppercase"
                onClick={handleSubmit}
                disabled={createProduct.isPending || updateProduct.isPending}
                data-ocid="admin.product.submit.button"
              >
                {createProduct.isPending || updateProduct.isPending
                  ? "Saving..."
                  : editingId !== null
                    ? "Update"
                    : "Create"}
              </Button>
            </div>

            {/* Additional Images Section - only shown when editing an existing product */}
            {editingId !== null && (
              <>
                <div className="border-t border-gold-border pt-4 mt-2">
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground block mb-3">
                    Additional Images ({productImages?.length ?? 0} total)
                  </Label>
                  {imagesLoading ? (
                    <div className="flex gap-2 flex-wrap">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-16 h-16 rounded bg-secondary animate-pulse"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      {productImages?.map((img, i) => (
                        <div
                          key={`${img.imageType}-${i}`}
                          className="relative group/thumb"
                        >
                          <img
                            src={uint8ToDataUrl(img.imageData, img.imageType)}
                            alt={`Thumbnail ${i + 1}`}
                            className="w-16 h-16 object-cover rounded border border-gold-border/50"
                          />
                          {i > 0 && (
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await removeProductImage.mutateAsync({
                                    productId: editingId,
                                    imageIndex: BigInt(i),
                                  });
                                  toast.success("Image removed");
                                } catch {
                                  toast.error("Failed to remove image");
                                }
                              }}
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                              data-ocid="admin.product.image.delete_button"
                            >
                              <X className="w-2.5 h-2.5 text-white" />
                            </button>
                          )}
                          {i === 0 && (
                            <span className="absolute bottom-0 left-0 right-0 text-[9px] text-center bg-background/80 text-gold-muted rounded-b">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                      {true && (
                        <>
                          <input
                            ref={addImageRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={async (e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length === 0) return;
                              const toUpload = files; // unlimited images
                              setAddImagePending(true);
                              try {
                                for (const file of toUpload) {
                                  const result = await fileToUint8Array(file);
                                  await addProductImage.mutateAsync({
                                    productId: editingId,
                                    imageData: result.bytes,
                                    imageType: result.type || "image/jpeg",
                                  });
                                }
                                toast.success(
                                  toUpload.length > 1
                                    ? `${toUpload.length} images added`
                                    : "Image added",
                                );
                              } catch {
                                toast.error("Failed to add image");
                              } finally {
                                setAddImagePending(false);
                                if (addImageRef.current)
                                  addImageRef.current.value = "";
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => addImageRef.current?.click()}
                            disabled={addImagePending}
                            className="w-16 h-16 rounded border border-dashed border-gold-border/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-gold hover:text-gold transition-colors disabled:opacity-50"
                            data-ocid="admin.product.addimage.upload_button"
                          >
                            {addImagePending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <ImagePlus className="w-4 h-4" />
                            )}
                            <span className="text-[9px]">Add</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <Button
                    type="button"
                    className="w-full btn-gold tracking-widest uppercase text-xs"
                    onClick={() => {
                      if (editingId !== null) {
                        window.location.href = `/admin/product-images/${editingId}`;
                      }
                    }}
                    data-ocid="admin.product.manage_images.button"
                  >
                    <ImagePlus className="w-4 h-4 mr-2" />
                    Manage Images (Unlimited)
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <div className="card-luxury overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-gold-border hover:bg-transparent">
                <TableHead className="text-gold-muted uppercase text-xs tracking-widest">
                  Image
                </TableHead>
                <TableHead className="text-gold-muted uppercase text-xs tracking-widest">
                  Name
                </TableHead>
                <TableHead className="text-gold-muted uppercase text-xs tracking-widest">
                  MRP / Sale
                </TableHead>
                <TableHead className="text-gold-muted uppercase text-xs tracking-widest">
                  Sizes
                </TableHead>
                <TableHead className="text-gold-muted uppercase text-xs tracking-widest">
                  Stock
                </TableHead>
                <TableHead className="text-gold-muted uppercase text-xs tracking-widest text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!products?.length ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    No products yet
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p, idx) => (
                  <TableRow
                    key={p.id.toString()}
                    className="border-gold-border"
                    data-ocid={`admin.product.item.${idx + 1}`}
                  >
                    <TableCell>
                      <div className="w-10 h-12 bg-muted flex items-center justify-center">
                        <Tag className="w-4 h-4 text-muted-foreground/30" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      <span className="text-muted-foreground line-through text-xs">
                        {formatPrice(p.mrp)}
                      </span>
                      <br />
                      <span className="text-gold text-sm">
                        {formatPrice(effectivePrice(p))}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.sizes.join(", ") || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          p.inStock
                            ? "bg-green-900/30 text-green-400 border-green-800"
                            : "bg-red-900/30 text-red-400 border-red-800"
                        }
                      >
                        {p.inStock ? "In Stock" : "Out"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-7 h-7 text-muted-foreground hover:text-gold"
                          onClick={() => openEdit(p)}
                          data-ocid={`admin.product.edit_button.${idx + 1}`}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-7 h-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(p.id)}
                          data-ocid={`admin.product.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function OrdersTab() {
  const { data: orders, isLoading } = useAllOrders();
  const { data: users } = useAllUsers();
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const { actor } = useActor();
  const [deliveryCodes, setDeliveryCodes] = useState<Record<string, string>>(
    {},
  );
  const [generatingCode, setGeneratingCode] = useState<string | null>(null);

  const getUser = (userId: string) =>
    users?.find((u) => u.id.toString() === userId);

  const handleGenerateCode = async (orderId: string) => {
    setGeneratingCode(orderId);
    try {
      if (!actor) throw new Error("Not connected");
      const token = getAdminToken();
      if (typeof (actor as any).generateDeliveryCode !== "function") {
        throw new Error(
          "Delivery code feature not available. Please refresh the page and try again.",
        );
      }
      const code = await (actor as any).generateDeliveryCode(token, orderId);
      setDeliveryCodes((prev) => ({ ...prev, [orderId]: code }));
      toast.success(`Delivery code: ${code}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate code");
    } finally {
      setGeneratingCode(null);
    }
  };

  return (
    <div>
      <h2 className="font-serif text-2xl text-gold uppercase tracking-widest mb-6">
        Orders
      </h2>
      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <div className="card-luxury overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gold-border hover:bg-transparent">
                <TableHead className="text-gold-muted uppercase text-xs tracking-widest">
                  Customer
                </TableHead>
                <TableHead className="text-gold-muted uppercase text-xs tracking-widest">
                  WhatsApp
                </TableHead>
                <TableHead className="text-gold-muted uppercase text-xs tracking-widest">
                  Amount
                </TableHead>
                <TableHead className="text-gold-muted uppercase text-xs tracking-widest">
                  Payment
                </TableHead>
                <TableHead className="text-gold-muted uppercase text-xs tracking-widest">
                  Status
                </TableHead>
                <TableHead className="text-gold-muted uppercase text-xs tracking-widest">
                  Location
                </TableHead>
                <TableHead className="text-gold-muted uppercase text-xs tracking-widest">
                  Code
                </TableHead>
                <TableHead className="text-gold-muted uppercase text-xs tracking-widest">
                  Delete
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!orders?.length ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground py-8"
                  >
                    No orders yet
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order, idx) => {
                  const user = getUser(order.userId.toString());
                  const code = deliveryCodes[order.id];
                  return (
                    <TableRow
                      key={order.id}
                      className="border-gold-border"
                      data-ocid={`admin.order.item.${idx + 1}`}
                    >
                      <TableCell className="font-medium">
                        {user?.name ?? "Unknown"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user?.whatsapp ?? "—"}
                      </TableCell>
                      <TableCell className="text-gold">
                        {formatPrice(order.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-secondary text-foreground border-gold-border">
                          {order.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(v) =>
                            updateStatus.mutate({
                              orderId: order.id,
                              status: v,
                            })
                          }
                        >
                          <SelectTrigger className="h-7 text-xs bg-secondary border-gold-border w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-gold-border">
                            {ORDER_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs max-w-[120px] truncate">
                        {order.deliveryLocation || "—"}
                      </TableCell>
                      <TableCell>
                        {code ? (
                          <span className="font-mono text-gold text-sm tracking-widest border border-gold-border px-2 py-0.5">
                            {code}
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-gold-border text-gold-muted hover:text-gold hover:border-gold px-2"
                            onClick={() => handleGenerateCode(order.id)}
                            disabled={generatingCode === order.id}
                            data-ocid={`admin.order.generate_code.button.${idx + 1}`}
                          >
                            <Key className="w-3 h-3 mr-1" />
                            {generatingCode === order.id ? "..." : "Code"}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {order.status === "Delivered" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-red-800 text-red-400 hover:text-red-300 hover:border-red-600 px-2"
                            onClick={async () => {
                              try {
                                await deleteOrder.mutateAsync(order.id);
                                toast.success("Order deleted.");
                              } catch (e) {
                                toast.error(
                                  e instanceof Error
                                    ? e.message
                                    : "Failed to delete order",
                                );
                              }
                            }}
                            disabled={deleteOrder.isPending}
                            data-ocid={`admin.order.delete_button.${idx + 1}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function SchemesTab() {
  const { data: schemes, isLoading } = useSchemes();
  const createScheme = useCreateScheme();
  const deleteScheme = useDeleteScheme();
  const [form, setForm] = useState({
    title: "",
    description: "",
    couponCode: "",
  });

  const handleCreate = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      await createScheme.mutateAsync(form);
      setForm({ title: "", description: "", couponCode: "" });
      toast.success("Scheme added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add scheme");
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("Delete this scheme?")) return;
    try {
      await deleteScheme.mutateAsync(id);
      toast.success("Scheme deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete scheme");
    }
  };

  return (
    <div>
      <h2 className="font-serif text-2xl text-gold uppercase tracking-widest mb-6">
        Schemes & Offers
      </h2>
      <div className="card-luxury p-6 mb-6 flex flex-col gap-4">
        <h3 className="text-sm tracking-widest uppercase text-muted-foreground">
          Add New Scheme
        </h3>
        <div>
          <Label className="text-xs tracking-widest uppercase text-muted-foreground">
            Title *
          </Label>
          <Input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Summer Sale"
            className="mt-1 bg-secondary border-gold-border"
            data-ocid="admin.scheme.title.input"
          />
        </div>
        <div>
          <Label className="text-xs tracking-widest uppercase text-muted-foreground">
            Description
          </Label>
          <Textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Scheme details..."
            className="mt-1 bg-secondary border-gold-border"
          />
        </div>
        <div>
          <Label className="text-xs tracking-widest uppercase text-muted-foreground">
            Coupon Code
          </Label>
          <Input
            value={form.couponCode}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                couponCode: e.target.value.toUpperCase(),
              }))
            }
            placeholder="e.g. SUMMER20"
            className="mt-1 bg-secondary border-gold-border font-mono"
            data-ocid="admin.scheme.coupon.input"
          />
        </div>
        <Button
          className="btn-gold tracking-widest uppercase self-start"
          onClick={handleCreate}
          disabled={createScheme.isPending}
          data-ocid="admin.scheme.add.button"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Scheme
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <div className="flex flex-col gap-3">
          {!schemes?.length ? (
            <div className="card-luxury p-8 text-center text-muted-foreground">
              No schemes yet
            </div>
          ) : (
            schemes.map((s, idx) => (
              <div
                key={s.id.toString()}
                className="card-luxury p-4 flex items-center justify-between gap-4"
                data-ocid={`admin.scheme.item.${idx + 1}`}
              >
                <div className="flex-1">
                  <p className="font-serif text-gold">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {s.description}
                  </p>
                  {s.couponCode && (
                    <span className="font-mono text-xs text-gold border border-gold-border px-2 py-0.5 mt-1 inline-block">
                      {s.couponCode}
                    </span>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-7 h-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                  onClick={() => handleDelete(s.id)}
                  data-ocid={`admin.scheme.delete.button.${idx + 1}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ReelsTab() {
  const { data: reelsData, isLoading } = useReels();
  const reels = reelsData as Reel[] | undefined;
  const { data: products } = useProducts();
  const createReel = useCreateReel();
  const deleteReel = useDeleteReel();
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [productId, setProductId] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setVideoFile(file);
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(file ? URL.createObjectURL(file) : "");
  };

  const handleCreate = async () => {
    if (!title.trim() || !videoFile) {
      toast.error("Title and video file are required");
      return;
    }
    try {
      setIsUploading(true);
      setUploadProgress(0);
      const { uploadVideoToStorage } = await import("../utils/videoUpload");
      const buffer = await videoFile.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const uploadedUrl = await uploadVideoToStorage(bytes, (pct) =>
        setUploadProgress(pct),
      );
      await createReel.mutateAsync({
        title: title.trim(),
        videoUrl: uploadedUrl,
        productId: productId && productId !== "none" ? BigInt(productId) : null,
      });
      setTitle("");
      setVideoFile(null);
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl("");
      setProductId("");
      setUploadProgress(0);
      toast.success("Reel added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add reel");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("Delete this reel?")) return;
    try {
      await deleteReel.mutateAsync(id);
      toast.success("Reel deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete reel");
    }
  };

  return (
    <div>
      <h2 className="font-serif text-2xl text-gold uppercase tracking-widest mb-6">
        Reels
      </h2>

      {/* Add reel form */}
      <div className="card-luxury p-6 mb-6 flex flex-col gap-4">
        <h3 className="text-sm tracking-widest uppercase text-muted-foreground">
          Add New Reel
        </h3>
        <div>
          <Label className="text-xs tracking-widest uppercase text-muted-foreground">
            Title *
          </Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Summer Collection Highlights"
            className="mt-1 bg-secondary border-gold-border"
            data-ocid="admin.reel.title.input"
          />
        </div>
        <div>
          <Label className="text-xs tracking-widest uppercase text-muted-foreground">
            Video File *
          </Label>
          <div className="mt-1 flex items-center gap-3">
            <label
              htmlFor="reel-video-upload"
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gold-border bg-secondary text-sm hover:bg-secondary/80 transition-colors"
              data-ocid="admin.reel.upload_button"
            >
              <Upload className="w-4 h-4 text-gold" />
              Choose Video
            </label>
            <input
              id="reel-video-upload"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {videoFile && (
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {videoFile.name}
              </span>
            )}
          </div>
          {videoPreviewUrl && (
            <video
              src={videoPreviewUrl}
              controls
              className="mt-3 rounded-md border border-gold-border"
              style={{
                maxHeight: "180px",
                width: "100%",
                objectFit: "contain",
              }}
            >
              <track kind="captions" />
            </video>
          )}
          {isUploading && (
            <div
              className="mt-2 text-xs text-gold"
              data-ocid="admin.reel.upload.loading_state"
            >
              Uploading... {uploadProgress}%
              <div className="mt-1 h-1 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div>
          <Label className="text-xs tracking-widest uppercase text-muted-foreground">
            Link to Product (optional)
          </Label>
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger
              className="mt-1 bg-secondary border-gold-border"
              data-ocid="admin.reel.product.select"
            >
              <SelectValue placeholder="No product linked" />
            </SelectTrigger>
            <SelectContent className="bg-card border-gold-border">
              <SelectItem value="none">No product linked</SelectItem>
              {products?.map((p) => (
                <SelectItem key={p.id.toString()} value={p.id.toString()}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          className="btn-gold tracking-widest uppercase self-start"
          onClick={handleCreate}
          disabled={isUploading || createReel.isPending}
          data-ocid="admin.reel.add.button"
        >
          <Plus className="w-4 h-4 mr-1" />
          {isUploading ? "Uploading..." : "Add Reel"}
        </Button>
      </div>

      {/* Reels list */}
      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : !reels?.length ? (
        <div
          className="card-luxury p-8 text-center text-muted-foreground"
          data-ocid="admin.reels.empty_state"
        >
          No reels yet
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reels.map((reel, idx) => {
            const linkedProduct =
              reel.productId !== null && reel.productId !== undefined
                ? products?.find((p) => p.id === reel.productId)
                : null;
            return (
              <div
                key={reel.id.toString()}
                className="card-luxury p-4 flex items-center justify-between gap-4"
                data-ocid={`admin.reel.item.${idx + 1}`}
              >
                <video
                  src={reel.videoUrl}
                  controls
                  style={{
                    maxHeight: "80px",
                    width: "80px",
                    objectFit: "cover",
                  }}
                  className="rounded flex-shrink-0 border border-gold-border"
                >
                  <track kind="captions" />
                </video>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{reel.title}</p>
                  {linkedProduct && (
                    <p className="text-xs text-gold mt-1">
                      🛒 {linkedProduct.name}
                    </p>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-7 h-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                  onClick={() => handleDelete(reel.id)}
                  data-ocid={`admin.reel.delete.button.${idx + 1}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  const { data: settings, isLoading } = usePaymentSettings();
  const setSettings = useSetPaymentSettings();
  const [upiId, setUpiId] = useState("");
  const [qrImage, setQrImage] = useState<Uint8Array | null>(null);
  const [qrImageType, setQrImageType] = useState("");
  const [newQrPreviewUrl, setNewQrPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const initializedRef = useRef(false);
  if (!initializedRef.current && settings?.upiId && !upiId) {
    initializedRef.current = true;
    setUpiId(settings.upiId);
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await fileToUint8Array(file);
      setQrImage(result.bytes);
      setQrImageType(result.type || "image/jpeg");
      const objectUrl = URL.createObjectURL(file);
      setNewQrPreviewUrl(objectUrl);
    } catch {
      toast.error("Could not load image. Please try a JPG or PNG file.");
    }
  };

  const handleSave = async () => {
    try {
      await setSettings.mutateAsync({
        upiId: upiId.trim(),
        qrImage: qrImage ?? settings?.qrImage ?? new Uint8Array(),
        qrImageType: qrImageType || settings?.qrImageType || "",
      });
      toast.success("Payment settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save settings");
    }
  };

  const existingQr = settings?.qrImage?.length
    ? uint8ToDataUrl(settings.qrImage, settings.qrImageType)
    : null;

  return (
    <div className="max-w-lg">
      <h2 className="font-serif text-2xl text-gold uppercase tracking-widest mb-6">
        Payment Settings
      </h2>
      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <div className="card-luxury p-6 flex flex-col gap-6">
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">
              UPI ID
            </Label>
            <Input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@upi"
              className="mt-2 bg-secondary border-gold-border"
              data-ocid="admin.settings.upi.input"
            />
          </div>
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">
              GPay QR Code
            </Label>
            {existingQr && !newQrPreviewUrl && (
              <div className="mt-2 mb-3">
                <img
                  src={existingQr}
                  alt="Current QR"
                  className="w-32 h-32 object-contain border border-gold-border p-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Current QR Code
                </p>
              </div>
            )}
            {newQrPreviewUrl && (
              <div className="mt-2 mb-3">
                <img
                  src={newQrPreviewUrl}
                  alt="New QR preview"
                  className="w-32 h-32 object-contain border border-gold-border p-1"
                />
                <p className="text-xs text-amber-400 mt-1">
                  New QR Selected (not saved yet)
                </p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full border-gold-border text-muted-foreground hover:text-gold"
              onClick={() => fileRef.current?.click()}
              data-ocid="admin.settings.qr.upload_button"
            >
              <Upload className="w-4 h-4 mr-2" />
              {qrImage ? "Change QR Image" : "Upload QR Image"}
            </Button>
          </div>
          <Button
            className="btn-gold tracking-widest uppercase"
            onClick={handleSave}
            disabled={setSettings.isPending}
            data-ocid="admin.settings.save.button"
          >
            {setSettings.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      )}
    </div>
  );
}

function InstagramTab() {
  const { actor } = useActor();
  const [handle, setHandle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!actor) return;
    actor
      .getInstagramHandle()
      .then((h: string) => setHandle(h))
      .catch(() => {});
  }, [actor]);

  const handleSave = async () => {
    if (!actor) return;
    setSaving(true);
    try {
      const token = getAdminToken();
      await actor.setInstagramHandle(token, handle.trim());
      toast.success("Instagram handle saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h2 className="font-serif text-2xl text-gold uppercase tracking-widest mb-2">
        Instagram Settings
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Your Instagram handle will appear in the footer of each reel, clickable
        for customers.
      </p>
      <div className="card-luxury p-6 flex flex-col gap-4">
        <div>
          <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
            Instagram Handle
          </Label>
          <Input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="@meet_.enterprise"
            className="bg-secondary border-gold-border"
            data-ocid="admin.instagram.input"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter with or without @ — e.g. @meet_.enterprise or meet_.enterprise
          </p>
        </div>
        <Button
          className="btn-gold tracking-widest uppercase"
          onClick={handleSave}
          disabled={saving}
          data-ocid="admin.instagram.save_button"
        >
          {saving ? "Saving..." : "Save Handle"}
        </Button>
      </div>
    </div>
  );
}

function AppearanceTab() {
  const [activeTheme, setActiveTheme] = useState<ThemeId>(
    () => (localStorage.getItem("meet-theme") as ThemeId) || "bone-white",
  );

  const handleApply = (themeId: ThemeId) => {
    applyTheme(themeId);
    setActiveTheme(themeId);
    toast.success(
      `Theme "${THEMES.find((t) => t.id === themeId)?.name}" applied`,
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl tracking-widest uppercase text-gold mb-1">
          Site Appearance
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose a colour theme for your storefront
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {THEMES.map((theme) => {
          const isActive = activeTheme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleApply(theme.id)}
              data-ocid={`admin.appearance.${theme.id}.button`}
              className={`text-left rounded-lg border-2 p-5 transition-all ${
                isActive
                  ? "border-gold bg-secondary"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="w-7 h-7 rounded-full border border-border"
                  style={{ background: theme.previewBg }}
                />
                <span
                  className="w-7 h-7 rounded-full border border-border"
                  style={{ background: theme.previewPrimary }}
                />
                <span
                  className="w-7 h-7 rounded-full border border-border"
                  style={{ background: theme.previewAccent }}
                />
                {isActive && <Check className="w-4 h-4 text-gold ml-auto" />}
              </div>
              <p className="font-semibold text-sm tracking-wide">
                {theme.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {theme.description}
              </p>
              <p className="text-xs mt-2 text-gold font-medium">
                {isActive ? "Active" : "Click to apply"}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
