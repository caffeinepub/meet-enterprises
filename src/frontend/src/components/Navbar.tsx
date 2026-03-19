import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useInternetIdentityWithProfile } from "../hooks/useLocalProfile";

interface NavbarProps {
  onLoginClick: () => void;
}

export function Navbar({ onLoginClick }: NavbarProps) {
  const { items } = useCart();
  const { profile, clear } = useInternetIdentityWithProfile();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <nav
      className="sticky top-0 z-50 bg-background border-b border-gold-border"
      style={{ backgroundColor: "oklch(0.09 0.004 230)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <span className="font-serif text-xl tracking-widest text-gold uppercase font-semibold">
              Meet Enterprises
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm tracking-widest uppercase text-muted-foreground hover:text-gold transition-colors"
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="text-sm tracking-widest uppercase text-muted-foreground hover:text-gold transition-colors"
            >
              Shop
            </Link>
            <Link
              to="/schemes"
              className="text-sm tracking-widest uppercase text-muted-foreground hover:text-gold transition-colors"
            >
              Schemes
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-gold"
              onClick={() => navigate({ to: "/shop" })}
            >
              <Search className="w-4 h-4" />
            </Button>

            {profile ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:block text-xs text-gold tracking-wider">
                  {profile.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={clear}
                  data-ocid="nav.logout.button"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-gold"
                onClick={onLoginClick}
                data-ocid="nav.login.button"
              >
                <User className="w-4 h-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-gold"
              onClick={() => navigate({ to: "/cart" })}
              data-ocid="nav.cart.button"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 text-[10px] flex items-center justify-center bg-gold text-background border-0">
                  {totalItems}
                </Badge>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gold-border py-4 flex flex-col gap-4">
            <Link
              to="/"
              className="text-sm tracking-widest uppercase text-muted-foreground hover:text-gold"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="text-sm tracking-widest uppercase text-muted-foreground hover:text-gold"
              onClick={() => setMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              to="/schemes"
              className="text-sm tracking-widest uppercase text-muted-foreground hover:text-gold"
              onClick={() => setMenuOpen(false)}
            >
              Schemes
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
