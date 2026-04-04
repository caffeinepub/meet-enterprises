import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { useCategories, useProducts } from "../hooks/useQueries";

export function ShopPage() {
  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: products, isLoading: prodLoading } = useProducts();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<bigint | null>(null);

  const filtered =
    products?.filter((p) => {
      const matchCat =
        activeCategory === null || p.categoryId === activeCategory;
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    }) ?? [];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-serif text-4xl text-gold uppercase tracking-widest text-center mb-2">
          Our Collection
        </h1>
        <div className="w-16 h-px bg-gold mx-auto mb-12" />

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-10 bg-secondary border-gold-border"
              data-ocid="shop.search_input"
            />
          </div>
        </div>

        {/* Category Pills */}
        {!catLoading && (
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`px-5 py-2 text-xs tracking-widest uppercase border transition-all ${
                activeCategory === null
                  ? "bg-gold text-background border-gold"
                  : "border-gold-border text-muted-foreground hover:border-gold hover:text-gold"
              }`}
              data-ocid="shop.category.all.tab"
            >
              All
            </button>
            {categories?.map((cat, idx) => (
              <button
                type="button"
                key={cat.id.toString()}
                onClick={() =>
                  setActiveCategory((prev) => (prev === cat.id ? null : cat.id))
                }
                className={`px-5 py-2 text-xs tracking-widest uppercase border transition-all ${
                  activeCategory === cat.id
                    ? "bg-gold text-background border-gold"
                    : "border-gold-border text-muted-foreground hover:border-gold hover:text-gold"
                }`}
                data-ocid={`shop.category.item.${idx + 1}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid — 3D staggered reveal */}
        <div className="perspective-container">
          {prodLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="aspect-[3/4]" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((p, idx) => (
                <motion.div
                  key={p.id.toString()}
                  initial={{ opacity: 0, rotateX: 12, y: 30 }}
                  animate={{ opacity: 1, rotateX: 0, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.04 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <ProductCard
                    product={p}
                    categories={categories}
                    index={idx}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-24 card-luxury"
              data-ocid="shop.product.empty_state"
            >
              <p className="text-muted-foreground">
                {search || activeCategory
                  ? "No products match your filters."
                  : "No products available yet."}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
