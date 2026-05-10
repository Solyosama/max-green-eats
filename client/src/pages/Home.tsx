import { useAuth } from "@/_core/hooks/useAuth";
import { useLang } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Leaf, Star, ShoppingCart, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight,
  Truck, Award, Clock, Zap, Utensils, Salad, Coffee, Soup, Apple, Package,
  Users, TrendingUp, Heart, CheckCircle
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

// Category icons map
const categoryIcons: Record<string, React.ReactNode> = {
  salads: <Salad className="w-6 h-6" />,
  bowls: <Utensils className="w-6 h-6" />,
  juices: <Coffee className="w-6 h-6" />,
  soups: <Soup className="w-6 h-6" />,
  mains: <Utensils className="w-6 h-6" />,
  snacks: <Apple className="w-6 h-6" />,
};

const categoryColors: Record<string, string> = {
  salads: "bg-green-100 text-green-700",
  bowls: "bg-purple-100 text-purple-700",
  juices: "bg-orange-100 text-orange-700",
  soups: "bg-yellow-100 text-yellow-700",
  mains: "bg-blue-100 text-blue-700",
  snacks: "bg-pink-100 text-pink-700",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  const { t, lang } = useLang();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const name = lang === "ar" ? product.nameAr : product.nameEn;
  const desc = lang === "ar" ? product.descriptionAr : product.descriptionEn;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      price: Number(product.price),
      imageUrl: product.imageUrl,
      calories: product.calories,
    });
    toast.success(lang === "ar" ? `تم إضافة ${name} للسلة` : `${name} added to cart`);
  };

  return (
    <Card className="product-card overflow-hidden border border-border hover:border-primary/30 group">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden h-48">
          <img
            src={product.imageUrl || "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400"}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400";
            }}
          />
          {product.isFeatured && (
            <Badge className="absolute top-2 start-2 bg-primary text-white text-xs">
              {lang === "ar" ? "مميز" : "Featured"}
            </Badge>
          )}
          {product.calories && (
            <div className="absolute bottom-2 end-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              {product.calories} {t.home.calories}
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link href={`/product/${product.id}`} className="hover:text-primary transition-colors">
            <h3 className="font-semibold text-foreground text-sm leading-tight">{name}</h3>
          </Link>
          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${categoryColors[product.category] || "bg-gray-100 text-gray-700"}`}>
            {t.menu[product.category as keyof typeof t.menu] || product.category}
          </span>
        </div>
        {desc && (
          <p className="text-muted-foreground text-xs mb-2 line-clamp-2 leading-relaxed">{desc}</p>
        )}
        <div className="flex items-center gap-1 mb-3">
          <StarRating rating={Number(product.rating)} />
          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-primary font-bold text-lg">
            {Number(product.price).toFixed(0)} <span className="text-sm font-normal">{t.common.egp}</span>
          </span>
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="bg-primary hover:bg-primary/90 text-white gap-1.5 text-xs"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {t.home.addToCart}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Dynamic Promo Offers Section ───────────────────────────────────────────
const PROMO_COLORS = [
  "from-green-500 to-emerald-600",
  "from-blue-500 to-cyan-600",
  "from-red-500 to-rose-600",
  "from-purple-500 to-violet-600",
  "from-orange-500 to-amber-600",
  "from-teal-500 to-green-600",
];
function PromoOffersSection({ isRTL, t }: { isRTL: boolean; t: any }) {
  const { data: visible = [], isLoading } = trpc.promoCodes.listActive.useQuery();
  if (!isLoading && visible.length === 0) return null;
  return (
    <section className="py-14 bg-primary/5">
      <div className="container">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3">{t.home.specialOffers}</Badge>
          <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {isRTL ? "عروض وخصومات حصرية" : "Exclusive Offers & Discounts"}
          </h2>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">{[1,2,3].map(i => <div key={i} className="h-36 bg-muted animate-pulse rounded-2xl" />)}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {visible.map((c: any, i: number) => {
              const discountLabel = c.discountType === "percentage" ? `${c.discountValue}%` : `${c.discountValue} جم`;
              const desc = isRTL ? (c.descriptionAr || `خصم ${discountLabel} على طلباتك`) : (c.descriptionEn || `${discountLabel} off your order`);
              const color = PROMO_COLORS[i % PROMO_COLORS.length];
              return (
                <div key={c.id} className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 end-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative">
                    <div className="text-4xl font-black mb-1">{discountLabel}</div>
                    <div className="text-white/90 text-sm mb-4">{desc}</div>
                    {c.validUntil && <div className="text-white/70 text-xs mb-3">{isRTL ? `صالح حتى: ${new Date(c.validUntil).toLocaleDateString("ar-EG")}` : `Valid until: ${new Date(c.validUntil).toLocaleDateString()}`}</div>}
                    <div className="flex items-center gap-2">
                      <code className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg font-mono font-bold text-sm">{c.code}</code>
                      <Button size="sm" variant="secondary" className="bg-white text-foreground hover:bg-white/90 text-xs" onClick={() => { navigator.clipboard.writeText(c.code); toast.success(isRTL ? "تم نسخ الكود!" : "Code copied!"); }}>{isRTL ? "نسخ" : "Copy"}</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const { t, lang, isRTL } = useLang();
  const { isAuthenticated } = useAuth();
  const [sliderIndex, setSliderIndex] = useState(0);

  const { data: slidersData } = trpc.sliders.list.useQuery();
  const { data: featuredData } = trpc.products.list.useQuery({ featured: true, limit: 8 });
  const { data: allProductsData } = trpc.products.list.useQuery({ limit: 6 });

  const sliders = slidersData || [];
  const featuredProducts = featuredData?.products || [];
  const latestProducts = allProductsData?.products || [];

  // Auto-slide
  useEffect(() => {
    if (sliders.length <= 1) return;
    const interval = setInterval(() => {
      setSliderIndex((i) => (i + 1) % sliders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliders.length]);

  const prevSlide = () => setSliderIndex((i) => (i - 1 + sliders.length) % sliders.length);
  const nextSlide = () => setSliderIndex((i) => (i + 1) % sliders.length);

  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;
  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  const features = [
    { icon: Leaf, title: t.home.feature1Title, desc: t.home.feature1Desc, color: "text-green-600 bg-green-100" },
    { icon: Truck, title: t.home.feature2Title, desc: t.home.feature2Desc, color: "text-blue-600 bg-blue-100" },
    { icon: Award, title: t.home.feature3Title, desc: t.home.feature3Desc, color: "text-purple-600 bg-purple-100" },
    { icon: Zap, title: t.home.feature4Title, desc: t.home.feature4Desc, color: "text-orange-600 bg-orange-100" },
  ];

  const stats = [
    { value: "50K+", label: isRTL ? "عميل سعيد" : "Happy Customers", icon: Users },
    { value: "200+", label: isRTL ? "طبق صحي" : "Healthy Dishes", icon: Utensils },
    { value: "4.9", label: isRTL ? "تقييم متوسط" : "Average Rating", icon: Star },
    { value: "4", label: isRTL ? "فروع في القاهرة" : "Branches in Cairo", icon: TrendingUp },
  ];

  const testimonials = [
    {
      name: isRTL ? "أحمد محمد" : "Ahmed Mohamed",
      text: isRTL ? "أفضل طعام صحي جربته في حياتي! الجودة رائعة والتوصيل سريع جداً." : "Best healthy food I've ever tried! Amazing quality and very fast delivery.",
      rating: 5,
      avatar: "أ",
    },
    {
      name: isRTL ? "سارة علي" : "Sara Ali",
      text: isRTL ? "خطة التغذية غيرت حياتي تماماً. فقدت 8 كيلو في شهر واحد!" : "The nutrition plan completely changed my life. I lost 8 kg in one month!",
      rating: 5,
      avatar: "س",
    },
    {
      name: isRTL ? "محمد حسن" : "Mohamed Hassan",
      text: isRTL ? "استخدمت خدمة التموين لحفل زفافي وكانت رائعة. كل الضيوف أعجبهم الطعام." : "Used catering for my wedding and it was amazing. All guests loved the food.",
      rating: 5,
      avatar: "م",
    },
  ];

  const defaultSliders = [
    {
      titleAr: "أكل صحي، حياة أفضل",
      titleEn: "Healthy Food, Better Life",
      subtitleAr: "اكتشف عالماً من الأطعمة الصحية اللذيذة المحضرة بأجود المكونات الطبيعية",
      subtitleEn: "Discover a world of delicious healthy foods prepared with the finest natural ingredients",
      imageUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200",
      link: "/menu",
    },
    {
      titleAr: "خطط التغذية المخصصة",
      titleEn: "Personalized Nutrition Plans",
      subtitleAr: "خطط غذائية مصممة خصيصاً لأهدافك الصحية",
      subtitleEn: "Nutrition plans designed specifically for your health goals",
      imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200",
      link: "/nutrition",
    },
  ];

  const displaySliders = sliders.length > 0 ? sliders : defaultSliders;

  return (
    <div className="min-h-screen">
      {/* Hero Slider */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        {displaySliders.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === sliderIndex ? "opacity-100" : "opacity-0"}`}
          >
            <img
              src={(slide as any).imageUrl}
              alt={(lang === "ar" ? (slide as any).titleAr : (slide as any).titleEn)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="container">
                <div className="max-w-2xl text-white">
                  <Badge className="bg-primary/80 text-white mb-4 text-sm px-3 py-1">
                    <Leaf className="w-3.5 h-3.5 me-1.5" />
                    {isRTL ? "أكل صحي طازج" : "Fresh Healthy Food"}
                  </Badge>
                  <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    {lang === "ar" ? (slide as any).titleAr : (slide as any).titleEn}
                  </h1>
                  <p className="text-lg text-white/80 mb-8 leading-relaxed">
                    {lang === "ar" ? (slide as any).subtitleAr : (slide as any).subtitleEn}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg"
                      onClick={() => window.location.href = "/menu"}
                    >
                      {t.home.orderNow}
                      <ArrowIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white text-white hover:bg-white hover:text-foreground bg-white/10 backdrop-blur-sm"
                      onClick={() => window.location.href = "/menu"}
                    >
                      {t.home.exploreMenu}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Controls */}
        {displaySliders.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute start-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
            >
              <PrevIcon className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute end-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
            >
              <NextIcon className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {displaySliders.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSliderIndex(i)}
                  className={`h-2 rounded-full transition-all ${i === sliderIndex ? "w-8 bg-primary" : "w-2 bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Stats Bar */}
      <section className="bg-primary text-white py-6">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(({ value, label, icon: Icon }, i) => (
              <div key={i} className="flex items-center gap-3 justify-center">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{value}</div>
                  <div className="text-white/80 text-xs">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-14 bg-background">
        <div className="container">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3">{t.home.categories}</Badge>
            <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Cairo', sans-serif" }}>
              {isRTL ? "تصفح حسب الفئة" : "Browse by Category"}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {Object.entries(categoryIcons).map(([cat, icon]) => (
              <Link key={cat} href={`/menu?category=${cat}`}>
                <div className={`flex flex-col items-center gap-3 p-4 rounded-2xl cursor-pointer hover:shadow-md transition-all hover:-translate-y-1 ${categoryColors[cat] || "bg-gray-100 text-gray-700"}`}>
                  {icon}
                  <span className="text-sm font-semibold">
                    {t.menu[cat as keyof typeof t.menu] || cat}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-14 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <Badge variant="secondary" className="mb-2">{t.home.featuredProducts}</Badge>
              <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Cairo', sans-serif" }}>
                {isRTL ? "أطباقنا المميزة" : "Our Featured Dishes"}
              </h2>
            </div>
            <Button variant="outline" asChild className="border-primary text-primary hover:bg-primary hover:text-white">
              <Link href="/menu">{t.home.viewAll}</Link>
            </Button>
          </div>
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1,2,3,4].map(i => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="h-48 bg-muted" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-8 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Us */}
      <section className="py-14 bg-background">
        <div className="container">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3">{t.home.whyUs}</Badge>
            <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Cairo', sans-serif" }}>
              {isRTL ? "لماذا تختار ماكس جرين؟" : "Why Choose Max Green?"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color }, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-card border border-border hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers / Promo Codes section hidden from home page per admin request */}

      {/* Latest Products */}
      <section className="py-14 bg-background">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <Badge variant="secondary" className="mb-2">{isRTL ? "أحدث الأطباق" : "Latest Dishes"}</Badge>
              <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Cairo', sans-serif" }}>
                {isRTL ? "استكشف قائمتنا" : "Explore Our Menu"}
              </h2>
            </div>
            <Button variant="outline" asChild className="border-primary text-primary hover:bg-primary hover:text-white">
              <Link href="/menu">{t.home.viewAll}</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {latestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Services CTA */}
      <section className="py-14 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Package,
                title: isRTL ? "خطط التغذية" : "Nutrition Plans",
                desc: isRTL ? "خطط غذائية مخصصة لأهدافك الصحية" : "Customized nutrition plans for your health goals",
                href: "/nutrition",
                color: "bg-green-600",
                img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400",
              },
              {
                icon: Users,
                title: isRTL ? "خدمات التموين" : "Catering Services",
                desc: isRTL ? "تموين احترافي لجميع مناسباتك" : "Professional catering for all your occasions",
                href: "/catering",
                color: "bg-blue-600",
                img: "https://images.unsplash.com/photo-1555244162-803834f70033?w=400",
              },
              {
                icon: Heart,
                title: isRTL ? "الباقات المميزة" : "Special Packages",
                desc: isRTL ? "وفر أكثر مع باقاتنا الاقتصادية" : "Save more with our economical packages",
                href: "/packages",
                color: "bg-purple-600",
                img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
              },
            ].map(({ icon: Icon, title, desc, href, color, img }, i) => (
              <Link key={i} href={href}>
                <div className="relative rounded-2xl overflow-hidden h-52 cursor-pointer group">
                  <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-0 p-5 flex flex-col justify-end">
                    <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-2`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-lg">{title}</h3>
                    <p className="text-white/80 text-sm">{desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-14 bg-background">
        <div className="container">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3">{t.home.testimonials}</Badge>
            <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Cairo', sans-serif" }}>
              {isRTL ? "ماذا يقول عملاؤنا؟" : "What Our Customers Say?"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Card key={i} className="p-6 border border-border hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{t.name}</div>
                    <StarRating rating={t.rating} />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{t.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      {!isAuthenticated && (
        <section className="py-14 bg-primary">
          <div className="container text-center">
            <div className="max-w-2xl mx-auto text-white">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-white/80" />
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Cairo', sans-serif" }}>
                {isRTL ? "انضم إلى مجتمعنا الصحي!" : "Join Our Healthy Community!"}
              </h2>
              <p className="text-white/80 mb-6">
                {isRTL
                  ? "سجل الدخول الآن واحصل على نقاط ولاء مع كل طلب وعروض حصرية"
                  : "Login now and earn loyalty points with every order and exclusive offers"}
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 font-bold"
                onClick={() => window.location.href = getLoginUrl()}
              >
                {isRTL ? "سجل الدخول مجاناً" : "Login for Free"}
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
