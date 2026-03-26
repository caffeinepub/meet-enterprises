import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Heart, ShoppingCart, Star, Tag } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
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
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const { data: images } = useProductImages(product.id);
  const { data: ratingData } = useProductRating(product.id);

  const category = categories?.find((c) => c.id === product.categoryId);
  const salePrice = Number(product.mrp) - Number(product.discountAmount);
  const hasDiscount = Number(product.discountAmount) > 0;

  const hasMultipleImages = images && images.length > 1;
  const currentImage = images && images.length > 0 ? images[imgIndex] : null;
  const imgSrc = currentImage
    ? uint8ToDataUrl(currentImage.imageData, currentImage.imageType)
    : null;

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

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || !images || images.length <= 1) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) {
      if (delta < 0) {
        setImgIndex((i) => Math.min(i + 1, images.length - 1));
      } else {
        setImgIndex((i) => Math.max(i - 1, 0));
      }
    }
    setTouchStartX(null);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="card-luxury group flex flex-col overflow-hidden hover:border-gold transition-colors duration-300 cursor-pointer"
        onClick={handleCardClick}
        data-ocid={`product.item.${index + 1}`}
      >
        <div
          className="relative aspect-[3/4] overflow-hidden bg-secondary"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
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
                      i === imgIndex
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
