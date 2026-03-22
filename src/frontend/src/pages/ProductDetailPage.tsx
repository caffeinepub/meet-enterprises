import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Heart, Minus, Plus, ShoppingCart, Tag } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ProductCard } from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import {
  useCategories,
  useProductById,
  useProducts,
} from "../hooks/useQueries";
import { formatPrice, uint8ToDataUrl } from "../utils/imageUtils";

export function ProductDetailPage() {
  const { productId } = useParams({ strict: false }) as { productId: string };
  const navigate = useNavigate();
  const { addItem } = useCart();

  const productIdBigInt = useMemo(() => {
    try {
      return productId ? BigInt(productId) : null;
    } catch {
      return null;
    }
  }, [productId]);

  const { data: product, isLoading: productLoading } =
    useProductById(productIdBigInt);
  const { data: products } = useProducts();
  const { data: categories } = useCategories();

  const category = categories?.find((c) => c.id === product?.categoryId);
  const salePrice = product
    ? Number(product.mrp) - Number(product.discountAmount)
    : 0;
  const hasDiscount = product ? Number(product.discountAmount) > 0 : false;
  const imgSrc =
    product?.image && product.image.length > 0
      ? uint8ToDataUrl(product.image, product.imageType)
      : null;

  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    undefined,
  );
  const [selectedColour, setSelectedColour] = useState<string | undefined>(
    undefined,
  );
  const [quantity, setQuantity] = useState(1);

  const [wishlisted, setWishlisted] = useState<boolean>(() => {
    const list: string[] = JSON.parse(
      localStorage.getItem("meet-wishlist") || "[]",
    );
    return list.includes(productId ?? "");
  });

  const toggleWishlist = () => {
    const list: string[] = JSON.parse(
      localStorage.getItem("meet-wishlist") || "[]",
    );
    let updated: string[];
    if (wishlisted) {
      updated = list.filter((id) => id !== productId);
      toast.info("Removed from wishlist");
    } else {
      updated = [...list, productId ?? ""];
      toast.success("Added to wishlist");
    }
    localStorage.setItem("meet-wishlist", JSON.stringify(updated));
    setWishlisted(!wishlisted);
  };

  const relatedProducts = useMemo(() => {
    if (!products || !productIdBigInt) return [];
    const others = products.filter((p) => p.id !== productIdBigInt);
    const shuffled = [...others].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, [products, productIdBigInt]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (product.colours.length > 0 && !selectedColour) {
      toast.error("Please select a colour");
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedSize, selectedColour);
    }
    toast.success(`${product.name} added to cart`);
    navigate({ to: "/cart" });
  };

  if (productLoading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="aspect-[3/4] rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-16 text-center">
        <Tag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-serif text-2xl text-foreground mb-2">
          Product Not Found
        </h2>
        <p className="text-muted-foreground mb-6">
          This product may have been removed or is unavailable.
        </p>
        <Button
          className="btn-gold"
          onClick={() => navigate({ to: "/shop" })}
          data-ocid="product_detail.back.button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shop
        </Button>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate({ to: "/shop" })}
        className="flex items-center gap-1 text-muted-foreground hover:text-gold transition-colors mb-6 text-sm"
        data-ocid="product_detail.back.button"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Shop
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative aspect-[3/4] overflow-hidden rounded-xl bg-secondary"
        >
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Tag className="w-20 h-20 text-muted-foreground/30" />
            </div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Badge className="bg-destructive text-destructive-foreground text-base px-4 py-2">
                Out of Stock
              </Badge>
            </div>
          )}
          {hasDiscount && (
            <Badge className="absolute top-3 right-3 bg-gold text-background border-0 text-xs tracking-wider px-2 py-1">
              -
              {Math.round(
                (Number(product.discountAmount) / Number(product.mrp)) * 100,
              )}
              % OFF
            </Badge>
          )}
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col gap-5"
        >
          {category && (
            <Badge className="w-fit bg-background/80 text-gold-muted border border-gold-border text-[10px] tracking-widest uppercase">
              {category.name}
            </Badge>
          )}

          <h1 className="font-serif text-2xl md:text-3xl text-foreground leading-snug">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-gold font-bold text-2xl">
              {formatPrice(salePrice)}
            </span>
            {hasDiscount && (
              <span className="text-muted-foreground line-through text-base">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Size selector */}
          {product.sizes.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2 tracking-wide">
                Size
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    type="button"
                    key={size}
                    onClick={() =>
                      setSelectedSize(size === selectedSize ? undefined : size)
                    }
                    className={`px-4 py-2 rounded-md border text-sm font-medium transition-all duration-200 ${
                      selectedSize === size
                        ? "bg-gold text-background border-gold"
                        : "border-border text-muted-foreground hover:border-gold hover:text-gold"
                    }`}
                    data-ocid="product_detail.size.toggle"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colour selector */}
          {product.colours.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2 tracking-wide">
                Colour
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colours.map((colour) => (
                  <button
                    type="button"
                    key={colour}
                    onClick={() =>
                      setSelectedColour(
                        colour === selectedColour ? undefined : colour,
                      )
                    }
                    className={`px-4 py-2 rounded-md border text-sm font-medium transition-all duration-200 ${
                      selectedColour === colour
                        ? "bg-gold text-background border-gold"
                        : "border-border text-muted-foreground hover:border-gold hover:text-gold"
                    }`}
                    data-ocid="product_detail.colour.toggle"
                  >
                    {colour}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2 tracking-wide">
              Quantity
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:border-gold hover:text-gold transition-colors"
                data-ocid="product_detail.quantity_minus.button"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-foreground font-semibold text-lg w-8 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:border-gold hover:text-gold transition-colors"
                data-ocid="product_detail.quantity_plus.button"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <Button
            className="btn-gold w-full py-3 text-sm tracking-widest uppercase mt-2"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            data-ocid="product_detail.add_to_cart.button"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
          {/* Wishlist */}
          <Button
            variant="outline"
            className={`w-full py-3 text-sm tracking-widest uppercase mt-3 border-gold-border ${wishlisted ? "text-red-400 border-red-400/50" : "text-muted-foreground"}`}
            onClick={toggleWishlist}
            data-ocid="product_detail.wishlist.button"
          >
            <Heart
              className={`w-4 h-4 mr-2 ${wishlisted ? "fill-red-400 text-red-400" : ""}`}
            />
            {wishlisted ? "Wishlisted" : "Add to Wishlist"}
          </Button>
        </motion.div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-xl md:text-2xl text-foreground mb-6 tracking-wide">
            You May Also Like
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {relatedProducts.map((rp, i) => (
              <div
                key={rp.id.toString()}
                className="min-w-[200px] max-w-[240px] flex-shrink-0"
              >
                <ProductCard product={rp} categories={categories} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
