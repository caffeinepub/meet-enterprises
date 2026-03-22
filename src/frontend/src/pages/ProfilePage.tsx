import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Heart, Package, Palette, ShoppingBag, Star, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useLocalProfile } from "../hooks/useLocalProfile";
import { useMyOrders, useProducts } from "../hooks/useQueries";
import { useProductById } from "../hooks/useQueries";
import { formatPrice, uint8ToDataUrl } from "../utils/imageUtils";
import { THEMES, type ThemeId, applyTheme } from "../utils/themes";

function getWishlist(): string[] {
  try {
    return JSON.parse(localStorage.getItem("meet-wishlist") || "[]");
  } catch {
    return [];
  }
}

function getLocalRatings(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem("meet-ratings") || "{}");
  } catch {
    return {};
  }
}

function saveLocalRating(productId: string, rating: number) {
  const existing = getLocalRatings();
  existing[productId] = rating;
  localStorage.setItem("meet-ratings", JSON.stringify(existing));
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let cls = "bg-muted text-muted-foreground border-border";
  if (s === "placed") cls = "bg-blue-500/20 text-blue-400 border-blue-500/30";
  else if (s === "pending")
    cls = "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  else if (s === "confirmed" || s === "processing")
    cls = "bg-blue-500/20 text-blue-400 border-blue-500/30";
  else if (s === "shipped")
    cls = "bg-purple-500/20 text-purple-400 border-purple-500/30";
  else if (s === "out for delivery")
    cls = "bg-orange-500/20 text-orange-400 border-orange-500/30";
  else if (s === "delivered")
    cls = "bg-green-500/20 text-green-400 border-green-500/30";
  else if (s === "cancelled")
    cls = "bg-red-500/20 text-red-400 border-red-500/30";
  return <Badge className={`text-xs border ${cls}`}>{status}</Badge>;
}

function StarRating({
  productId,
  initialRating = 0,
}: {
  productId: string;
  initialRating?: number;
}) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const { actor } = useActor();

  const handleRate = async (value: number) => {
    setRating(value);
    saveLocalRating(productId, value);
    try {
      if (actor) {
        await (actor as any).rateProduct(BigInt(productId), BigInt(value));
      }
    } catch {
      // silently ignore - saved locally
    }
    toast.success("Rating saved");
  };

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleRate(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5 transition-transform hover:scale-110"
          data-ocid={`profile.rating.star.${star}`}
        >
          <Star
            className="w-4 h-4"
            fill={(hover || rating) >= star ? "oklch(0.78 0.13 85)" : "none"}
            stroke={
              (hover || rating) >= star
                ? "oklch(0.78 0.13 85)"
                : "oklch(0.45 0.005 230)"
            }
          />
        </button>
      ))}
    </div>
  );
}

