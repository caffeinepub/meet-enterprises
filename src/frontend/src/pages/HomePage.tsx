import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { ProductCard } from "../components/ProductCard";
import { ThreeHero } from "../components/ThreeHero";
import { useProducts } from "../hooks/useQueries";

export function HomePage() {
  const navigate = useNavigate();
  const { data: products, isLoading: prodLoading } = useProducts();

  const displayProducts = products ? products.slice(0, 8) : [];

  const logos = [
    {
      src: "/assets/uploads/1781-photoaidcom-cropped.jpg-1.png",
      alt: "Meet Enterprises",
      delay: "0s",
    },
    {
      src: "/assets/uploads/cropped_circle_image-2.png",
      alt: "Navkar Fashion",
      delay: "1.3s",
    },
    {
      src: "/assets/uploads/cropped_circle_image-1--3.png",
      alt: "Jyoti Stores",
      delay: "0.7s",
    },
  ];

  return (
    <main>
      {/* Hero */}
      <section
        className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, oklch(0.06 0.004 230 / 0.7), oklch(0.09 0.004 230)), url('/assets/generated/hero-bg.dim_1400x700.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Three.js 3D background */}
        <ThreeHero />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center px-4 max-w-4xl mx-auto"
          style={{ position: "relative", zIndex: 1 }}
        >
          <p className="text-xs tracking-[0.4em] uppercase text-gold-muted mb-6">
            New Collection 2026
          </p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-gold uppercase leading-none tracking-tight mb-6">
            Elevate Your Style
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover premium fashion curated for the modern connoisseur
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="btn-gold px-10 py-6 text-sm tracking-widest uppercase"
              onClick={() => navigate({ to: "/shop" })}
              data-ocid="hero.shop_collection.button"
            >
              Shop the Collection
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        <div
          className="absolute bottom-0 left-0 right-0 h-24"
          style={{
            background:
              "linear-gradient(to bottom, transparent, oklch(0.09 0.004 230))",
          }}
        />
      </section>

      {/* Business Logos */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-8 md:gap-16 flex-wrap"
        >
          {logos.map((logo) => (
            <div
              key={logo.alt}
              className="relative group float-slow"
              style={{ animationDelay: logo.delay }}
            >
              <div
                className="rounded-full p-1"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.78 0.13 85), oklch(0.60 0.10 75), oklch(0.78 0.13 85))",
                  boxShadow: "0 0 15px oklch(0.78 0.13 85 / 0.3)",
                }}
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover block"
                  style={{ background: "oklch(0.09 0.004 230)" }}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 perspective-container">
        {prodLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }, (_, i) => i + 1).map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : !displayProducts.length ? (
          <div
            className="text-center py-16"
            data-ocid="home.products.empty_state"
          >
            <p className="text-muted-foreground">No products available yet.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {displayProducts.map((product, idx) => (
              <ProductCard
                key={product.id.toString()}
                product={product}
                index={idx}
              />
            ))}
          </motion.div>
        )}

        {products && products.length > 8 && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              className="border-gold-border text-gold hover:bg-gold/10 tracking-widest uppercase text-xs px-8 py-5"
              onClick={() => navigate({ to: "/shop" })}
              data-ocid="home.view_all.button"
            >
              View All Products
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
