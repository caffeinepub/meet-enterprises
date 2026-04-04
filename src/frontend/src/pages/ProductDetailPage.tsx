import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Tag,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ProductCard } from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import {
  useCategories,
  useProductById,
  useProductImages,
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
  const { data: images } = useProductImages(productIdBigInt);
  const { data: products } = useProducts();
  const { data: categories } = useCategories();

  const [imgIndex, setImgIndex] = useState(0);

  // ─── 3D rotation state & refs ──────────────────────────────────────────────
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const isInteractingRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rxRef = useRef(0);
  const ryRef = useRef(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const maxTilt = isMobile ? 8 : 14;

  const applyWrapperTransform = useCallback(
    (rx: number, ry: number, animated: boolean) => {
      const el = imageWrapperRef.current;
      if (!el) return;
      el.style.transition = animated ? "transform 0.15s ease" : "none";
      el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    },
    [],
  );

  const startAutoRotate = useCallback(() => {
    if (rafRef.current) return;
    const loop = (ts: number) => {
      if (isInteractingRef.current) {
        rafRef.current = 0;
        return;
      }
      const t = ts * 0.0005;
      const targetRx = Math.sin(t * 0.6) * 6;
      const targetRy = Math.sin(t) * 12;
      rxRef.current += (targetRx - rxRef.current) * 0.04;
      ryRef.current += (targetRy - ryRef.current) * 0.04;
      applyWrapperTransform(rxRef.current, ryRef.current, false);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [applyWrapperTransform]);

  const stopAutoRotate = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const pauseAndScheduleResume = useCallback(() => {
    isInteractingRef.current = true;
    stopAutoRotate();
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      isInteractingRef.current = false;
      startAutoRotate();
    }, 2000);
  }, [stopAutoRotate, startAutoRotate]);

  useEffect(() => {
    startAutoRotate();
    return () => {
      stopAutoRotate();
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [startAutoRotate, stopAutoRotate]);

  // ─── Touch handlers ─────────────────────────────────────────────────────────
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
      isInteractingRef.current = true;
      stopAutoRotate();
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    },
    [stopAutoRotate],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartXRef.current === null || touchStartYRef.current === null)
        return;
      const dx = e.touches[0].clientX - touchStartXRef.current;
      const dy = e.touches[0].clientY - touchStartYRef.current;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx < 60 && absDy < 60) {
        // Tilt mode
        const el = imageWrapperRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const touchY = e.touches[0].clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rx = ((touchY - centerY) / centerY) * -maxTilt;
        const ry = ((touchX - centerX) / centerX) * maxTilt;
        rxRef.current = rx;
        ryRef.current = ry;
        applyWrapperTransform(rx, ry, true);
        if (absDx > absDy) e.preventDefault();
      }
    },
    [maxTilt, applyWrapperTransform],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartXRef.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartXRef.current;

      if (Math.abs(dx) > 60 && images && images.length > 1) {
        if (dx < 0) {
          setImgIndex((i) => Math.min(i + 1, images.length - 1));
        } else {
          setImgIndex((i) => Math.max(i - 1, 0));
        }
      }

      // Snap back
      const el = imageWrapperRef.current;
      if (el) {
        el.style.transition = "transform 0.4s ease";
        el.style.transform = "rotateX(0deg) rotateY(0deg)";
      }
      rxRef.current = 0;
      ryRef.current = 0;
      touchStartXRef.current = null;
      touchStartYRef.current = null;
      pauseAndScheduleResume();
    },
    [images, pauseAndScheduleResume],
  );

  // ─── Mouse tilt for desktop ─────────────────────────────────────────────────
  const handleMouseEnter = useCallback(() => {
    isInteractingRef.current = true;
    stopAutoRotate();
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  }, [stopAutoRotate]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = imageWrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rx = ((y - centerY) / centerY) * -maxTilt;
      const ry = ((x - centerX) / centerX) * maxTilt;
      rxRef.current = rx;
      ryRef.current = ry;
      applyWrapperTransform(rx, ry, true);
    },
    [maxTilt, applyWrapperTransform],
  );

  const handleMouseLeave = useCallback(() => {
    const el = imageWrapperRef.current;
    if (el) {
      el.style.transition = "transform 0.4s ease";
      el.style.transform = "rotateX(0deg) rotateY(0deg)";
    }
    rxRef.current = 0;
    ryRef.current = 0;
    pauseAndScheduleResume();
  }, [pauseAndScheduleResume]);

  // ─── Other state ─────────────────────────────────────────────────────────────
  const category = categories?.find((c) => c.id === product?.categoryId);
  const salePrice = product
    ? Number(product.mrp) - Number(product.discountAmount)
    : 0;
  const hasDiscount = product ? Number(product.discountAmount) > 0 : false;
  const hasMultipleImages = images && images.length > 1;

  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    undefined,
  );
  const [selectedColour, setSelectedColour] = useState<string | undefined>(
    undefined,
  );
  const [quantity, setQuantity] = useState(1);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only effect
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [productId]);

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
        {/* 3D Image Gallery — perspective container */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative aspect-[3/4] select-none"
          style={{ perspective: "1200px", perspectiveOrigin: "center" }}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Inner wrapper: this is what gets rotated */}
          <div
            ref={imageWrapperRef}
            className="absolute inset-0 rounded-xl overflow-hidden bg-secondary"
            style={{
              willChange: "transform",
              transformStyle: "preserve-3d",
            }}
          >
            {images && images.length > 0 ? (
              <div
                className="w-full h-full"
                style={{ perspective: "1000px", perspectiveOrigin: "center" }}
              >
                {images.map((img, i) => {
                  const offset = i - imgIndex;
                  const isActive = offset === 0;
                  const absOffset = Math.abs(offset);
                  if (absOffset > 1) return null;
                  return (
                    <div
                      key={`${img.imageType}-${i}`}
                      style={{
                        position: "absolute",
                        inset: 0,
                        transform: `
                          perspective(1000px)
                          rotateY(${offset * 35}deg)
                          translateX(${offset * 30}%)
                          translateZ(${isActive ? 0 : -80}px)
                          scale(${isActive ? 1 : 0.82})
                        `,
                        transition:
                          "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                        zIndex: isActive ? 2 : 1,
                        opacity: isActive ? 1 : 0.5,
                        borderRadius: "0.75rem",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={uint8ToDataUrl(img.imageData, img.imageType)}
                        alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading={isActive ? "eager" : "lazy"}
                      />
                      {isActive && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: "0.75rem",
                            background:
                              "linear-gradient(135deg, oklch(0.78 0.13 85 / 0.12) 0%, transparent 40%, transparent 60%, oklch(0.85 0.18 180 / 0.08) 100%)",
                            pointerEvents: "none",
                            animation: "holo-shimmer 4s linear infinite",
                            backgroundSize: "300% 100%",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : product?.image && product.image.length > 0 ? (
              <img
                src={uint8ToDataUrl(product.image, product.imageType)}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Tag className="w-20 h-20 text-muted-foreground/30" />
              </div>
            )}
          </div>

          {/* Left/Right arrows — outside the rotating wrapper so they stay flat */}
          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={() => setImgIndex((i) => Math.max(i - 1, 0))}
                disabled={imgIndex === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/70 flex items-center justify-center transition-opacity disabled:opacity-20"
                style={{ zIndex: 10 }}
                data-ocid="product_detail.gallery_prev.button"
              >
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setImgIndex((i) => Math.min(i + 1, images.length - 1))
                }
                disabled={imgIndex === images.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/70 flex items-center justify-center transition-opacity disabled:opacity-20"
                style={{ zIndex: 10 }}
                data-ocid="product_detail.gallery_next.button"
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {hasMultipleImages && (
            <div
              className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5"
              style={{ zIndex: 10 }}
            >
              {images.map((img, i) => (
                <button
                  key={`dot-${i}-${img.imageType}`}
                  type="button"
                  onClick={() => setImgIndex(i)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    background:
                      i === imgIndex
                        ? "oklch(0.78 0.13 85)"
                        : "oklch(0.78 0.13 85 / 0.35)",
                    transform: i === imgIndex ? "scale(1.2)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          )}

          {!product.inStock && (
            <div
              className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-xl"
              style={{ zIndex: 10 }}
            >
              <Badge className="bg-destructive text-destructive-foreground text-base px-4 py-2">
                Out of Stock
              </Badge>
            </div>
          )}
          {hasDiscount && (
            <Badge
              className="absolute top-3 right-3 bg-gold text-background border-0 text-xs tracking-wider px-2 py-1"
              style={{ zIndex: 10 }}
            >
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
            className={`w-full py-3 text-sm tracking-widest uppercase mt-3 border-gold-border ${
              wishlisted
                ? "text-red-400 border-red-400/50"
                : "text-muted-foreground"
            }`}
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
