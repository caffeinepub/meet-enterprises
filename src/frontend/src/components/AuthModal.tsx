import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentityWithProfile } from "../hooks/useLocalProfile";
import { useSaveProfile } from "../hooks/useQueries";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { setProfile } = useInternetIdentityWithProfile();
  const saveProfile = useSaveProfile();
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const handleSignIn = async () => {
    if (!name.trim() || !whatsapp.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!/^[0-9+\-\s]{7,15}$/.test(whatsapp.trim())) {
      toast.error("Please enter a valid WhatsApp number");
      return;
    }
    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        whatsapp: whatsapp.trim(),
      });
      setProfile({ name: name.trim(), whatsapp: whatsapp.trim() });
      toast.success(`Welcome to Meet Enterprises, ${name.trim()}!`);
      onClose();
    } catch {
      toast.error("Failed to sign in. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="card-luxury rounded-sm w-full max-w-md mx-4 p-8 relative"
            data-ocid="auth.modal"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              data-ocid="auth.close_button"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <h2 className="font-serif text-2xl text-gold tracking-widest uppercase mb-2">
                  Welcome
                </h2>
                <p className="text-muted-foreground text-sm">
                  Enter your details to continue
                </p>
              </div>
              <div className="w-full h-px bg-gold-border" />
              <div className="flex flex-col gap-4">
                <div>
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
                    Full Name
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="bg-secondary border-gold-border focus:border-gold"
                    data-ocid="auth.name.input"
                    onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                  />
                </div>
                <div>
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
                    WhatsApp Number
                  </Label>
                  <Input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="bg-secondary border-gold-border focus:border-gold"
                    data-ocid="auth.whatsapp.input"
                    onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                  />
                </div>
                <Button
                  className="btn-gold uppercase tracking-widest text-sm mt-2"
                  onClick={handleSignIn}
                  disabled={saveProfile.isPending}
                  data-ocid="auth.login.button"
                >
                  {saveProfile.isPending ? "Signing in..." : "Continue"}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
