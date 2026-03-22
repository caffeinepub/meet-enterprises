import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Play, ShoppingBag } from "lucide-react";
import { Component, type ReactNode } from "react";
import { useProducts, useReels } from "../hooks/useQueries";

class ReelsErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main
          className="max-w-lg mx-auto flex flex-col items-center justify-center min-h-[50vh] px-4"
          data-ocid="reels.error_state"
        >
          <Play className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground text-center">
            No reels available.
          </p>
        </main>
      );
    }
    return this.props.children;
  }
}

function ReelsContent() {
  const { data: reelsRaw, isLoading } = useReels();
  const reels = reelsRaw as import("../backend.d").Reel[] | undefined;
  const { data: products } = useProducts();
  const navigate = useNavigate();

  return (
    <main className="max-w-lg mx-auto" data-ocid="reels.page">
      <div className="px-4 pt-6 pb-2">
        <h1 className="font-serif text-2xl text-gold uppercase tracking-widest">
          Reels
        </h1>
        <div className="w-10 h-px bg-gold mt-1 mb-4" />
      </div>

      {isLoading ? (
        <div className="space-y-4 px-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[480px] w-full rounded-xl" />
          ))}
        </div>
      ) : !reels?.length ? (
        <div
          className="flex flex-col items-center justify-center min-h-[50vh] px-4"
          data-ocid="reels.empty_state"
        >
          <Play className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground text-center">
            No reels yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="space-y-4 px-4 pb-4">
          {(reels ?? []).map((reel, idx) => {
            const productId =
              Array.isArray(reel?.productId) && reel.productId.length > 0
                ? reel.productId
                : null;
            const linkedProduct = productId
              ? products?.find((p) => p.id === productId)
              : null;

            return (
              <div
                key={reel.id?.toString() ?? idx}
                className="card-luxury overflow-hidden rounded-xl"
                data-ocid={`reels.item.${idx + 1}`}
              >
                <div className="relative bg-black aspect-[9/16] max-h-[480px]">
                  <video
                    src={reel.videoUrl ?? ""}
                    controls
                    playsInline
                    muted
                    loop
                    className="w-full h-full object-cover"
                    style={{ display: "block" }}
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-foreground mb-1">
                    {reel.title ?? ""}
                  </h3>

                  {linkedProduct && (
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Featured Product
                        </p>
                        <p className="text-sm text-gold truncate max-w-[160px]">
                          {linkedProduct.name}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="btn-gold text-xs tracking-wider h-8 px-3"
                        onClick={() =>
                          navigate({
                            to: "/product/$productId",
                            params: {
                              productId: linkedProduct.id.toString(),
                            },
                          })
                        }
                        data-ocid={`reels.shop_now.button.${idx + 1}`}
                      >
                        <ShoppingBag className="w-3 h-3 mr-1" />
                        Shop Now
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export function ReelsPage() {
  return (
    <ReelsErrorBoundary>
      <ReelsContent />
    </ReelsErrorBoundary>
  );
}
