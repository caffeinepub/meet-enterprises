import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Grid3X3 } from "lucide-react";
import { motion } from "motion/react";
import { useCategories } from "../hooks/useQueries";

export function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    localStorage.setItem("shop-category-filter", categoryId);
    navigate({ to: "/shop" });
  };

  return (
    <main
      className="max-w-2xl mx-auto px-4 sm:px-6 py-8"
      data-ocid="categories.page"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-serif text-2xl text-gold uppercase tracking-widest mb-1">
          Categories
        </h1>
        <div className="w-10 h-px bg-gold mb-6" />

        {isLoading ? (
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
            <p className="text-muted-foreground text-sm">No categories yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                localStorage.removeItem("shop-category-filter");
                navigate({ to: "/shop" });
              }}
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
                onClick={() => handleCategoryClick(cat.id.toString())}
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
    </main>
  );
}
