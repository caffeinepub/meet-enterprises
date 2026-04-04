import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronUp,
  Grid3X3,
  Search,
  Star,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ProductSummary } from "../backend.d";
import { ProductCard } from "../components/ProductCard";
import {
  useCategories,
  useProductRating,
  useProducts,
} from "../hooks/useQueries";

function TrendingProducts({
  products,
  categories,
}: { products: ProductSummary[]; categories: any[] }) {
  const [ratings, setRatings] = useState<
    Record<string, { average: number; count: number }>
  >({});

  // Load ratings from localStorage as a quick fallback
  useEffect(() => {
    const saved = localStorage.getItem("meet-ratings");
    if (saved) {
      try {
        const r = JSON.parse(saved) as Record<string, number>;
        const mapped: Record<string, { average: number; count: number }> = {};
        for (const [id, avg] of Object.entries(r)) {
          mapped[id] = { average: avg, count: 1 };
        }
        setRatings(mapped);
      } catch {}
    }
  }, []);

  const trending = products.filter((p) => {
    const r = ratings[p.id.toString()];
    return r && r.average >= 4;
  });

  if (trending.length === 0) {
    // If no ratings data yet, show top products
    const fallback = products.slice(0, 6);
    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gold" />
          <h2 className="font-serif text-lg text-gold uppercase tracking-widest">
            Trending Now
          </h2>
        </div>
        {fallback.length === 0 ? (
          <p className="text-muted-foreground text-sm">No products yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {fallback.map((p, idx) => (
              <ProductCard
                key={p.id.toString()}
                product={p}
                categories={categories}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-gold" />
        <h2 className="font-serif text-lg text-gold uppercase tracking-widest">
          Trending Now
        </h2>
        <span className="text-xs text-muted-foreground ml-1">(4-5 ★)</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {trending.map((p, idx) => (
          <ProductCard
            key={p.id.toString()}
            product={p}
            categories={categories}
            index={idx}
          />
        ))}
      </div>
    </div>
  );
}

export function CategoriesPage() {
  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: products, isLoading: prodLoading } = useProducts();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSummary[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Autocomplete logic
  useEffect(() => {
    if (!search.trim() || !products) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const q = search.toLowerCase();
    const matches = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      )
      .slice(0, 8);
    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  }, [search, products]);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSuggestionClick = (product: ProductSummary) => {
    setSearch("");
    setShowSuggestions(false);
    navigate({
      to: "/product/$productId",
      params: { productId: product.id.toString() },
    });
  };

  const _handleCategoryClick = (cat: { id: bigint; name: string }) => {
    // Navigate to shop with category filter via URL state
    navigate({
      to: "/categories",
      search: { category: cat.id.toString() } as any,
    });
    // Alternatively open the inline filtered view
    setSelectedCategory(cat);
  };

  const [selectedCategory, setSelectedCategory] = useState<{
    id: bigint;
    name: string;
  } | null>(null);

  if (selectedCategory) {
    const filteredProducts =
      products?.filter((p) =>
        selectedCategory.id === BigInt(-1)
          ? true
          : p.categoryId === selectedCategory.id,
      ) ?? [];

    return (
      <main
        className="max-w-2xl mx-auto px-4 sm:px-6 py-8"
        data-ocid="categories.page"
      >
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-1.5 text-gold text-sm font-medium"
            >
              ← Back
            </button>
            <span className="text-muted-foreground">|</span>
            <h1 className="font-serif text-xl text-gold uppercase tracking-widest">
              {selectedCategory.name}
            </h1>
          </div>

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
            <div className="card-luxury p-10 text-center">
              <p className="text-muted-foreground text-sm">
                No products in this category yet.
              </p>
            </div>
          )}
        </motion.div>
      </main>
    );
  }

  return (
    <main
      className="max-w-2xl mx-auto px-4 sm:px-6 py-8"
      data-ocid="categories.page"
    >
      {/* ── 1. Search Bar with Suggestions ── */}
      <div className="mb-8" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{
              background: "oklch(0.13 0.005 230)",
              border: "1px solid oklch(0.78 0.13 85 / 0.25)",
              color: "oklch(0.92 0.01 230)",
            }}
            data-ocid="categories.search_input"
          />
        </div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="mt-1 rounded-xl overflow-hidden shadow-xl z-50 relative"
              style={{
                background: "oklch(0.13 0.005 230)",
                border: "1px solid oklch(0.78 0.13 85 / 0.3)",
              }}
            >
              {suggestions.map((p, _idx) => (
                <button
                  key={p.id.toString()}
                  type="button"
                  onClick={() => handleSuggestionClick(p)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 border-b last:border-b-0"
                  style={{ borderColor: "oklch(0.78 0.13 85 / 0.1)" }}
                >
                  <Search className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {highlightMatch(p.name, search)}
                    </p>
                    {p.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {p.description.slice(0, 60)}
                        {p.description.length > 60 ? "..." : ""}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gold font-semibold flex-shrink-0">
                    ₹
                    {(Number(p.mrp) - Number(p.discountAmount)).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 2. Categories (collapsible) ── */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => setCategoriesOpen((o) => !o)}
          className="w-full flex items-center justify-between py-3 px-4 rounded-xl transition-colors"
          style={{
            background: categoriesOpen
              ? "oklch(0.78 0.13 85 / 0.08)"
              : "oklch(0.13 0.005 230)",
            border: "1px solid oklch(0.78 0.13 85 / 0.25)",
          }}
          data-ocid="categories.toggle.button"
        >
          <div className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4 text-gold" />
            <span className="font-serif text-gold uppercase tracking-widest text-sm font-semibold">
              Categories
            </span>
            {categories && !catLoading && (
              <span className="text-xs text-muted-foreground">
                ({categories.length})
              </span>
            )}
          </div>
          {categoriesOpen ? (
            <ChevronUp className="w-4 h-4 text-gold" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gold" />
          )}
        </button>

        <AnimatePresence>
          {categoriesOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="pt-3">
                {catLoading ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-16 rounded-lg" />
                    ))}
                  </div>
                ) : !categories?.length ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No categories yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {/* All Products tile */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() =>
                        setSelectedCategory({
                          id: BigInt(-1),
                          name: "All Products",
                        })
                      }
                      className="card-luxury p-4 text-left hover:border-gold transition-colors"
                      data-ocid="categories.all.button"
                    >
                      <Grid3X3 className="w-5 h-5 text-gold mb-1.5" />
                      <p className="font-medium text-sm">All Products</p>
                    </motion.button>

                    {categories.map((cat, idx) => (
                      <motion.button
                        key={cat.id.toString()}
                        type="button"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: idx * 0.04 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() =>
                          setSelectedCategory({ id: cat.id, name: cat.name })
                        }
                        className="card-luxury p-4 text-left hover:border-gold transition-colors"
                        data-ocid={`categories.item.${idx + 1}`}
                      >
                        <div
                          className="w-5 h-5 rounded mb-1.5"
                          style={{
                            background: "oklch(0.78 0.13 85 / 0.15)",
                            border: "1px solid oklch(0.78 0.13 85 / 0.3)",
                          }}
                        />
                        <p className="font-medium text-sm truncate">
                          {cat.name}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 3. Trending Products ── */}
      {prodLoading ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gold" />
            <h2 className="font-serif text-lg text-gold uppercase tracking-widest">
              Trending Now
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-[3/4]" />
            ))}
          </div>
        </div>
      ) : (
        <TrendingProducts
          products={products ?? []}
          categories={categories ?? []}
        />
      )}
    </main>
  );
}

/** Highlight the matching part of a product name */
function highlightMatch(text: string, query: string): React.ReactNode {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ color: "oklch(0.78 0.13 85)" }}>
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}
