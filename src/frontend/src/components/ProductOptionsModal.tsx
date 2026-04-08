import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShoppingCart, Tag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { useProductById } from "../hooks/useQueries";
import type { ProductSummary } from "../types";
import { formatPrice, uint8ToDataUrl } from "../utils/imageUtils";

interface ProductOptionsModalProps {
  product: ProductSummary;
  open: boolean;
  onClose: () => void;
}

export function ProductOptionsModal({
  product,
  open,
  onClose,
}: ProductOptionsModalProps) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColour, setSelectedColour] = useState<string | null>(null);
  const { data: fullProduct } = useProductById(open ? product.id : null);

  const hasSizes = product.sizes && product.sizes.length > 0;
  const hasColours = product.colours && product.colours.length > 0;

  const canAdd =
    (!hasSizes || selectedSize !== null) &&
    (!hasColours || selectedColour !== null);

  const salePrice = Number(product.mrp) - Number(product.discountAmount);

  const imgSrc =
    fullProduct?.image && fullProduct.image.length > 0
      ? uint8ToDataUrl(fullProduct.image, fullProduct.imageType)
      : null;

  const handleAdd = () => {
    addItem(product, selectedSize ?? undefined, selectedColour ?? undefined);
    toast.success(`${product.name} added to cart`);
    setSelectedSize(null);
    setSelectedColour(null);
    onClose();
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setSelectedSize(null);
      setSelectedColour(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-sm w-full bg-card border-gold-border text-foreground"
        data-ocid="product_options.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-gold tracking-wide">
            Select Options
          </DialogTitle>
        </DialogHeader>

        {/* Product preview */}
        <div className="flex gap-4 items-center">
          <div className="w-20 h-24 shrink-0 rounded-md overflow-hidden bg-secondary">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Tag className="w-6 h-6 text-muted-foreground/40" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif text-sm text-foreground line-clamp-2">
              {product.name}
            </p>
            <p className="text-gold font-semibold text-base mt-1">
              {formatPrice(salePrice)}
            </p>
          </div>
        </div>

        {/* Sizes */}
        {hasSizes && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Size
            </p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  data-ocid="product_options.select"
                  className={`px-3 py-1.5 rounded-md text-sm border transition-all duration-200 ${
                    selectedSize === size
                      ? "border-gold bg-gold/10 text-gold font-medium"
                      : "border-border text-muted-foreground hover:border-gold/50 hover:text-foreground"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Colours */}
        {hasColours && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Colour
            </p>
            <div className="flex flex-wrap gap-2">
              {product.colours.map((colour) => (
                <button
                  key={colour}
                  type="button"
                  onClick={() => setSelectedColour(colour)}
                  data-ocid="product_options.select"
                  className={`px-3 py-1.5 rounded-md text-sm border transition-all duration-200 ${
                    selectedColour === colour
                      ? "border-gold bg-gold/10 text-gold font-medium"
                      : "border-border text-muted-foreground hover:border-gold/50 hover:text-foreground"
                  }`}
                >
                  {colour}
                </button>
              ))}
            </div>
          </div>
        )}

        <Button
          className="btn-gold w-full tracking-widest uppercase text-sm mt-2"
          onClick={handleAdd}
          disabled={!canAdd}
          data-ocid="product_options.submit_button"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </DialogContent>
    </Dialog>
  );
}
