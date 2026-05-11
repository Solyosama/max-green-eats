import { useSiteSettings } from "@/App";
import { useCart } from "@/contexts/CartContext";
import { useLang } from "@/contexts/LanguageContext";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Globe,
  LogOut,
  Menu,
  ShoppingCart,
  User,
  ChevronDown,
  Leaf,
  LayoutDashboard,
  Package,
  ClipboardList,
  Star,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import NotificationBell from "@/components/NotificationBell";
import { useSiteSettings } from "@/App";
export default function Navbar() {
  const { lang, setLang, t, isRTL } = useLang();
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const settings = useSiteSettings();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { logout(); window.location.href = "/"; },
  });

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/menu", label: t.nav.menu },
    { href: "/packages", label: t.nav.packages },
    { href: "/nutrition", label: t.nav.nutrition },
    { href: "/catering", label: t.nav.catering },
    { href: "/branches", label: t.nav.branches },
    { href: "/contact", label: t.nav.contact },
  ];

  const isActive = (href: string) => href === "/" ? location === "/" : location.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-md bg-primary">
  {settings?.siteLogo ? (
    <img src={settings.siteLogo} alt="logo" className="w-full h-full object-cover" />
  ) : (
    <Leaf className="w-5 h-5 text-white" />
  )}
</div>
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-primary text-lg leading-tight" style={{ fontFamily: "'Cairo', sans-serif" }}>
                ماكس جرين
              </div>
              <div className="text-xs text-muted-foreground leading-tight">Max Green Eats</div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="gap-1.5 text-muted-foreground hover:text-primary"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium">{lang === "ar" ? "EN" : "عر"}</span>
            </Button>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative text-muted-foreground hover:text-primary">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -end-1 w-5 h-5 p-0 flex items-center justify-center text-[10px] bg-primary">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Notification Bell */}
            <NotificationBell />

            {/* User Menu */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-primary">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-foreground max-w-[100px] truncate">
                      {user.name || t.nav.profile}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-52">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center gap-2 cursor-pointer">
                      <ClipboardList className="w-4 h-4" />
                      {t.nav.orders}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/loyalty" className="flex items-center gap-2 cursor-pointer">
                      <Star className="w-4 h-4" />
                      {t.nav.loyalty}
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2 cursor-pointer text-primary">
                          <LayoutDashboard className="w-4 h-4" />
                          {t.nav.admin}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logoutMutation.mutate()}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 me-2" />
                    {t.nav.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={() => window.location.href = getLoginUrl()}
              >
                {t.nav.login}
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden text-muted-foreground">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "right" : "left"} className="w-72 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b bg-primary/5">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-primary" style={{ fontFamily: "'Cairo', sans-serif" }}>ماكس جرين</div>
                        <div className="text-xs text-muted-foreground">Max Green Eats</div>
                      </div>
                    </div>
                  </div>
                  <nav className="flex-1 p-4 space-y-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive(link.href)
                            ? "bg-primary text-white"
                            : "text-foreground hover:bg-primary/10 hover:text-primary"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
