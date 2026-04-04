import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Heart, ShoppingCart, Star, Tag } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Category, ProductSummary } from "../backend.d";
import { useCart } from "../context/CartContext";
import { useProductImages, useProductRating } from "../hooks/useQueries";
import { formatPrice, uint8ToDataUrl } from "../utils/imageUtils";
import { ProductOptionsModal } from "./ProductOptionsModal";

function getWishlist(): string[] {
  try {
    return JSON.parse(localStorage.getItem("meet-wishlist") || "[]");
  } catch {
    return [];
  }
}

function toggleWishlist(productId: string): boolean {
  const existing = getWishlist();
  const isWishlisted = existing.includes(productId);
  const updated = isWishlisted
    ? existing.filter((id) => id !== productId)
    : [...existing, productId];
  localStorage.setItem("meet-wishlist", JSON.stringify(updated));
  return !isWishlisted;
}

function DisplayStars({ rating, count }: { rating: number; count: number }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-1 mt-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className="w-3 h-3"
          fill={rating >= star ? "oklch(0.78 0.13 85)" : "none"}
          stroke={
            rating >= star ? "oklch(0.78 0.13 85)" : "oklch(0.45 0.005 230)"
          }
        />
      ))}
      <span className="text-[10px] text-muted-foreground">({count})</span>
    </div>
  );
}

interface ProductCardProps {
  product: ProductSummary;
  categories?: Category[];
  index?: number;
}

