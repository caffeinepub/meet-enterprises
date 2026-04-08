import { useEffect, useState } from "react";

interface SplashScreenProps {
  visible: boolean;
}

export function SplashScreen({ visible }: SplashScreenProps) {
  const [mounted, setMounted] = useState(true);

  // Hard unmount after fade completes — no AnimatePresence dependency
  useEffect(() => {
    if (!visible) {
      const t = setTimeout(() => setMounted(false), 600);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "oklch(0.09 0.004 230)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s ease-out",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        <img
          src="/assets/generated/meet-enterprises-logo-transparent.dim_400x120.png"
          alt="Meet Enterprises"
          style={{ width: "16rem", opacity: 0.9 }}
        />
        {/* Pure CSS spinner — no framer-motion dependency */}
        <div
          style={{
            width: "2rem",
            height: "2rem",
            border: "2px solid oklch(0.28 0.015 75)",
            borderTopColor: "oklch(0.72 0.11 75)",
            borderRadius: "50%",
            animation: "splash-spin 1s linear infinite",
          }}
        />
        <p
          style={{
            color: "oklch(0.55 0.08 75)",
            fontSize: "0.75rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            fontFamily: "sans-serif",
          }}
        >
          Curating Excellence
        </p>
      </div>
      <style>{`
        @keyframes splash-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
