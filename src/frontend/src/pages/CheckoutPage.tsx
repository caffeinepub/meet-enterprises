import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Gift, MapPin, Package, Smartphone } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthModal } from "../components/AuthModal";
import { useCart } from "../context/CartContext";
import { useInternetIdentityWithProfile } from "../hooks/useLocalProfile";
import {
  useCreateOrder,
  usePaymentSettings,
  useUserVouchers,
} from "../hooks/useQueries";
import { formatPrice, uint8ToDataUrl } from "../utils/imageUtils";

const FALLBACK_QR = "/assets/uploads/GooglePay_QR-1.png";
const FALLBACK_UPI_ID = "voraneev2828@okhdfcbank";

function openUpiLink(upiLink: string) {
  const win = window.open(upiLink, "_blank");
  setTimeout(() => {
    const isAndroid = /android/i.test(navigator.userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isAndroid) {
      window.location.href =
        "https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user";
    } else if (isIOS) {
      window.location.href =
        "https://apps.apple.com/app/google-pay/id1193357041";
    }
    win?.close();
  }, 2000);
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCart();
  const { profile } = useInternetIdentityWithProfile();
  const { data: paymentSettings, isLoading: settingsLoading } =
    usePaymentSettings();
  const createOrder = useCreateOrder();
  const { refetch: refetchVouchers } = useUserVouchers();

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "GPay">("COD");
  const [upiAmountDialog, setUpiAmountDialog] = useState(false);
  const [upiEnteredAmount, setUpiEnteredAmount] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [newVoucher, setNewVoucher] = useState<{
    code: string;
    value: bigint;
  } | null>(null);
  const [savedTotal, setSavedTotal] = useState(0);
  const [location, setLocation] = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Show login modal if not logged in
  useEffect(() => {
    if (!profile) {
      setShowLoginModal(true);
    }
  }, [profile]);

  // Auto-detect location on mount
  useEffect(() => {
    setLocLoading(true);
    setLocError(false);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const loc = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        setLocation(loc);
        setLocLoading(false);
      },
      () => {
        setLocLoading(false);
        setLocError(true);
      },
      { timeout: 8000 },
    );
  }, []);

  if (items.length === 0 && !orderPlaced) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button
          className="btn-gold mt-6 tracking-widest uppercase"
          onClick={() => navigate({ to: "/shop" })}
        >
          Shop Now
        </Button>
      </main>
    );
  }

  const handlePlaceOrder = async () => {
    if (!profile) {
      setShowLoginModal(true);
      return;
    }
    if (!location.trim()) {
      toast.error(
        "Location is required to place an order. Please enable location access.",
      );
      return;
    }
    if (items.length === 0) return;
    try {
      setSavedTotal(totalAmount);
      const orderItems = items.map((i) => ({
        productId: i.product.id,
        quantity: BigInt(i.quantity),
        price: BigInt(Number(i.product.mrp) - Number(i.product.discountAmount)),
      }));
      const order = await createOrder.mutateAsync({
        items: orderItems,
        paymentMethod,
        deliveryLocation: location,
      });
      clearCart();
      const vResult = await refetchVouchers();
      const orderVoucher = vResult.data?.find((v) => v.orderId === order.id);
      if (orderVoucher)
        setNewVoucher({ code: orderVoucher.code, value: orderVoucher.value });
      setOrderPlaced(true);
      toast.success("Order placed successfully!");
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  if (orderPlaced) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center flex flex-col items-center gap-6"
          data-ocid="checkout.success_state"
        >
          <CheckCircle2 className="w-16 h-16 text-gold" />
          <h1 className="font-serif text-4xl text-gold uppercase tracking-widest">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground">
            Thank you for shopping with Meet Enterprises. We'll be in touch
            shortly.
          </p>
          {newVoucher ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card-luxury p-8 w-full max-w-sm"
            >
              <Gift className="w-8 h-8 text-gold mx-auto mb-4" />
              <p className="font-serif text-xl text-gold uppercase tracking-widest text-center mb-2">
                Voucher Unlocked!
              </p>
              <div className="h-px bg-gold-border my-4" />
              <p className="text-xs tracking-widest uppercase text-muted-foreground text-center mb-2">
                Your Code
              </p>
              <p className="font-mono text-2xl text-gold font-bold tracking-widest text-center">
                {newVoucher.code}
              </p>
              <p className="text-muted-foreground text-sm mt-3 text-center">
                Worth{" "}
                <span className="text-gold font-semibold">
                  {formatPrice(newVoucher.value)}
                </span>
              </p>
            </motion.div>
          ) : savedTotal >= 1500 ? (
            <p className="text-muted-foreground text-sm">
              Generating your voucher...
            </p>
          ) : (
            <p className="text-muted-foreground text-sm border border-gold-border px-6 py-4">
              Shop above ₹1500 to unlock voucher rewards
            </p>
          )}
          <Button
            className="btn-gold px-10 tracking-widest uppercase"
            onClick={() => navigate({ to: "/shop" })}
          >
            Continue Shopping
          </Button>
        </motion.div>
      </main>
    );
  }

  const qrSrc = paymentSettings?.qrImage?.length
    ? uint8ToDataUrl(paymentSettings.qrImage, paymentSettings.qrImageType)
    : FALLBACK_QR;

  const activeUpiId = paymentSettings?.upiId || FALLBACK_UPI_ID;

  const canPlaceOrder = !!location.trim() && !!profile;

  return (
    <>
      {/* Login gate modal */}
      <AuthModal
        open={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          if (!profile) navigate({ to: "/" });
        }}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-serif text-4xl text-gold uppercase tracking-widest mb-2">
            Checkout
          </h1>
          <div className="w-16 h-px bg-gold mb-10" />

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div>
              <h2 className="font-serif text-xl text-gold uppercase tracking-widest mb-6">
                Order Summary
              </h2>
              <div className="flex flex-col gap-3">
                {items.map((item, idx) => {
                  const salePrice =
                    Number(item.product.mrp) -
                    Number(item.product.discountAmount);
                  return (
                    <div
                      key={item.product.id.toString()}
                      className="flex justify-between text-sm py-2 border-b border-gold-border"
                      data-ocid={`checkout.item.${idx + 1}`}
                    >
                      <span className="text-muted-foreground">
                        {item.product.name}
                        {item.selectedSize ? ` (${item.selectedSize})` : ""}
                        {item.selectedColour ? ` — ${item.selectedColour}` : ""}{" "}
                        × {item.quantity}
                      </span>
                      <span>{formatPrice(salePrice * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between font-semibold text-lg mt-4">
                <span>Total</span>
                <span className="text-gold">{formatPrice(totalAmount)}</span>
              </div>
              {totalAmount >= 1500 && (
                <div className="mt-4 p-3 border border-gold-border bg-card">
                  <p className="text-xs text-gold flex items-center gap-2">
                    <Gift className="w-3.5 h-3.5" />
                    You qualify for an exclusive voucher reward!
                  </p>
                </div>
              )}

              {/* Delivery Location */}
              <div className="mt-6">
                <label
                  htmlFor="delivery-location"
                  className="text-xs tracking-widest uppercase text-muted-foreground flex items-center gap-2 mb-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-gold" /> Delivery Location
                  <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={
                    locLoading
                      ? "Detecting location..."
                      : "Enter your address or coordinates"
                  }
                  className="w-full bg-secondary border border-gold-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-gold"
                  id="delivery-location"
                  data-ocid="checkout.location.input"
                />
                {locLoading && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Detecting your location...
                  </p>
                )}
                {!location && !locLoading && locError && (
                  <p className="text-xs text-destructive mt-1">
                    📍 Location is required to place an order. Please enable
                    location access or type your address above.
                  </p>
                )}
                {!location && !locLoading && !locError && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Location not detected — please type your address above.
                  </p>
                )}
              </div>
            </div>

            {/* Payment */}
            <div>
              <h2 className="font-serif text-xl text-gold uppercase tracking-widest mb-6">
                Payment Method
              </h2>
              <div className="flex flex-col gap-3 mb-8">
                {(["COD", "GPay"] as const).map((method) => (
                  <label
                    key={method}
                    className={`flex items-center gap-4 p-4 card-luxury cursor-pointer transition-all ${
                      paymentMethod === method
                        ? "border-gold"
                        : "hover:border-gold/50"
                    }`}
                    data-ocid={`checkout.payment_${method.toLowerCase()}.radio`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="accent-gold"
                    />
                    <div className="flex items-center gap-3">
                      {method === "COD" ? (
                        <Package className="w-5 h-5 text-gold" />
                      ) : (
                        <Smartphone className="w-5 h-5 text-gold" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {method === "COD" ? "Cash on Delivery" : "GPay (UPI)"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {method === "COD"
                            ? "Pay when delivered"
                            : "Instant UPI payment"}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {paymentMethod === "GPay" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-luxury p-6 mb-6"
                  data-ocid="checkout.gpay.panel"
                >
                  {settingsLoading ? (
                    <Skeleton className="h-48 w-48 mx-auto" />
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <p className="text-xs tracking-widest uppercase text-muted-foreground">
                        Scan to Pay
                      </p>
                      <img
                        src={qrSrc}
                        alt="GPay QR Code"
                        className="w-56 h-56 object-contain rounded"
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        UPI ID: {activeUpiId}
                      </p>
                      <p className="text-xs text-muted-foreground text-center">
                        Or tap below to open your UPI app
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setUpiEnteredAmount(totalAmount);
                          setUpiAmountDialog(true);
                        }}
                        className="inline-flex items-center gap-2 btn-gold px-6 py-3 text-xs tracking-widest uppercase"
                        data-ocid="checkout.upi_pay.button"
                      >
                        <Smartphone className="w-4 h-4" /> Open GPay / UPI App
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              <Button
                className="btn-gold w-full py-6 tracking-widest uppercase text-sm disabled:opacity-50"
                onClick={handlePlaceOrder}
                disabled={createOrder.isPending || !canPlaceOrder}
                data-ocid="checkout.place_order.button"
              >
                {!profile
                  ? "Login to Place Order"
                  : !location.trim()
                    ? "Location Required"
                    : createOrder.isPending
                      ? "Placing Order..."
                      : "Place Order"}
              </Button>

              {!location.trim() && !locLoading && (
                <p className="text-xs text-destructive text-center mt-2">
                  📍 Location is required to place an order.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      {/* UPI Amount Dialog */}
      {upiAmountDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          data-ocid="checkout.upi_amount.modal"
        >
          <div className="card-luxury p-6 w-full max-w-sm mx-4 rounded-xl space-y-4">
            <h3 className="text-base tracking-widest uppercase text-gold">
              Enter Payment Amount
            </h3>
            <p className="text-xs text-muted-foreground">
              Confirm the amount before opening your UPI app
            </p>
            <input
              type="number"
              min={1}
              value={upiEnteredAmount}
              onChange={(e) => setUpiEnteredAmount(Number(e.target.value))}
              className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              data-ocid="checkout.upi_amount.input"
            />
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  openUpiLink(
                    `upi://pay?pa=${activeUpiId}&pn=Meet%20Enterprises&am=${upiEnteredAmount}&cu=INR`,
                  );
                  setUpiAmountDialog(false);
                }}
                className="flex-1 btn-gold py-2 text-xs tracking-widest uppercase"
                data-ocid="checkout.upi_amount.confirm_button"
              >
                Open UPI App
              </button>
              <button
                type="button"
                onClick={() => setUpiAmountDialog(false)}
                className="flex-1 border border-border rounded py-2 text-xs tracking-widest uppercase hover:bg-secondary transition-colors"
                data-ocid="checkout.upi_amount.cancel_button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
