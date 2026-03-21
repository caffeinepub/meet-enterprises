import { Link } from "@tanstack/react-router";
import { Instagram, Mail, Phone } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-gold-border mt-24"
      style={{ backgroundColor: "oklch(0.07 0.003 230)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <p className="font-serif text-xl text-gold tracking-widest uppercase mb-3">
              Meet Enterprises
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium Fashion for the Modern Connoisseur
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs tracking-widest uppercase text-gold mb-4 font-semibold">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  to="/shop"
                  className="text-sm text-muted-foreground hover:text-gold transition-colors"
                >
                  Shop All
                </Link>
              </li>
              <li>
                <Link
                  to="/schemes"
                  className="text-sm text-muted-foreground hover:text-gold transition-colors"
                >
                  Schemes & Offers
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-sm text-muted-foreground hover:text-gold transition-colors"
                >
                  Support & FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="text-sm text-muted-foreground hover:text-gold transition-colors"
                >
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs tracking-widest uppercase text-gold mb-4 font-semibold">
              Contact
            </h3>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                <a
                  href="tel:+919723641809"
                  className="hover:text-gold transition-colors"
                >
                  97236 41809
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                <a
                  href="tel:+919723644472"
                  className="hover:text-gold transition-colors"
                >
                  97236 44472
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                <a
                  href="tel:+919662187150"
                  className="hover:text-gold transition-colors"
                >
                  +91 96621 87150
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                <a
                  href="mailto:support@meetenterprise654@gmail.com"
                  className="hover:text-gold transition-colors break-all"
                >
                  support@meetenterprise654@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-xs tracking-widest uppercase text-gold mb-4 font-semibold">
              Follow Us
            </h3>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Instagram className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                <a
                  href="https://www.instagram.com/meet_.enterprise"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  @meet_.enterprise
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Instagram className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                <a
                  href="https://www.instagram.com/navkar_fashionn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  @navkar_fashionn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gold-border mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {year} Meet Enterprises. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">Designed by Neev Vora</p>
        </div>
      </div>
    </footer>
  );
}
