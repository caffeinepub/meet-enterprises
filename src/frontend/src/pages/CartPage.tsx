import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useCart } from "../context/CartContext";
import { formatPrice, uint8ToDataUrl } from "../utils/imageUtils";

export function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, totalAmount } = useCart();

  if (items.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6"
          data-ocid="cart.empty_state"
        >
          <ShoppingBag className="w-16 h-16 text-muted-foreground/40" />
          <h1 className="font-serif text-3xl text-gold uppercase tracking-widest">
            Your Cart is Empty
          </h1>
          <p className="text-muted-foreground">
            Discover our premium collection
          </p>
          <Button
            className="btn-gold px-10 tracking-widest uppercase"
            onClick={() => navigate({ to: "/shop" })}
            data-ocid="cart.continue_shopping.button"
          >
            Shop Now
          </Button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-serif text-4xl text-gold uppercase tracking-widest mb-2">
          Your Cart
        </h1>
        <div className="w-16 h-px bg-gold mb-10" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div
            className="lg:col-span-2 flex flex-col gap-4"
            data-ocid="cart.list"
          >
            {items.map((item, idx) => {
              const imgSrc = item.product.image?.length
                ? uint8ToDataUrl(item.product.image, item.product.imageType)
                : null;
              const salePrice =
                Number(item.product.mrp) - Number(item.product.discountAmount);
              return (
                <motion.div
                  key={`${item.product.id}-${item.selectedSize}-${item.selectedColour}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="card-luxury p-4 flex gap-4 items-center"
                  data-ocid={`cart.item.${idx + 1}`}
                >
                  <div className="w-20 h-24 bg-secondary flex-shrink-0 overflow-hidden">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-base text-foreground truncate">
                      {item.product.name}
                    </p>
                    {item.selectedSize && (
                      <p className="text-xs text-muted-foreground">
                        Size: {item.selectedSize}
                      </p>
                    )}
                    {item.selectedColour && (
                      <p className="text-xs text-muted-foreground">
                        Colour: {item.selectedColour}
                      </p>
                    )}
                    <p className="text-gold text-sm mt-1">
                      {formatPrice(salePrice)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 border border-gold-border hover:border-gold"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      data-ocid={`cart.decrease.button.${idx + 1}`}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 border border-gold-border hover:border-gold"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      data-ocid={`cart.increase.button.${idx + 1}`}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="w-20 text-right text-sm font-semibold text-gold">
                    {formatPrice(salePrice * item.quantity)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.product.id)}
                    data-ocid={`cart.delete_button.${idx + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              );
            })}
          </div>

          <div className="card-luxury p-6 h-fit">
            <h2 className="font-serif text-xl text-gold uppercase tracking-widest mb-6">
              Order Summary
            </h2>
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Subtotal</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mb-4">
              <span>Shipping</span>
              <span className="text-gold">Free</span>
            </div>
            <div className="h-px bg-gold-border mb-4" />
            <div className="flex justify-between font-semibold mb-6">
              <span>Total</span>
              <span className="text-gold text-lg">
                {formatPrice(totalAmount)}
              </span>
            </div>
            <Button
              className="btn-gold w-full tracking-widest uppercase"
              onClick={() => navigate({ to: "/checkout" })}
              data-ocid="cart.checkout.button"
            >
              Proceed to Checkout
            </Button>
            <Button
              variant="ghost"
              className="w-full mt-3 text-muted-foreground hover:text-foreground text-xs tracking-widest uppercase"
              onClick={() => navigate({ to: "/shop" })}
              data-ocid="cart.continue_shopping.button"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
