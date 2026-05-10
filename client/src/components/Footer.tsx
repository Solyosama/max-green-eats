import { useLang } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Leaf, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useSiteSettings } from "@/App";

export default function Footer() {
  const { t, isRTL } = useLang();
  const [email, setEmail] = useState("");
  const settings = useSiteSettings();

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      toast.success(t.home.subscribeSuccess);
      setEmail("");
    },
    onError: () => toast.error(t.common.error),
  });

  const siteNameAr = settings.siteNameAr || "ماكس جرين إيتس";
  const siteNameEn = settings.siteNameEn || "Max Green Eats";
  const phone = settings.phone || "+201142839399";
  const phone2 = settings.phone2 || "";
  const emailAddr = settings.email || "info@maxgreeneats.com";
  const addressAr = settings.addressAr || "القاهرة، مصر";
  const addressEn = settings.addressEn || "Cairo, Egypt";
  const logoUrl = settings.logoUrl || "";

  const socialLinks = [
    { icon: Facebook, href: settings.facebook, label: "Facebook" },
    { icon: Instagram, href: settings.instagram, label: "Instagram" },
    { icon: Twitter, href: settings.twitter, label: "Twitter" },
    { icon: Youtube, href: "", label: "YouTube" },
  ].filter(s => s.href);

  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      {/* Newsletter */}
      <div className="border-b border-sidebar-border">
        <div className="container py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{t.home.newsletter}</h3>
              <p className="text-sidebar-foreground/70 text-sm">{t.home.newsletterSubtitle}</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                type="email"
                placeholder={t.home.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-sidebar-accent border-sidebar-border text-white placeholder:text-sidebar-foreground/50 w-64"
              />
              <Button
                onClick={() => email && subscribeMutation.mutate({ email })}
                disabled={subscribeMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-white shrink-0"
              >
                {t.home.subscribe}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {logoUrl ? (
                <img src={logoUrl} alt={siteNameEn} className="h-10 w-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <div className="font-bold text-white text-lg" style={{ fontFamily: "'Cairo', sans-serif" }}>{isRTL ? siteNameAr : siteNameEn}</div>
                {isRTL && <div className="text-xs text-sidebar-foreground/60">{siteNameEn}</div>}
              </div>
            </div>
            <p className="text-sidebar-foreground/70 text-sm leading-relaxed mb-4">
              {isRTL
                ? "نقدم أفضل الأطعمة الصحية المحضرة بأجود المكونات الطبيعية لحياة أفضل وأكثر صحة."
                : "We offer the best healthy foods prepared with the finest natural ingredients for a better, healthier life."}
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 bg-sidebar-accent rounded-lg flex items-center justify-center text-sidebar-foreground/60 hover:text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4">{isRTL ? "روابط سريعة" : "Quick Links"}</h4>
            <ul className="space-y-2">
              {[
                { href: "/menu", label: t.nav.menu },
                { href: "/packages", label: t.nav.packages },
                { href: "/nutrition", label: t.nav.nutrition },
                { href: "/catering", label: t.nav.catering },
                { href: "/branches", label: t.nav.branches },
                { href: "/contact", label: t.nav.contact },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sidebar-foreground/70 hover:text-primary text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4">{isRTL ? "تواصل معنا" : "Contact Us"}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-sidebar-foreground/70">
                <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span dir="ltr">{phone}</span>
              </li>
              {phone2 && (
                <li className="flex items-start gap-2 text-sm text-sidebar-foreground/70">
                  <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span dir="ltr">{phone2}</span>
                </li>
              )}
              <li className="flex items-start gap-2 text-sm text-sidebar-foreground/70">
                <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>{emailAddr}</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-sidebar-foreground/70">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>{isRTL ? addressAr : addressEn}</span>
              </li>
            </ul>
          </div>

          {/* Promo Codes */}
          <div>
            <h4 className="font-bold text-white mb-4">{isRTL ? "كودات الخصم" : "Promo Codes"}</h4>
            <div className="space-y-2">
              {[
                { code: "GOODSMART", desc: isRTL ? "خصم 20%" : "20% off" },
                { code: "TP20", desc: isRTL ? "للعملاء الجدد" : "New customers" },
                { code: "VODAFONE25", desc: isRTL ? "خصم 25%" : "25% off" },
              ].map((promo) => (
                <div key={promo.code} className="flex items-center justify-between bg-sidebar-accent rounded-lg px-3 py-2">
                  <div>
                    <span className="text-primary font-mono font-bold text-sm">{promo.code}</span>
                    <p className="text-sidebar-foreground/60 text-xs">{promo.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-sidebar-border">
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-sidebar-foreground/50">
            <span>© {new Date().getFullYear()} {isRTL ? siteNameAr : siteNameEn}. {isRTL ? "جميع الحقوق محفوظة" : "All rights reserved"}</span>
            <div className="flex gap-4">
              <button
                onClick={() => toast.info(isRTL ? "قريباً" : "Coming soon")}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                {isRTL ? "سياسة الخصوصية" : "Privacy Policy"}
              </button>
              <button
                onClick={() => toast.info(isRTL ? "قريباً" : "Coming soon")}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                {isRTL ? "الشروط والأحكام" : "Terms & Conditions"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
