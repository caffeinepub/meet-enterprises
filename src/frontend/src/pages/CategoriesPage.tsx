import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Grid3X3, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { useCategories, useProducts } from "../hooks/useQueries";

export function CategoriesPage() {
  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: products, isLoading: prodLoading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<{
    id: bigint;
    name: string;
  } | null>(null);
  const [search, setSearch] = useState("");

  const filteredProducts =
    products?.filter((p) => {
      const matchCat =
        selectedCategory === null || p.categoryId === selectedCategory.id;
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    }) ?? [];

  const handleBack = () => {
    setSelectedCategory(null);
    setSearch("");
  };

  return (
    <main
      className="max-w-2xl mx-auto px-4 sm:px-6 py-8"
      data-ocid="categories.page"
    >
      <AnimatePresence mode="wait">
        {selectedCategory === null ? (
          /* ─── Category Grid ─── */
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <h1 className="font-serif text-2xl text-gold uppercase tracking-widest mb-1">
              Categories
            </h1>
            <div className="w-10 h-px bg-gold mb-6" />

            {catLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : !categories?.length ? (
              <div
                className="card-luxury p-10 text-center"
                data-ocid="categories.empty_state"
              >
                <Grid3X3 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  No categories yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    setSelectedCategory({
                      id: BigInt(-1),
                      name: "All Products",
                    })
                  }
                  className="card-luxury p-5 text-left hover:border-gold transition-colors"
                  data-ocid="categories.all.button"
                >
                  <Grid3X3 className="w-6 h-6 text-gold mb-2" />
                  <p className="font-medium text-sm">All Products</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    View everything
                  </p>
                </motion.button>

                {categories.map((cat, idx) => (
                  <motion.button
                    key={cat.id.toString()}
                    type="button"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: (idx + 1) * 0.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() =>
                      setSelectedCategory({ id: cat.id, name: cat.name })
                    }
                    className="card-luxury p-5 text-left hover:border-gold transition-colors"
                    data-ocid={`categories.item.${idx + 1}`}
                  >
                    <div
                      className="w-6 h-6 rounded mb-2"
                      style={{
                        background: "oklch(0.78 0.13 85 / 0.15)",
                        border: "1px solid oklch(0.78 0.13 85 / 0.3)",
                      }}
                    />
                    <p className="font-medium text-sm">{cat.name}</p>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          /* ─── Filtered Products ─── */
          <motion.div
            key="products"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.25 }}
          >
            {/* Header with back button */}
            <div className="flex items-center gap-3 mb-1">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
                style={{
                  background: "oklch(0.14 0.005 230)",
                  border: "1px solid oklch(0.25 0.005 230)",
                }}
                data-ocid="categories.back.button"
              >
                <ArrowLeft className="w-4 h-4 text-gold" />
              </button>
              <h1 className="font-serif text-2xl text-gold uppercase tracking-widest">
                {selectedCategory.name}
              </h1>
            </div>
            <div className="w-10 h-px bg-gold mb-5" />

            {/* Search bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="pl-10 bg-secondary border-gold-border"
                data-ocid="categories.search_input"
              />
            </div>

            {/* Products grid */}
            {prodLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="aspect-[3/4]" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {filteredProducts.map((p, idx) => (
                  <ProductCard
                    key={p.id.toString()}
                    product={p}
                    categories={categories}
                    index={idx}
                  />
                ))}
              </div>
            ) : (
              <div
                className="card-luxury p-10 text-center"
                data-ocid="categories.products.empty_state"
              >
                <p className="text-muted-foreground text-sm">
                  {search
                    ? "No products match your search."
                    : "No products in this category yet."}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
