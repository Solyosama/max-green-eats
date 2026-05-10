import { useLang } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Tag, CheckCircle, Flame } from "lucide-react";
import { toast } from "sonner";

export default function Packages() {
  const { t, lang, isRTL } = useLang();
  const { addItem } = useCart();
  const { data: packages, isLoading } = trpc.packages.list.useQuery();

  const defaultPackages = [
    {
      id: 1,
      nameAr: "باقة الأسبوع الصحي",
      nameEn: "Healthy Week Package",
      descriptionAr: "7 وجبات صحية متنوعة لأسبوع كامل من الأكل الصحي",
      descriptionEn: "7 healthy varied meals for a full week of healthy eating",
      mealCount: 7,
      originalPrice: "350",
      discountedPrice: "280",
      imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600",
      features: [
        isRTL ? "7 وجبات متنوعة" : "7 varied meals",
        isRTL ? "توصيل مجاني" : "Free delivery",
        isRTL ? "قائمة مخصصة" : "Custom menu",
      ],
    },
    {
      id: 2,
      nameAr: "باقة العائلة",
      nameEn: "Family Package",
      descriptionAr: "10 وجبات مناسبة للعائلة مع خيارات متنوعة",
      descriptionEn: "10 family-friendly meals with varied options",
      mealCount: 10,
      originalPrice: "500",
      discountedPrice: "380",
      imageUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600",
      features: [
        isRTL ? "10 وجبات للعائلة" : "10 family meals",
        isRTL ? "توصيل مجاني" : "Free delivery",
        isRTL ? "خيارات للأطفال" : "Kids options",
        isRTL ? "خصم 24%" : "24% discount",
      ],
    },
    {
      id: 3,
      nameAr: "باقة الشهر",
      nameEn: "Monthly Package",
      descriptionAr: "30 وجبة صحية لشهر كامل بأفضل الأسعار",
      descriptionEn: "30 healthy meals for a full month at the best prices",
      mealCount: 30,
      originalPrice: "1500",
      discountedPrice: "1050",
      imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600",
      features: [
        isRTL ? "30 وجبة شهرياً" : "30 meals monthly",
        isRTL ? "توصيل مجاني يومي" : "Daily free delivery",
        isRTL ? "استشارة تغذية" : "Nutrition consultation",
        isRTL ? "خصم 30%" : "30% discount",
        isRTL ? "أولوية في الطلبات" : "Priority orders",
      ],
    },
  ];

  const displayPackages = (packages && packages.length > 0) ? packages : defaultPackages;

  const handleOrder = (pkg: any) => {
    addItem({
      id: pkg.id + 1000,
      nameAr: pkg.nameAr,
      nameEn: pkg.nameEn,
      price: Number(pkg.discountedPrice),
      imageUrl: pkg.imageUrl,
    });
    toast.success(lang === "ar" ? `تم إضافة ${pkg.nameAr} للسلة` : `${pkg.nameEn} added to cart`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary/5 border-b border-border py-10">
        <div className="container">
          <Badge variant="secondary" className="mb-2">{t.packages.title}</Badge>
          <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>{t.packages.title}</h1>
          <p className="text-muted-foreground">{t.packages.subtitle}</p>
        </div>
      </div>

      <div className="container py-12">
        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: Tag, title: isRTL ? "وفر أكثر" : "Save More", desc: isRTL ? "خصومات تصل إلى 30%" : "Discounts up to 30%", color: "text-green-600 bg-green-100" },
            { icon: CheckCircle, title: isRTL ? "توصيل مجاني" : "Free Delivery", desc: isRTL ? "توصيل مجاني لجميع الباقات" : "Free delivery for all packages", color: "text-blue-600 bg-blue-100" },
            { icon: Flame, title: isRTL ? "طازج يومياً" : "Fresh Daily", desc: isRTL ? "وجبات طازجة محضرة يومياً" : "Fresh meals prepared daily", color: "text-orange-600 bg-orange-100" },
          ].map(({ icon: Icon, title, desc, color }, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold">{title}</h4>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Packages Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse h-96 bg-muted/30" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayPackages.map((pkg: any, idx: number) => {
              const savings = Number(pkg.originalPrice) - Number(pkg.discountedPrice);
              const savingsPct = Math.round((savings / Number(pkg.originalPrice)) * 100);
              const isPopular = idx === 1;

              return (
                <Card key={pkg.id} className={`overflow-hidden hover:shadow-xl transition-all relative ${isPopular ? "border-primary ring-2 ring-primary/20 scale-[1.02]" : "border-border"}`}>
                  {isPopular && (
                    <div className="absolute top-3 start-3 z-10">
                      <Badge className="bg-primary text-white">{isRTL ? "الأكثر شعبية" : "Most Popular"}</Badge>
                    </div>
                  )}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={pkg.imageUrl || "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600"}
                      alt={lang === "ar" ? pkg.nameAr : pkg.nameEn}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 end-3 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-lg">
                      -{savingsPct}%
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
                      {lang === "ar" ? pkg.nameAr : pkg.nameEn}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {lang === "ar" ? pkg.descriptionAr : pkg.descriptionEn}
                    </p>

                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-muted-foreground line-through text-sm">
                        {Number(pkg.originalPrice).toFixed(0)} {t.common.egp}
                      </span>
                      <span className="text-xs text-red-500 font-medium">{t.packages.savings}: {savings.toFixed(0)} {t.common.egp}</span>
                    </div>
                    <div className="text-2xl font-black text-primary mb-4">
                      {Number(pkg.discountedPrice).toFixed(0)} <span className="text-base font-normal">{t.common.egp}</span>
                    </div>

                    {/* Features */}
                    {pkg.features && (
                      <ul className="space-y-1.5 mb-4">
                        {pkg.features.map((f: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <Button
                      className={`w-full gap-2 ${isPopular ? "bg-primary hover:bg-primary/90 text-white" : "border-primary text-primary hover:bg-primary hover:text-white"}`}
                      variant={isPopular ? "default" : "outline"}
                      onClick={() => handleOrder(pkg)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {t.packages.orderNow}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
