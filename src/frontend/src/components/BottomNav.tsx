import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Grid3X3, Home, Play, User } from "lucide-react";
import { motion } from "motion/react";

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/categories", icon: Grid3X3, label: "Categories" },
  { path: "/reels", icon: Play, label: "Reels" },
  { path: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gold-border"
      style={{ backgroundColor: "oklch(0.07 0.003 230)" }}
      data-ocid="bottom_nav.panel"
    >
      <div className="flex items-stretch justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const isActive =
            path === "/" ? pathname === "/" : pathname.startsWith(path);
          return (
            <button
              key={path}
              type="button"
              onClick={() => navigate({ to: path })}
              className="flex flex-col items-center justify-center py-2 px-4 flex-1 gap-0.5 transition-colors"
              data-ocid={`bottom_nav.${label.toLowerCase()}.button`}
            >
              <motion.div
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{
                    color: isActive ? "var(--gold)" : "oklch(0.55 0.005 230)",
                  }}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
              </motion.div>
              <span
                className="text-[10px] tracking-wider uppercase"
                style={{
                  color: isActive ? "var(--gold)" : "oklch(0.55 0.005 230)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
