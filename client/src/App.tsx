import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CartProvider } from "./contexts/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Branches from "./pages/Branches";
import Catering from "./pages/Catering";
import Nutrition from "./pages/Nutrition";
import Packages from "./pages/Packages";
import Loyalty from "./pages/Loyalty";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import ProductDetail from "./pages/ProductDetail";
import WhatsAppButton from "./components/WhatsAppButton";
import { useLocation } from "wouter";
import { trpc } from "./lib/trpc";
import { useEffect, createContext, useContext } from "react";

// ─── Site Settings Context ────────────────────────────────────────────────────
export const SiteSettingsContext = createContext<Record<string, string>>({});
export const useSiteSettings = () => useContext(SiteSettingsContext);

function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const { data: settings } = trpc.settings.get.useQuery();
  useEffect(() => {
      if (!settings?.primaryColor) return;
      const hex = settings.primaryColor;
      if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
      document.documentElement.style.setProperty("--primary", hex);
      document.documentElement.style.setProperty("--primary-foreground", "#ffffff");
    }, [settings?.primaryColor]);
  return (
    <SiteSettingsContext.Provider value={settings ?? {}}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");
  const isLogin = location.startsWith("/login");
    if (isLogin) return <>{children}</>;
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      {!isAdmin && <WhatsAppButton />}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Layout><Home /></Layout>} />
      <Route path="/menu" component={() => <Layout><Menu /></Layout>} />
      <Route path="/cart" component={() => <Layout><Cart /></Layout>} />
      <Route path="/orders" component={() => <Layout><Orders /></Layout>} />
      <Route path="/branches" component={() => <Layout><Branches /></Layout>} />
      <Route path="/catering" component={() => <Layout><Catering /></Layout>} />
      <Route path="/nutrition" component={() => <Layout><Nutrition /></Layout>} />
      <Route path="/packages" component={() => <Layout><Packages /></Layout>} />
      <Route path="/loyalty" component={() => <Layout><Loyalty /></Layout>} />
      <Route path="/contact" component={() => <Layout><Contact /></Layout>} />
      <Route path="/admin" component={() => <Layout><Admin /></Layout>} />
      <Route path="/login" component={() => <Layout><Login /></Layout>} />
      <Route path="/product/:id" component={() => <Layout><ProductDetail /></Layout>} />
      <Route path="/404" component={() => <Layout><NotFound /></Layout>} />
      <Route component={() => <Layout><NotFound /></Layout>} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <CartProvider>
            <TooltipProvider>
              <SiteSettingsProvider>
                <Toaster position="top-center" richColors />
                <Router />
              </SiteSettingsProvider>
            </TooltipProvider>
          </CartProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
