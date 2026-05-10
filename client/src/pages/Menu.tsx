import { useLang } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Search, Filter, Star, Salad, Utensils, Coffee, Soup, Apple, X } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

const CATEGORIES = ["salads", "bowls", "juices", "soups", "mains", "snacks"];

const categoryIcons: Record<string, React.ReactNode> = {
  salads: <Salad className="w-4 h-4" />,
  bowls: <Utensils className="w-4 h-4" />,
  juices: <Coffee className="w-4 h-4" />,
  soups: <Soup className="w-4 h-4" />,
  mains: <Utensils className="w-4 h-4" />,
  snacks: <Apple className="w-4 h-4" />,
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`w-3 h-3 ${star <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
      ))}
    </div>
  );
}

export default function Menu() {
  const { t, lang } = useLang();
  const { addItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [maxCalories, setMaxCalories] = useState<number>(1000);
  const [maxPrice, setMaxPrice] = useState<number>(200);
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = trpc.products.list.useQuery({
    category: selectedCategory || undefined,
    search: search || undefined,
    maxCalories: maxCalories < 1000 ? maxCalories : undefined,
    maxPrice: maxPrice < 200 ? maxPrice : undefined,
    limit: 50,
  });

  const products = useMemo(() => {
    const list = data?.products || [];
    switch (sortBy) {
      case "price_low": return [...list].sort((a, b) => Number(a.price) - Number(b.price));
      case "price_high": return [...list].sort((a, b) => Number(b.price) - Number(a.price));
      case "calories": return [...list].sort((a, b) => (a.calories || 0) - (b.calories || 0));
      default: return [...list].sort((a, b) => Number(b.rating) - Number(a.rating));
    }
  }, [data, sortBy]);

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      price: Number(product.price),
      imageUrl: product.imageUrl,
      calories: product.calories,
    });
    const name = lang === "ar" ? product.nameAr : product.nameEn;
    toast.success(lang === "ar" ? `تم إضافة ${name} للسلة` : `${name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary/5 border-b border-border py-10">
        <div className="container">
          <Badge variant="secondary" className="mb-2">{t.menu.title}</Badge>
          <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>{t.menu.title}</h1>
          <p className="text-muted-foreground">{t.menu.subtitle}</p>
        </div>
      </div>

      <div className="container py-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t.menu.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t.menu.sortBy} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">{t.menu.sortPopular}</SelectItem>
              <SelectItem value="price_low">{t.menu.sortPriceLow}</SelectItem>
              <SelectItem value="price_high">{t.menu.sortPriceHigh}</SelectItem>
              <SelectItem value="calories">{t.menu.sortCalories}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`gap-2 ${showFilters ? "bg-primary text-white border-primary" : ""}`}
          >
            <Filter className="w-4 h-4" />
            {t.menu.filterByCalories}
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-card border border-border rounded-xl p-5 mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                {t.menu.filterByCalories}: {maxCalories < 1000 ? `≤ ${maxCalories}` : lang === "ar" ? "الكل" : "All"}
              </label>
              <Slider
                value={[maxCalories]}
                onValueChange={([v]) => setMaxCalories(v)}
                min={100}
                max={1000}
                step={50}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>100</span>
                <span>1000</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                {t.menu.filterByPrice}: {maxPrice < 200 ? `≤ ${maxPrice} ${t.common.egp}` : lang === "ar" ? "الكل" : "All"}
              </label>
              <Slider
                value={[maxPrice]}
                onValueChange={([v]) => setMaxPrice(v)}
                min={10}
                max={200}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>10</span>
                <span>200</span>
              </div>
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory("")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
            }`}
          >
            {t.menu.allCategories}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? "" : cat)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {categoryIcons[cat]}
              {t.menu[cat as keyof typeof t.menu] || cat}
            </button>
          ))}
          {(selectedCategory || search || maxCalories < 1000 || maxPrice < 200) && (
            <button
              onClick={() => { setSelectedCategory(""); setSearch(""); setMaxCalories(1000); setMaxPrice(200); }}
              className="flex items-center gap-1 px-3 py-2 rounded-full text-sm text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              {lang === "ar" ? "مسح الفلاتر" : "Clear Filters"}
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground mb-4">
          {lang === "ar" ? `${products.length} نتيجة` : `${products.length} results`}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
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
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{t.menu.noResults}</h3>
            <p className="text-muted-foreground text-sm">
              {lang === "ar" ? "جرب تغيير معايير البحث أو الفلاتر" : "Try changing your search criteria or filters"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) => {
              const name = lang === "ar" ? product.nameAr : product.nameEn;
              const desc = lang === "ar" ? product.descriptionAr : product.descriptionEn;
              return (
                <Card key={product.id} className="product-card overflow-hidden border border-border hover:border-primary/30 group">
                  <Link href={`/product/${product.id}`} className="block">
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={product.imageUrl || "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400"}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400"; }}
                      />
                      {product.isFeatured && (
                        <Badge className="absolute top-2 start-2 bg-primary text-white text-xs">
                          {lang === "ar" ? "مميز" : "Featured"}
                        </Badge>
                      )}
                      {product.calories && (
                        <div className="absolute bottom-2 end-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                          {product.calories} {lang === "ar" ? "سعرة" : "cal"}
                        </div>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <Link href={`/product/${product.id}`} className="block hover:text-primary transition-colors">
                      <h3 className="font-semibold text-sm mb-1">{name}</h3>
                    </Link>
                    {desc && <p className="text-muted-foreground text-xs mb-2 line-clamp-2">{desc}</p>}

                    {/* Nutrition Info */}
                    {(product.protein || product.carbs || product.fat) && (
                      <div className="flex gap-3 mb-2 text-xs">
                        {product.protein && (
                          <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            {t.menu.protein}: {Number(product.protein)}g
                          </span>
                        )}
                        {product.carbs && (
                          <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                            {t.menu.carbs}: {Number(product.carbs)}g
                          </span>
                        )}
                      </div>
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
                        onClick={() => handleAddToCart(product)}
                        className="bg-primary hover:bg-primary/90 text-white gap-1.5 text-xs"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {t.home.addToCart}
                      </Button>
                    </div>
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
