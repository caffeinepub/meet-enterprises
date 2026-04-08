import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Instagram, Tag } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useInstagramHandle, useSchemes } from "../hooks/useQueries";

export function SchemesPage() {
  const { data: schemes, isLoading } = useSchemes();
  const { data: instagramHandle } = useInstagramHandle();

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success(`Coupon code "${code}" copied!`);
    });
  };

  return (
    <motion.main
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-serif text-4xl text-gold uppercase tracking-widest text-center mb-2">
          Schemes &amp; Offers
        </h1>
        <p className="text-center text-muted-foreground text-sm mb-2">
          Exclusive deals and coupon codes just for you
        </p>
        <div className="w-16 h-px bg-gold mx-auto mb-10" />

        {/* Instagram Section */}
        {instagramHandle && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-luxury holo-border p-5 flex items-center gap-4 mb-8"
            data-ocid="schemes.instagram.card"
          >
            <div
              className="p-3 rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, #f9ce34, #ee2a7b, #6228d7)",
              }}
            >
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-0.5">
                Follow Us on Instagram
              </p>
              <a
                href={`https://www.instagram.com/${instagramHandle.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gold hover:underline text-base"
              >
                @{instagramHandle.replace(/^@/, "")}
              </a>
            </div>
          </motion.div>
        )}

        {/* Schemes & Coupons */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : schemes && schemes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schemes.map((scheme, idx) => (
              <motion.div
                key={scheme.id.toString()}
                initial={{ opacity: 0, rotateX: 10, y: 24 }}
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.55 }}
                className="card-luxury holo-border p-6 flex flex-col gap-4"
                style={{ transformStyle: "preserve-3d" }}
                data-ocid={`scheme.card.${idx + 1}`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gold/10 rounded-sm">
                    <Tag className="w-4 h-4 text-gold" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-lg text-gold tracking-wide mb-1">
                      {scheme.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {scheme.description}
                    </p>
                  </div>
                </div>

                {scheme.couponCode && (
                  <div className="flex items-center justify-between bg-background/50 border border-gold-border px-4 py-3 rounded-sm">
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1">
                        Coupon Code
                      </p>
                      <span className="font-mono text-gold font-bold tracking-widest text-base">
                        {scheme.couponCode}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyCode(scheme.couponCode)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors border border-gold-border px-3 py-2"
                      data-ocid={`scheme.copy_code.button.${idx + 1}`}
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-24 card-luxury"
            data-ocid="schemes.empty_state"
          >
            <Tag className="w-12 h-12 text-gold/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              No active schemes right now. Check back soon!
            </p>
          </div>
        )}
      </motion.div>
    </motion.main>
  );
}