function DeliveryCodeEntry({
  orderId,
  onDelivered,
}: {
  orderId: string;
  onDelivered?: () => void;
}) {
  const [code, setCode] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const { actor } = useActor();

  useEffect(() => {
    if (!actor) return;
    actor
      .getOrderDeliveryCode(orderId)
      .then((c) => setGeneratedCode(c))
      .catch(() => {});
  }, [actor, orderId]);

  const handleConfirm = async () => {
    if (code.length !== 4) {
      toast.error("Enter the 4-digit delivery code");
      return;
    }
    setConfirming(true);
    try {
      if (!actor) throw new Error("Not connected");
      const ok = await actor.verifyDeliveryCode(orderId, code);
      if (ok) {
        toast.success(
          "Your order has been delivered! Thank you for shopping with Meet Enterprises.",
          {
            duration: 5000,
          },
        );
        onDelivered?.();
      } else {
        toast.error("Incorrect code. Please check with your delivery person.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div
      className="mt-3 p-4 rounded-lg"
      style={{
        backgroundColor: "#000",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {generatedCode && (
        <div
          className="mb-3 p-3 rounded-lg"
          style={{
            backgroundColor: "rgba(255,215,0,0.08)",
            border: "1px solid rgba(255,215,0,0.3)",
          }}
        >
          <p className="text-xs text-white/50 uppercase tracking-widest mb-1">
            Your Delivery Code
          </p>
          <p className="text-3xl font-bold tracking-[0.4em] text-gold text-center">
            {generatedCode}
          </p>
          <p className="text-xs text-white/40 text-center mt-1">
            Show this to your delivery person
          </p>
        </div>
      )}
      <p className="text-xs text-white/60 mb-2 uppercase tracking-widest">
        Enter Delivery Code
      </p>
      <div className="flex gap-2 items-center">
        <input
          type="text"
          maxLength={4}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="0  0  0  0"
          className="w-28 text-center tracking-[0.5em] bg-white/5 border border-white/20 rounded px-3 py-2 text-white text-base outline-none focus:border-gold"
          data-ocid="profile.delivery_code.input"
        />
        <Button
          size="sm"
          className="btn-gold text-xs tracking-widest h-10 px-4"
          onClick={handleConfirm}
          disabled={confirming || code.length !== 4}
          data-ocid="profile.delivery_code.submit_button"
        >
          {confirming ? "Verifying..." : "Confirm"}
        </Button>
      </div>
    </div>
  );
}

function WishlistProduct({ productId }: { productId: string }) {
  const { data: product } = useProductById(BigInt(productId));
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(true);

  const removeFromWishlist = () => {
    const existing = getWishlist().filter((id) => id !== productId);
    localStorage.setItem("meet-wishlist", JSON.stringify(existing));
    setWishlisted(false);
  };

  if (!wishlisted) return null;

  return (
    <button
      type="button"
      className="card-luxury p-3 flex gap-3 w-full text-left hover:border-gold transition-colors"
      onClick={() =>
        navigate({
          to: "/product/$productId",
          params: { productId },
        })
      }
      data-ocid="profile.wishlist.item.1"
    >
      {product?.image && product.image.length > 0 ? (
        <img
          src={uint8ToDataUrl(product.image, product.imageType)}
          alt={product.name}
          className="w-16 h-16 object-cover rounded"
        />
      ) : (
        <div className="w-16 h-16 bg-secondary rounded flex items-center justify-center">
          <Package className="w-6 h-6 text-muted-foreground/30" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{product?.name ?? "..."}</p>
        <p className="text-xs text-gold mt-0.5">
          {product
            ? formatPrice(Number(product.mrp) - Number(product.discountAmount))
            : ""}
        </p>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          removeFromWishlist();
        }}
        className="text-muted-foreground hover:text-destructive transition-colors p-1"
        data-ocid="profile.wishlist.delete_button.1"
      >
        <Heart className="w-4 h-4" fill="currentColor" />
      </button>
    </button>
  );
}

export function ProfilePage() {
  const { profile } = useLocalProfile();
  const {
    data: orders,
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useMyOrders();
  const { data: allProducts } = useProducts();
  const [wishlist] = useState<string[]>(() => getWishlist());
  const [localRatings] = useState<Record<string, number>>(() =>
    getLocalRatings(),
  );
  const [activeSection, setActiveSection] = useState<
    "orders" | "wishlist" | "appearance"
  >("orders");
  const navigate = useNavigate();

  const currentTheme = (localStorage.getItem("meet-theme") ??
    "cyber-dark") as ThemeId;
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>(currentTheme);

  if (!profile) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-luxury p-10 w-full max-w-sm text-center"
        >
          <User className="w-12 h-12 text-gold mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-gold uppercase tracking-widest mb-2">
            Not Logged In
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Please log in to view your profile.
          </p>
          <Button
            className="btn-gold w-full tracking-widest"
            onClick={() => navigate({ to: "/" })}
            data-ocid="profile.login.button"
          >
            Go to Home
          </Button>
        </motion.div>
      </main>
    );
  }

  return (
    <main
      className="max-w-2xl mx-auto px-4 sm:px-6 py-8"
      data-ocid="profile.page"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: "oklch(0.78 0.13 85 / 0.15)",
              border: "2px solid oklch(0.78 0.13 85 / 0.4)",
            }}
          >
            <User className="w-8 h-8 text-gold" />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-gold tracking-wider">
              {profile.name}
            </h1>
            <p className="text-muted-foreground text-sm">
              📱 {profile.whatsapp}
            </p>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 mb-6 bg-secondary rounded-lg p-1 border border-gold-border">
          {(["orders", "wishlist", "appearance"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveSection(tab)}
              className={`flex-1 py-2 px-3 text-xs tracking-widest uppercase rounded transition-colors ${
                activeSection === tab
                  ? "bg-background text-gold font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-ocid={`profile.${tab}.tab`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders */}
        {activeSection === "orders" && (
          <section data-ocid="profile.orders.section">
            <h2 className="font-serif text-lg text-gold uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> My Orders
            </h2>
            {ordersLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : !orders?.length ? (
              <div
                className="card-luxury p-8 text-center"
                data-ocid="profile.orders.empty_state"
              >
                <ShoppingBag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No orders yet</p>
                <Button
                  size="sm"
                  className="btn-gold mt-4 text-xs tracking-widest"
                  onClick={() => navigate({ to: "/shop" })}
                  data-ocid="profile.orders.shop.button"
                >
                  Start Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order, idx) => (
                  <div
                    key={order.id}
                    className="card-luxury p-4"
                    data-ocid={`profile.orders.item.${idx + 1}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs text-muted-foreground font-mono">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(
                            Number(order.createdAt) / 1_000_000,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={order.status} />
                        <p className="text-sm text-gold font-medium">
                          {formatPrice(Number(order.totalAmount))}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-2">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""} •{" "}
                      {order.paymentMethod}
                    </p>

                    {/* Rating for delivered orders */}
                    {order.status.toLowerCase() === "delivered" && (
                      <div className="mt-2 pt-2 border-t border-gold-border/30">
                        <p className="text-xs text-muted-foreground mb-1">
                          Rate your order:
                        </p>
                        <div className="flex gap-3 flex-wrap">
                          {order.items.map((item) => {
                            const product = allProducts?.find(
                              (p) => p.id === item.productId,
                            );
                            return (
                              <div
                                key={item.productId.toString()}
                                className="flex items-center gap-2"
                              >
                                {product && (
                                  <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                                    {product.name}
                                  </span>
                                )}
                                <StarRating
                                  productId={item.productId.toString()}
                                  initialRating={
                                    localRatings[item.productId.toString()] ?? 0
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Delivery code entry for out-for-delivery orders */}
                    {order.status.toLowerCase() === "out for delivery" && (
                      <DeliveryCodeEntry
                        orderId={order.id}
                        onDelivered={() => refetchOrders()}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Wishlist */}
        {activeSection === "wishlist" && (
          <section data-ocid="profile.wishlist.section">
            <h2 className="font-serif text-lg text-gold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4" /> Wishlist
            </h2>
            {wishlist.length === 0 ? (
              <div
                className="card-luxury p-8 text-center"
                data-ocid="profile.wishlist.empty_state"
              >
                <Heart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  Your wishlist is empty
                </p>
                <Button
                  size="sm"
                  className="btn-gold mt-4 text-xs tracking-widest"
                  onClick={() => navigate({ to: "/shop" })}
                  data-ocid="profile.wishlist.shop.button"
                >
                  Explore Products
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {wishlist.map((id) => (
                  <WishlistProduct key={id} productId={id} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Appearance */}
        {activeSection === "appearance" && (
          <section data-ocid="profile.appearance.section">
            <h2 className="font-serif text-lg text-gold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4" /> Site Appearance
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    applyTheme(theme.id);
                    setSelectedTheme(theme.id);
                    toast.success(`Theme changed to ${theme.name}`);
                  }}
                  className={`card-luxury p-4 text-left transition-all ${
                    selectedTheme === theme.id
                      ? "border-gold ring-1 ring-gold/50"
                      : "hover:border-gold/50"
                  }`}
                  data-ocid={`profile.appearance.${theme.id}.button`}
                >
                  <div className="flex gap-1.5 mb-3">
                    <div
                      className="w-6 h-6 rounded-full border border-white/10"
                      style={{ backgroundColor: theme.previewBg }}
                    />
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: theme.previewPrimary }}
                    />
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: theme.previewAccent }}
                    />
                  </div>
                  <p className="text-sm font-medium">{theme.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {theme.description}
                  </p>
                  {selectedTheme === theme.id && (
                    <span className="text-xs text-gold mt-1 block">
                      ✓ Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}
      </motion.div>
    </main>
  );
}
