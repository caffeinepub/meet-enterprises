import { useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const HERO_THRESHOLD = 500; // px scrollY before locking to fixed

function TshirtSVG({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="goldGradMascot" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C9973A" />
          <stop offset="50%" stopColor="#F0C060" />
          <stop offset="100%" stopColor="#B8821A" />
        </linearGradient>
        <linearGradient id="bodyGradMascot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A1F30" />
          <stop offset="100%" stopColor="#0D1020" />
        </linearGradient>
        <filter id="glowMascot">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="goldGlowMascot">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* T-shirt body */}
      <path
        d="M18 22 L8 34 L18 38 L18 68 L62 68 L62 38 L72 34 L62 22 L52 14 C50 18 44 22 40 22 C36 22 30 18 28 14 Z"
        fill="url(#bodyGradMascot)"
        stroke="url(#goldGradMascot)"
        strokeWidth="2"
        filter="url(#glowMascot)"
      />

      {/* Collar highlight */}
      <path
        d="M28 14 C30 18 36 22 40 22 C44 22 50 18 52 14"
        stroke="url(#goldGradMascot)"
        strokeWidth="1.5"
        fill="none"
        filter="url(#goldGlowMascot)"
        strokeLinecap="round"
      />

      {/* Left sleeve seam */}
      <line
        x1="18"
        y1="38"
        x2="8"
        y2="34"
        stroke="#C9973A"
        strokeWidth="1"
        strokeDasharray="2,2"
        opacity="0.6"
      />
      {/* Right sleeve seam */}
      <line
        x1="62"
        y1="38"
        x2="72"
        y2="34"
        stroke="#C9973A"
        strokeWidth="1"
        strokeDasharray="2,2"
        opacity="0.6"
      />

      {/* Bottom hem */}
      <line
        x1="18"
        y1="65"
        x2="62"
        y2="65"
        stroke="#C9973A"
        strokeWidth="0.8"
        strokeDasharray="3,3"
        opacity="0.5"
      />

      {/* "ME" monogram on chest */}
      <text
        x="40"
        y="50"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="url(#goldGradMascot)"
        fontSize="12"
        fontWeight="700"
        fontFamily="serif"
        filter="url(#goldGlowMascot)"
        letterSpacing="1"
      >
        ME
      </text>

      {/* Crown above monogram */}
      <path
        d="M34 36 L36 31 L40 34 L44 31 L46 36 Z"
        fill="url(#goldGradMascot)"
        filter="url(#goldGlowMascot)"
      />
      <rect
        x="34"
        y="36"
        width="12"
        height="2"
        rx="1"
        fill="url(#goldGradMascot)"
      />
    </svg>
  );
}

export function TshirtMascot({ heroMode = false }: { heroMode?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);

  // Hide on admin routes
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > HERO_THRESHOLD);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // In heroMode (placed inside HomePage hero), only show when NOT scrolled
  // In global mode (App.tsx), only show when scrolled past hero
  if (isAdmin) return null;
  if (heroMode && scrolled) return null;
  if (!heroMode && !scrolled) return null;

  return (
    <motion.div
      key={heroMode ? "hero-mascot" : "fixed-mascot"}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mascot-tshirt"
      style={
        heroMode
          ? {
              position: "absolute",
              top: "calc(50% + 20px)",
              left: "calc(50% + 120px)",
              zIndex: 10,
              transformOrigin: "bottom center",
            }
          : {
              position: "fixed",
              bottom: "80px",
              right: "16px",
              // Reduced from 9000 to 100 — safe, never blocks UI or nav
              zIndex: 100,
              pointerEvents: "none",
            }
      }
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Outer glow ring */}
      <div className="mascot-glow-ring" />

      {/* Animated t-shirt */}
      <motion.div
        animate={{
          y: [0, -6, 0, -4, 0],
          rotate: [-2, 2, -1.5, 1.5, -2],
        }}
        transition={{
          duration: 3.2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          times: [0, 0.25, 0.5, 0.75, 1],
        }}
        className="mascot-shirt-wrap"
      >
        <TshirtSVG size={heroMode ? 68 : 58} />
      </motion.div>
    </motion.div>
  );
}
