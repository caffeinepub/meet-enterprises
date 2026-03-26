import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Heart, MessageCircle, Send, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Component, type ReactNode, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Reel, ReelComment } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useLocalProfile } from "../hooks/useLocalProfile";
import { useProducts, useReels } from "../hooks/useQueries";

function timeAgo(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  const diff = Date.now() - ms;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function CommentsPanel({
  reelId,
  onClose,
}: {
  reelId: bigint;
  onClose: () => void;
}) {
  const { actor } = useActor();
  const { profile } = useLocalProfile();
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor) return;
    (actor as any)
      .getReelComments(reelId)
      .then((c: ReelComment[]) => {
        setComments(c);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [actor, reelId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    if (!profile) {
      toast.error("Please log in to comment");
      return;
    }
    setSending(true);
    try {
      const comment = await (actor as any).addReelComment(reelId, text.trim());
      setComments((prev) => [...prev, comment]);
      setText("");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="absolute bottom-0 left-0 right-0 z-30 flex flex-col"
      style={{
        height: "65%",
        backgroundColor: "oklch(0.1 0.004 230 / 0.97)",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        backdropFilter: "blur(12px)",
      }}
      onClick={(e) => e.stopPropagation()}
      data-ocid="reels.comments.panel"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-sm font-semibold text-white">Comments</span>
        <button
          type="button"
          onClick={onClose}
          className="text-white/60 hover:text-white text-xs px-2 py-1"
          data-ocid="reels.comments.close_button"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading ? (
          <p className="text-white/40 text-sm text-center py-6">Loading...</p>
        ) : comments.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-6">
            No comments yet. Be the first!
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id.toString()} className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-gold font-bold">
                  {c.userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <span className="text-xs font-semibold text-white mr-2">
                  {c.userName}
                </span>
                <span className="text-xs text-white/40">
                  {timeAgo(c.createdAt)}
                </span>
                <p className="text-sm text-white/80 mt-0.5">{c.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-4 py-3 border-t border-white/10">
        {profile ? (
          <div className="flex gap-2 items-center">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Add a comment..."
              className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:ring-1 focus:ring-gold/50"
              data-ocid="reels.comment.input"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !text.trim()}
              className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center hover:bg-gold/30 disabled:opacity-40 transition"
              data-ocid="reels.comment.submit_button"
            >
              <Send className="w-4 h-4 text-gold" />
            </button>
          </div>
        ) : (
          <p className="text-center text-white/40 text-xs py-1">
            Log in to comment
          </p>
        )}
      </div>
    </motion.div>
  );
}

function ReelSlide({
  reel,
  isActive,
  instagramHandle,
  linkedProductId,
  linkedProductName,
}: {
  reel: Reel;
  isActive: boolean;
  instagramHandle: string;
  linkedProductId: bigint | null;
  linkedProductName: string | null;
}) {
  const navigate = useNavigate();
  const { actor } = useActor();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Pause video when not active
  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isActive]);

  // Load like state
  useEffect(() => {
    if (!actor || !isActive) return;
    Promise.all([(actor as any).getReelLikeCount(reel.id)])
      .then(([count]) => {
        setLikeCount(Number(count));
      })
      .catch(() => {});
  }, [actor, reel.id, isActive]);

  const handleLike = async () => {
    if (!actor) return;
    try {
      if (liked) {
        await (actor as any).unlikeReel(reel.id);
        setLiked(false);
        setLikeCount((n) => Math.max(0, n - 1));
      } else {
        await (actor as any).likeReel(reel.id);
        setLiked(true);
        setLikeCount((n) => n + 1);
      }
    } catch {
      toast.error("Failed to like reel");
    }
  };

  const isYouTube = /youtube\.com|youtu\.be/.test(reel.videoUrl ?? "");

  const getYouTubeEmbedUrl = (url: string) => {
    try {
      const u = new URL(url);
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        if (id)
          return `https://www.youtube.com/embed/${id}?autoplay=${isActive ? 1 : 0}&mute=1&rel=0&loop=1`;
      }
      if (u.hostname === "youtu.be") {
        const id = u.pathname.replace("/", "");
        if (id)
          return `https://www.youtube.com/embed/${id}?autoplay=${isActive ? 1 : 0}&mute=1&rel=0&loop=1`;
      }
      if (u.pathname.startsWith("/embed/")) return url;
    } catch {}
    return null;
  };

  const igHandle = instagramHandle.startsWith("@")
    ? instagramHandle
    : instagramHandle
      ? `@${instagramHandle}`
      : "";
  const igUrl = igHandle
    ? `https://www.instagram.com/${igHandle.replace("@", "")}`
    : "#";

  return (
    <div
      className="relative w-full flex-shrink-0 overflow-hidden"
      style={{ height: "calc(100dvh - 64px - 64px)" }}
    >
      {/* Video background */}
      {isYouTube ? (
        <iframe
          src={getYouTubeEmbedUrl(reel.videoUrl) ?? reel.videoUrl}
          className="absolute inset-0 w-full h-full"
          style={{ border: "none", objectFit: "cover" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={reel.title}
        />
      ) : (
        <video
          ref={videoRef}
          src={reel.videoUrl ?? ""}
          loop
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.05) 70%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* Right side actions */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-20">
        {/* Like */}
        <button
          type="button"
          onClick={handleLike}
          className="flex flex-col items-center gap-1"
          data-ocid="reels.like.button"
        >
          <motion.div
            animate={{ scale: liked ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className="w-7 h-7 drop-shadow"
              fill={liked ? "#ef4444" : "none"}
              stroke={liked ? "#ef4444" : "white"}
              strokeWidth={1.5}
            />
          </motion.div>
          <span className="text-white text-xs font-medium drop-shadow">
            {likeCount}
          </span>
        </button>

        {/* Comment */}
        <button
          type="button"
          onClick={() => setShowComments(true)}
          className="flex flex-col items-center gap-1"
          data-ocid="reels.comment.button"
        >
          <MessageCircle
            className="w-7 h-7 text-white drop-shadow"
            strokeWidth={1.5}
          />
          <span className="text-white text-xs font-medium drop-shadow">
            Comment
          </span>
        </button>

        {/* Shop Now */}
        {linkedProductId && (
          <button
            type="button"
            onClick={() =>
              navigate({
                to: "/product/$productId",
                params: { productId: linkedProductId.toString() },
              })
            }
            className="flex flex-col items-center gap-1"
            data-ocid="reels.shop_now.button"
          >
            <div className="w-9 h-9 rounded-full bg-gold/90 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-black" />
            </div>
            <span className="text-white text-xs font-medium drop-shadow">
              Shop Now
            </span>
          </button>
        )}
      </div>

      {/* Bottom info */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 pb-5 z-20"
        style={{ paddingRight: "4.5rem" }}
      >
        <p className="text-white font-semibold text-base drop-shadow mb-1 line-clamp-2">
          {reel.title ?? ""}
        </p>
        {linkedProductName && (
          <p className="text-gold text-sm drop-shadow mb-1">
            🛍 {linkedProductName}
          </p>
        )}
        {igHandle && (
          <a
            href={igUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 text-sm drop-shadow hover:text-gold transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {igHandle}
          </a>
        )}
      </div>

      {/* Comments panel */}
      <AnimatePresence>
        {showComments && (
          <CommentsPanel
            reelId={reel.id}
            onClose={() => setShowComments(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

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
          className="flex items-center justify-center min-h-[50vh]"
          data-ocid="reels.error_state"
        >
          <p className="text-muted-foreground">No reels available.</p>
        </main>
      );
    }
    return this.props.children;
  }
}

function ReelsContent() {
  const { data: reelsRaw, isLoading } = useReels();
  const reels = (reelsRaw as Reel[] | undefined) ?? [];
  const { data: products } = useProducts();
  const { actor } = useActor();
  const [instagramHandle, setInstagramHandle] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!actor) return;
    actor
      .getInstagramHandle()
      .then((h: string) => setInstagramHandle(h))
      .catch((err: unknown) => {
        console.warn("Could not fetch Instagram handle:", err);
      });
  }, [actor]);

  // Track which reel is in view via IntersectionObserver
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run when reels load
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const slides = container.querySelectorAll<HTMLElement>(".reel-slide");
    if (!slides.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            setActiveIdx(idx);
          }
        }
      },
      { root: container, threshold: 0.6 },
    );
    for (const slide of slides) observer.observe(slide);
    return () => observer.disconnect();
  }, [reels.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-128px)]">
        <div className="animate-pulse text-gold/40">Loading reels...</div>
      </div>
    );
  }

  if (!reels.length) {
    return (
      <div
        className="flex flex-col items-center justify-center h-[calc(100dvh-128px)]"
        data-ocid="reels.empty_state"
      >
        <p className="text-muted-foreground text-center">
          No reels yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="overflow-y-scroll"
      style={{
        height: "calc(100dvh - 64px - 64px)",
        scrollSnapType: "y mandatory",
        WebkitOverflowScrolling: "touch",
      }}
      data-ocid="reels.page"
    >
      {reels.map((reel, idx) => {
        const rawProductId =
          Array.isArray(reel?.productId) && reel.productId.length > 0
            ? (reel.productId[0] as bigint)
            : typeof reel?.productId === "bigint"
              ? reel.productId
              : null;
        const linkedProduct = rawProductId
          ? products?.find((p) => p.id === rawProductId)
          : null;

        return (
          <div
            key={reel.id?.toString() ?? idx}
            className="reel-slide w-full flex-shrink-0"
            data-index={idx}
            style={{ scrollSnapAlign: "start" }}
            data-ocid={`reels.item.${idx + 1}`}
          >
            <ReelSlide
              reel={reel}
              isActive={activeIdx === idx}
              instagramHandle={instagramHandle}
              linkedProductId={rawProductId}
              linkedProductName={linkedProduct?.name ?? null}
            />
          </div>
        );
      })}
    </div>
  );
}

export function ReelsPage() {
  return (
    <ReelsErrorBoundary>
      <ReelsContent />
    </ReelsErrorBoundary>
  );
}
