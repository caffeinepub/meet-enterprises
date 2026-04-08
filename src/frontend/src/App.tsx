import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AuthModal } from "./components/AuthModal";
import { BottomNav } from "./components/BottomNav";
import { CursorOrb } from "./components/CursorOrb";
import { Footer } from "./components/Footer";
import { GlobalParticles } from "./components/GlobalParticles";
import { Navbar } from "./components/Navbar";
import { SplashScreen } from "./components/SplashScreen";
import { TshirtMascot } from "./components/TshirtMascot";
import { CartProvider } from "./context/CartContext";
import { AdminPage } from "./pages/AdminPage";
import { AdminProductImagesPage } from "./pages/AdminProductImagesPage";
import { CartPage } from "./pages/CartPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { HomePage } from "./pages/HomePage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SchemesPage } from "./pages/SchemesPage";
import { ShopPage } from "./pages/ShopPage";
import { SupportFAQPage } from "./pages/SupportFAQPage";
import { loadSavedTheme } from "./utils/themes";

function ScrollToTop() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const prevRef = useRef(pathname);
  useEffect(() => {
    if (prevRef.current !== pathname) {
      prevRef.current = pathname;
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname]);
  return null;
}

function RootLayout() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar onLoginClick={() => setAuthOpen(true)} />
      <div className="flex-1 pb-16">
        <Outlet />
      </div>
      <Footer />
      <BottomNav />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shop",
  component: ShopPage,
});
const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartPage,
});
const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  component: CheckoutPage,
});
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});
const schemesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/schemes",
  component: SchemesPage,
});
const supportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/support",
  component: SupportFAQPage,
});
const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/product/$productId",
  component: ProductDetailPage,
});
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});
const adminProductImagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/product-images/$productId",
  component: () => {
    const { productId } = adminProductImagesRoute.useParams();
    return <AdminProductImagesPage productId={productId} />;
  },
});
const categoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/categories",
  component: CategoriesPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  shopRoute,
  cartRoute,
  checkoutRoute,
  adminRoute,
  schemesRoute,
  supportRoute,
  productRoute,
  profileRoute,
  categoriesRoute,
  adminProductImagesRoute,
]);
const router = createRouter({ routeTree, scrollRestoration: false });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    loadSavedTheme();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(t);
  }, []);

  if (showSplash) return <SplashScreen visible={true} />;

  return (
    <CartProvider>
      <GlobalParticles />
      <RouterProvider router={router} />
      <TshirtMascot heroMode={false} />
      <CursorOrb />
      <Toaster richColors position="top-center" />
    </CartProvider>
  );
}
