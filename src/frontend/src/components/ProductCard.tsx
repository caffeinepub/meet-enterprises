import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ShoppingCart, Tag } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Category, Product } from "../backend.d";
import { useCart } from "../context/CartContext";
import { formatPrice, uint8ToDataUrl } from "../utils/imageUtils";
import { ProductOptionsModal } from "./ProductOptionsModal";

interface ProductCardProps {
  product: Product;
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
  const category = categories?.find((c) => c.id === product.categoryId);
  const salePrice = Number(product.mrp) - Number(product.discountAmount);
  const hasDiscount = Number(product.discountAmount) > 0;
  const hasOptions =
    (product.sizes && product.sizes.length > 0) ||
    (product.colours && product.colours.length > 0);

  const imgSrc =
    product.image && product.image.length > 0
      ? uint8ToDataUrl(product.image, product.imageType)
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
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
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
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
            <Badge className="absolute top-2 right-2 bg-gold text-background border-0 text-[10px] tracking-wider">
              -
              {Math.round(
                (Number(product.discountAmount) / Number(product.mrp)) * 100,
              )}
              % OFF
            </Badge>
          )}
          {category && (
            <Badge className="absolute top-2 left-2 bg-background/80 text-gold-muted border-gold-border text-[10px] tracking-widest uppercase">
              {category.name}
            </Badge>
          )}
        </div>

        <div className="p-4 flex flex-col gap-3 flex-1">
          <h3 className="font-serif text-base text-foreground tracking-wide line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
          <div className="mt-auto flex items-center justify-between">
            <div>
              {hasDiscount && (
                <p className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.mrp)}
                </p>
              )}
              <span className="text-gold font-semibold text-lg">
                {formatPrice(salePrice)}
              </span>
            </div>
            <Button
              size="sm"
              className="btn-gold text-xs tracking-widest uppercase"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              data-ocid={`product.add_to_cart.button.${index + 1}`}
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </motion.div>

      {hasOptions && (
        <ProductOptionsModal
          product={product}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