export function ProductCard({
  product,
  categories,
  index = 0,
}: ProductCardProps) {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState(() =>
    getWishlist().includes(product.id.toString()),
  );
  const [imgIndex, setImgIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D animation refs — no state to avoid re-renders per frame
  const rafRef = useRef<number>(0);
  const autoRotTimeRef = useRef(0);
  const isInteractingRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rxRef = useRef(0);
  const ryRef = useRef(0);
  // Touch tracking
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  // Current applied transform (to avoid jitter when resuming auto-rotate)
  const currentRxRef = useRef(0);
  const currentRyRef = useRef(0);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const maxTilt = isMobile ? 8 : 12;

  const applyTransform = useCallback(
    (rx: number, ry: number, animated: boolean) => {
      const card = cardRef.current;
      if (!card) return;
      currentRxRef.current = rx;
      currentRyRef.current = ry;
      card.style.transition = animated ? "transform 0.15s ease" : "none";
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(4px)`;
    },
    [],
  );

  // Auto-rotation loop using sin/cos oscillation
  const startAutoRotate = useCallback(() => {
    if (rafRef.current) return; // already running
    const loop = (ts: number) => {
      if (isInteractingRef.current) {
        rafRef.current = 0;
        return;
      }
      // Gentle oscillation: ~0.5 rpm ≈ 0.0524 rad/s; ±8deg on X, ±10deg on Y
      const t = ts * 0.0006; // slow time base
      const targetRx = Math.sin(t * 0.7) * 5;
      const targetRy = Math.sin(t) * 8;
      // Smooth interpolate from current position
      rxRef.current += (targetRx - rxRef.current) * 0.05;
      ryRef.current += (targetRy - ryRef.current) * 0.05;
      applyTransform(rxRef.current, ryRef.current, false);
      autoRotTimeRef.current = ts;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [applyTransform]);

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

  // Start auto-rotate on mount
  useEffect(() => {
    startAutoRotate();
    return () => {
      stopAutoRotate();
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [startAutoRotate, stopAutoRotate]);

  // Desktop mouse tilt
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rx = ((y - centerY) / centerY) * -maxTilt;
      const ry = ((x - centerX) / centerX) * maxTilt;
      rxRef.current = rx;
      ryRef.current = ry;
      applyTransform(rx, ry, true);
    },
    [maxTilt, applyTransform],
  );

  const handleMouseEnter = useCallback(() => {
    isInteractingRef.current = true;
    stopAutoRotate();
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  }, [stopAutoRotate]);

  const handleMouseLeave = useCallback(() => {
    // Animate back to neutral first
    const card = cardRef.current;
    if (card) {
      card.style.transition = "transform 0.4s ease";
      card.style.transform =
        "perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0)";
      card.style.boxShadow = "";
    }
    rxRef.current = 0;
    ryRef.current = 0;
    pauseAndScheduleResume();
  }, [pauseAndScheduleResume]);

  // Touch handlers — tilt for small moves, swipe for large moves
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

      if (absDx < 50 && absDy < 50) {
        // Tilt mode — map finger position to rotation
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const touchY = e.touches[0].clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rx = ((touchY - centerY) / centerY) * -maxTilt;
        const ry = ((touchX - centerX) / centerX) * maxTilt;
        rxRef.current = rx;
        ryRef.current = ry;
        applyTransform(rx, ry, true);
        // Prevent page scroll when tilting
        if (absDx > absDy) e.preventDefault();
      }
      // if >=50px it's a swipe — handled in touchEnd, let default scroll pass
    },
    [maxTilt, applyTransform],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartXRef.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartXRef.current;

      // Swipe to change image
      if (Math.abs(dx) > 50) {
        const imgs = cardRef.current; // just need to check images
        void imgs; // suppress lint
        if (dx < 0) {
          setImgIndex((prev) => prev + 1); // clamped in render
        } else {
          setImgIndex((prev) => Math.max(prev - 1, 0));
        }
      }

      // Snap back to neutral
      const card = cardRef.current;
      if (card) {
        card.style.transition = "transform 0.4s ease";
        card.style.transform =
          "perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0)";
      }
      rxRef.current = 0;
      ryRef.current = 0;
      touchStartXRef.current = null;
      touchStartYRef.current = null;
      pauseAndScheduleResume();
    },
    [pauseAndScheduleResume],
  );

  const { data: images } = useProductImages(product.id);
  const { data: ratingData } = useProductRating(product.id);

  const category = categories?.find((c) => c.id === product.categoryId);
  const salePrice = Number(product.mrp) - Number(product.discountAmount);
  const hasDiscount = Number(product.discountAmount) > 0;

  const hasMultipleImages = images && images.length > 1;
  const clampedImgIndex = images ? Math.min(imgIndex, images.length - 1) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const hasOptions =
      (product.sizes && product.sizes.length > 0) ||
      (product.colours && product.colours.length > 0);
    if (hasOptions) {
      setModalOpen(true);
    } else {
      addItem(product);
      toast.success(`${product.name} added to cart`);
    }
  };

  const handleCardClick = () => {
    navigate({
      to: "/product/$productId",
      params: { productId: product.id.toString() },
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isNowWishlisted = toggleWishlist(product.id.toString());
    setWishlisted(isNowWishlisted);
    toast(isNowWishlisted ? "Added to wishlist" : "Removed from wishlist", {
      icon: isNowWishlisted ? "❤️" : "🤍",
    });
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="card-luxury card-3d holo-border group flex flex-col overflow-hidden hover:border-gold transition-colors duration-300 cursor-pointer"
        style={{ willChange: "transform" }}
        onClick={handleCardClick}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        data-ocid={`product.item.${index + 1}`}
      >
        <div
          className="relative aspect-[3/4] overflow-hidden bg-secondary"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {images && images.length > 0 ? (
            <div
              className="flex h-full"
              style={{
                width: `${images.length * 100}%`,
                transform: `translateX(-${clampedImgIndex * (100 / images.length)}%)`,
                transition: "transform 0.3s ease",
              }}
            >
              {images.map((img, i) => (
                <div
                  key={`${img.imageType}-${i}`}
                  style={{ width: `${100 / images.length}%` }}
                  className="h-full flex-shrink-0"
                >
                  <img
                    src={uint8ToDataUrl(img.imageData, img.imageType)}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Tag className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Badge className="bg-destructive text-destructive-foreground">
                Out of Stock
              </Badge>
            </div>
          )}
          {hasDiscount && (
            <Badge className="absolute top-2 right-2 bg-gold text-background text-xs">
              SALE
            </Badge>
          )}
          {/* Dot indicators */}
          {hasMultipleImages && (
            <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-1">
              {images.map((img, i) => (
                <button
                  key={`dot-${i}-${img.imageType}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImgIndex(i);
                  }}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{
                    background:
                      i === clampedImgIndex
                        ? "oklch(0.78 0.13 85)"
                        : "oklch(0.78 0.13 85 / 0.35)",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-3 flex flex-col flex-1">
          {category && (
            <p className="text-xs text-gold-muted uppercase tracking-widest mb-1">
              {category.name}
            </p>
          )}
          <h3 className="font-medium text-sm leading-snug line-clamp-2 mb-auto">
            {product.name}
          </h3>

          {/* Rating stars */}
          {ratingData && Number(ratingData.count) > 0 && (
            <DisplayStars
              rating={ratingData.average}
              count={Number(ratingData.count)}
            />
          )}

          <div className="mt-2 flex items-center justify-between gap-2">
            <div>
              <span className="text-gold font-semibold text-sm">
                {formatPrice(salePrice)}
              </span>
              {hasDiscount && (
                <span className="text-muted-foreground line-through text-xs ml-1.5">
                  {formatPrice(Number(product.mrp))}
                </span>
              )}
            </div>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <Button
                size="icon"
                className="btn-gold w-8 h-8"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                data-ocid={`product.cart.button.${index + 1}`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
              </Button>
              {/* Wishlist heart button - below Add to Cart */}
              <button
                type="button"
                onClick={handleWishlistToggle}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: wishlisted
                    ? "oklch(0.55 0.22 25 / 0.9)"
                    : "oklch(0.14 0.005 230)",
                  border: wishlisted
                    ? "1px solid oklch(0.65 0.22 25 / 0.6)"
                    : "1px solid oklch(0.25 0.005 230)",
                }}
                data-ocid={`product.toggle.${index + 1}`}
              >
                <Heart
                  className="w-3.5 h-3.5"
                  fill={wishlisted ? "white" : "none"}
                  stroke="white"
                  strokeWidth={1.5}
                />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {modalOpen && (
        <ProductOptionsModal
          product={product}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
