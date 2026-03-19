import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { useCategories, useProducts } from "../hooks/useQueries";

export function HomePage() {
  const navigate = useNavigate();
  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: products, isLoading: prodLoading } = useProducts();
  const [activeCategory, setActiveCategory] = useState<bigint | null>(null);

  const displayProducts = products
    ? (activeCategory
        ? products.filter((p) => p.categoryId === activeCategory)
        : products
      ).slice(0, 8)
    : [];

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
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center px-4 max-w-4xl mx-auto"
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

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-serif text-3xl text-gold uppercase tracking-widest text-center mb-2">
            Shop by Category
          </h2>
          <div className="w-16 h-px bg-gold mx-auto mb-12" />

          {catLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  className="h-20 w-40 flex-shrink-0 rounded-sm"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className={`px-6 py-3 text-xs tracking-widest uppercase border transition-all duration-200 ${
                  activeCategory === null
                    ? "bg-gold text-background border-gold"
                    : "border-gold-border text-muted-foreground hover:border-gold hover:text-gold"
                }`}
                data-ocid="category.all.tab"
              >
                All
              </button>
              {categories?.map((cat, idx) => (
                <button
                  type="button"
                  key={cat.id.toString()}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-6 py-3 text-xs tracking-widest uppercase border transition-all duration-200 ${
                    activeCategory === cat.id
                      ? "bg-gold text-background border-gold"
                      : "border-gold-border text-muted-foreground hover:border-gold hover:text-gold"
                  }`}
                  data-ocid={`category.item.${idx + 1}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="font-serif text-3xl text-gold uppercase tracking-widest text-center mb-2">
            Featured Collection
          </h2>
          <div className="w-16 h-px bg-gold mx-auto mb-12" />

          {prodLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-sm" />
              ))}
            </div>
          ) : displayProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayProducts.map((p, idx) => (
                  <ProductCard
                    key={p.id.toString()}
                    product={p}
                    categories={categories}
                    index={idx}
                  />
                ))}
              </div>
              {products && products.length > 8 && (
                <div className="text-center mt-12">
                  <Button
                    variant="outline"
                    className="border-gold text-gold hover:bg-gold hover:text-background tracking-widest uppercase px-10"
                    onClick={() => navigate({ to: "/shop" })}
                    data-ocid="home.view_all.button"
                  >
                    View All Products
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div
              className="text-center py-20 card-luxury rounded-sm"
              data-ocid="product.empty_state"
            >
              <p className="text-muted-foreground">
                No products available yet.
              </p>
            </div>
          )}
        </motion.div>
      </section>

      {/* Offer Banner */}
      <section
        className="py-20 px-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.12 0.005 235), oklch(0.15 0.02 75 / 0.3))",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <Sparkles className="w-8 h-8 text-gold mx-auto mb-4" />
          <h2 className="font-serif text-3xl md:text-4xl text-gold uppercase tracking-widest mb-4">
            Exclusive Voucher Rewards
          </h2>
          <div className="w-16 h-px bg-gold mx-auto mb-6" />
          <p className="text-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Spend <span className="text-gold font-semibold">₹1,500+</span> and
            unlock exclusive voucher rewards worth up to{" "}
            <span className="text-gold font-semibold">₹10,000!</span>
          </p>
          <Button
            className="btn-gold mt-8 px-10 py-6 text-sm tracking-widest uppercase"
            onClick={() => navigate({ to: "/shop" })}
            data-ocid="banner.shop_now.button"
          >
            Shop Now
          </Button>
        </motion.div>
      </section>
    </main>
  );
}
