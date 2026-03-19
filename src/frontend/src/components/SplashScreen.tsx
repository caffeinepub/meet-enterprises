import { AnimatePresence, motion } from "motion/react";

interface SplashScreenProps {
  visible: boolean;
}

export function SplashScreen({ visible }: SplashScreenProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center gap-8"
          >
            <img
              src="/assets/generated/meet-enterprises-logo-transparent.dim_400x120.png"
              alt="Meet Enterprises"
              className="w-64 opacity-90"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              className="w-8 h-8 border-2 border-gold-border border-t-gold rounded-full"
            />
            <p className="text-gold-muted text-xs tracking-[0.3em] uppercase font-sans">
              Curating Excellence
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
