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
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { SplashScreen } from "./components/SplashScreen";
import { CartProvider } from "./context/CartContext";
import { AdminPage } from "./pages/AdminPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { HomePage } from "./pages/HomePage";
import { SchemesPage } from "./pages/SchemesPage";
import { ShopPage } from "./pages/ShopPage";
import { SupportFAQPage } from "./pages/SupportFAQPage";

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
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
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

const routeTree = rootRoute.addChildren([
  homeRoute,
  shopRoute,
  cartRoute,
  checkoutRoute,
  adminRoute,
  schemesRoute,
  supportRoute,
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
    const t = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <CartProvider>
      <SplashScreen visible={showSplash} />
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </CartProvider>
  );
}
