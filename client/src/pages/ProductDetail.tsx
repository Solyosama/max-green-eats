import { useState, useMemo } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLang } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShoppingCart,
  Star,
  ChevronLeft,
  ChevronRight,
  Flame,
  Beef,
  Wheat,
  Droplets,
  CheckCircle2,
  Leaf,
  Share2,
  Heart,
  ArrowLeft,
  ArrowRight,
  User,
  ThumbsUp,
} from "lucide-react";

// ── Star Rating Input ─────────────────────────────────────────────────────────
function StarRatingInput({
  value,
  onChange,
  size = 24,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 focus:outline-none"
          aria-label={`${star} stars`}
        >
          <Star
            style={{ width: size, height: size }}
            className={
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            }
          />
        </button>
      ))}
    </div>
  );
}

// ── Star Display ──────────────────────────────────────────────────────────────
function StarDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          style={{ width: size, height: size }}
          className={
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/20"
          }
        />
      ))}
    </div>
  );
}

// ── Nutrition Pill ────────────────────────────────────────────────────────────
function NutritionPill({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | null;
  unit: string;
  color: string;
}) {
  if (!value) return null;
  return (
    <div className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl ${color} text-center min-w-[80px]`}>
      <Icon className="w-5 h-5" />
      <span className="text-xl font-bold leading-none">{value}</span>
      <span className="text-[11px] font-medium opacity-80">{unit}</span>
      <span className="text-[10px] opacity-70">{label}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id ?? "0", 10);
  const { lang, t, isRTL } = useLang();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [reviewPage, setReviewPage] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const REVIEWS_PER_PAGE = 5;

  // ── Queries ─────────────────────────────────────────────────────────────────
  const { data: product, isLoading: productLoading } = trpc.products.byId.useQuery(
    { id: productId },
    { enabled: productId > 0 }
  );

  const { data: images } = trpc.products.images.useQuery(
    { productId },
    { enabled: productId > 0 }
  );

  const { data: reviewData, refetch: refetchReviews } = trpc.products.reviews.useQuery(
    { productId, limit: REVIEWS_PER_PAGE, offset: reviewPage * REVIEWS_PER_PAGE },
    { enabled: productId > 0 }
  );

  const { data: myReview, refetch: refetchMyReview } = trpc.products.myReview.useQuery(
    { productId },
    { enabled: isAuthenticated && productId > 0 }
  );

  const { data: relatedProducts } = trpc.products.related.useQuery(
    { productId, category: product?.category ?? "" },
    { enabled: !!product?.category }
  );

  const { data: productExtras } = trpc.products.extras.useQuery(
    { productId },
    { enabled: productId > 0 }
  );
  // ── Mutations ────────────────────────────────────────────────────────────────
  const utils = trpc.useUtils();
  const addReviewMutation = trpc.products.addReview.useMutation({
    onSuccess: (data) => {
      toast.success(
        data.updated
          ? lang === "ar" ? "تم تحديث تقييمك" : "Review updated"
          : lang === "ar" ? "تم إضافة تقييمك بنجاح!" : "Review submitted!"
      );
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewComment("");
      refetchReviews();
      refetchMyReview();
      utils.products.byId.invalidate({ id: productId });
    },
    onError: () => {
      toast.error(lang === "ar" ? "حدث خطأ، حاول مرة أخرى" : "Something went wrong");
    },
  });

  // ── Image gallery helpers ────────────────────────────────────────────────────
  const galleryImages = useMemo(() => {
    if (images && images.length > 0) return images.map((img) => img.imageUrl);
    if (product?.imageUrl) return [product.imageUrl];
    return ["https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800"];
  }, [images, product]);

  const prevImage = () => setActiveImageIdx((i) => (i === 0 ? galleryImages.length - 1 : i - 1));
  const nextImage = () => setActiveImageIdx((i) => (i === galleryImages.length - 1 ? 0 : i + 1));

  // ── Add to cart ──────────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        nameAr: product.nameAr,
        nameEn: product.nameEn,
        price: Number(product.price),
        imageUrl: product.imageUrl ?? galleryImages[0],
      });
    }
    toast.success(
      lang === "ar"
        ? `تم إضافة ${qty} ${product.nameAr} إلى السلة`
        : `${qty} × ${product.nameEn} added to cart`
    );
  };

  // ── Submit review ────────────────────────────────────────────────────────────
  const handleSubmitReview = () => {
    if (reviewRating === 0) {
      toast.error(lang === "ar" ? "الرجاء اختيار تقييم" : "Please select a rating");
      return;
    }
    addReviewMutation.mutate({ productId, rating: reviewRating, comment: reviewComment || undefined });
  };

  // ── Loading / not found ──────────────────────────────────────────────────────
  if (productLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold mb-2">{lang === "ar" ? "المنتج غير موجود" : "Product not found"}</p>
            <Link href="/menu">
              <Button className="mt-4 bg-primary text-white">
                {lang === "ar" ? "العودة للقائمة" : "Back to Menu"}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const name = lang === "ar" ? product.nameAr : product.nameEn;
  const description = lang === "ar" ? product.descriptionAr : product.descriptionEn;
  const avgRating = Number(product.rating ?? 0);
  const reviewCount = product.reviewCount ?? 0;
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-muted/30 border-b border-border">
          <div className="container py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">
                {lang === "ar" ? "الرئيسية" : "Home"}
              </Link>
              <span>/</span>
              <Link href="/menu" className="hover:text-primary transition-colors">
                {lang === "ar" ? "القائمة" : "Menu"}
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium truncate max-w-[200px]">{name}</span>
            </nav>
          </div>
        </div>

        {/* Product Section */}
        <section className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
            {/* ── Image Gallery ── */}
            <div className="space-y-4">
              {/* Main image */}
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted group shadow-lg">
                <img
                  src={galleryImages[activeImageIdx]}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800";
                  }}
                />
                {/* Nav arrows */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute start-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute end-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                  </>
                )}
                {/* Badges */}
                <div className="absolute top-3 start-3 flex flex-col gap-2">
                  {product.isFeatured && (
                    <Badge className="bg-amber-500 text-white text-xs">
                      {lang === "ar" ? "مميز" : "Featured"}
                    </Badge>
                  )}
                  {!product.isAvailable && (
                    <Badge variant="destructive" className="text-xs">
                      {lang === "ar" ? "غير متاح" : "Unavailable"}
                    </Badge>
                  )}
                </div>
                {/* Image counter */}
                {galleryImages.length > 1 && (
                  <div className="absolute bottom-3 end-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                    {activeImageIdx + 1} / {galleryImages.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        idx === activeImageIdx
                          ? "border-primary shadow-md scale-105"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Product Info ── */}
            <div className="flex flex-col gap-5">
              {/* Category badge */}
              <Badge variant="outline" className="self-start text-primary border-primary/30 bg-primary/5">
                {product.category}
              </Badge>

              {/* Name */}
              <h1 className="text-3xl xl:text-4xl font-bold text-foreground leading-tight">{name}</h1>

              {/* Rating row */}
              <div className="flex items-center gap-3 flex-wrap">
                <StarDisplay rating={avgRating} size={20} />
                <span className="text-lg font-bold text-amber-500">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">
                  ({reviewCount} {lang === "ar" ? "تقييم" : "reviews"})
                </span>
                {reviewData?.distribution && (
                  <div className="flex gap-1 items-center">
                    {[5, 4, 3].map((s) => (
                      <span key={s} className="text-xs text-muted-foreground">
                        {reviewData.distribution[s] ?? 0}×{s}★
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              {description && (
                <p className="text-muted-foreground leading-relaxed text-base">{description}</p>
              )}

              <Separator />

              {/* Price + Qty + Cart */}
              <div className="flex flex-col gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary">
                    {Number(product.price).toFixed(2)}
                  </span>
                  <span className="text-lg text-muted-foreground">
                    {lang === "ar" ? "ج.م" : "EGP"}
                  </span>
                </div>

                {product.isAvailable ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Quantity selector */}
                    <div className="flex items-center border border-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="w-10 h-10 flex items-center justify-center text-lg font-bold hover:bg-muted transition-colors"
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-semibold text-base">{qty}</span>
                      <button
                        onClick={() => setQty((q) => q + 1)}
                        className="w-10 h-10 flex items-center justify-center text-lg font-bold hover:bg-muted transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Add to cart */}
                    <Button
                      onClick={handleAddToCart}
                      className="flex-1 min-w-[160px] h-11 bg-primary hover:bg-primary/90 text-white gap-2 rounded-xl text-base font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {lang === "ar" ? "أضف إلى السلة" : "Add to Cart"}
                    </Button>

                    {/* Share */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 rounded-xl border-border"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success(lang === "ar" ? "تم نسخ الرابط" : "Link copied!");
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Badge variant="destructive" className="self-start text-sm px-4 py-2">
                    {lang === "ar" ? "غير متاح حالياً" : "Currently unavailable"}
                  </Badge>
                )}
              </div>

              <Separator />

              {/* ── Nutrition Facts ── */}
              {(product.calories || product.protein || product.carbs || product.fat) && (
                <div>
                  <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-primary" />
                    {lang === "ar" ? "القيم الغذائية" : "Nutrition Facts"}
                  </h3>
                  <div className="flex gap-3 flex-wrap">
                    <NutritionPill
                      icon={Flame}
                      label={lang === "ar" ? "سعرات" : "Calories"}
                      value={product.calories}
                      unit="kcal"
                      color="bg-orange-50 text-orange-600"
                    />
                    <NutritionPill
                      icon={Beef}
                      label={lang === "ar" ? "بروتين" : "Protein"}
                      value={product.protein ? Number(product.protein).toFixed(0) : null}
                      unit="g"
                      color="bg-red-50 text-red-600"
                    />
                    <NutritionPill
                      icon={Wheat}
                      label={lang === "ar" ? "كربوهيدرات" : "Carbs"}
                      value={product.carbs ? Number(product.carbs).toFixed(0) : null}
                      unit="g"
                      color="bg-yellow-50 text-yellow-600"
                    />
                    <NutritionPill
                      icon={Droplets}
                      label={lang === "ar" ? "دهون" : "Fat"}
                      value={product.fat ? Number(product.fat).toFixed(0) : null}
                      unit="g"
                      color="bg-blue-50 text-blue-600"
                    />
                  </div>

                  {/* Macros bar */}
                  {product.protein && product.carbs && product.fat && (() => {
                    const p = Number(product.protein);
                    const c = Number(product.carbs);
                    const f = Number(product.fat);
                    const total = p + c + f || 1;
                    return (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs text-muted-foreground font-medium">
                          {lang === "ar" ? "توزيع المغذيات" : "Macro distribution"}
                        </p>
                        {[
                          { label: lang === "ar" ? "بروتين" : "Protein", val: p, total, color: "bg-red-400" },
                          { label: lang === "ar" ? "كربوهيدرات" : "Carbs", val: c, total, color: "bg-yellow-400" },
                          { label: lang === "ar" ? "دهون" : "Fat", val: f, total, color: "bg-blue-400" },
                        ].map(({ label, val, total, color }) => (
                          <div key={label} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${color}`}
                                style={{ width: `${(val / total) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium w-8 text-end">
                              {Math.round((val / total) * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Extras / Options Section ── */}
        {productExtras && productExtras.length > 0 && (
          <section className="container py-8 border-t border-border">
            <div className="max-w-3xl">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-primary text-xl">⚙️</span>
                {lang === "ar" ? "الإضافات والخيارات" : "Extras & Options"}
              </h3>
              {(["sauce", "spice", "bread"] as const).map((type) => {
                const group = (productExtras as any[]).filter((e) => e.type === type);
                if (!group.length) return null;
                const typeLabel =
                  type === "sauce"
                    ? lang === "ar" ? "الصوصات" : "Sauces"
                    : type === "spice"
                    ? lang === "ar" ? "مستوى الحرارة" : "Spice Level"
                    : lang === "ar" ? "نوع الخبز" : "Bread Type";
                return (
                  <div key={type} className="mb-4">
                    <p className="text-sm font-semibold text-muted-foreground mb-2">{typeLabel}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.map((extra: any) => (
                        <span
                          key={extra.id}
                          className={
                            "px-3 py-1.5 rounded-full text-sm border " +
                            (extra.isDefault
                              ? "bg-primary/10 border-primary text-primary font-medium"
                              : "bg-muted border-border text-foreground")
                          }
                        >
                          {lang === "ar" ? extra.nameAr : extra.nameEn}
                          {Number(extra.price) > 0 && (
                            <span className="ms-1 text-xs text-muted-foreground">
                              (+{Number(extra.price).toFixed(0)}{" "}
                              {lang === "ar" ? "ج" : "EGP"})
                            </span>
                          )}
                          {extra.isDefault && (
                            <span className="ms-1 text-xs">
                              {lang === "ar" ? "• افتراضي" : "• default"}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
        {/* ── Reviews Section ── */}
        <section className="container py-8 border-t border-border">
          <div className="max-w-3xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                {lang === "ar" ? "تقييمات العملاء" : "Customer Reviews"}
              </h2>
              {isAuthenticated && !showReviewForm && (
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/5"
                  onClick={() => {
                    setShowReviewForm(true);
                    if (myReview) {
                      setReviewRating(myReview.rating);
                      setReviewComment(myReview.comment ?? "");
                    }
                  }}
                >
                  {myReview
                    ? lang === "ar" ? "تعديل تقييمك" : "Edit your review"
                    : lang === "ar" ? "أضف تقييمك" : "Write a review"}
                </Button>
              )}
              {!isAuthenticated && (
                <p className="text-sm text-muted-foreground">
                  {lang === "ar" ? "سجّل الدخول لإضافة تقييم" : "Sign in to write a review"}
                </p>
              )}
            </div>

            {/* Rating overview */}
            {reviewData && reviewData.total > 0 && (
              <div className="flex gap-6 items-center mb-6 p-5 bg-muted/30 rounded-2xl flex-wrap">
                <div className="text-center">
                  <div className="text-5xl font-bold text-foreground">{reviewData.avgRating.toFixed(1)}</div>
                  <StarDisplay rating={reviewData.avgRating} size={18} />
                  <div className="text-sm text-muted-foreground mt-1">
                    {reviewData.total} {lang === "ar" ? "تقييم" : "reviews"}
                  </div>
                </div>
                <div className="flex-1 min-w-[160px] space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviewData.distribution?.[star] ?? 0;
                    const pct = reviewData.total > 0 ? (count / reviewData.total) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs w-4 text-end text-muted-foreground">{star}</span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                        <Progress value={pct} className="flex-1 h-2" />
                        <span className="text-xs text-muted-foreground w-6">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Review form */}
            {showReviewForm && isAuthenticated && (
              <div className="mb-6 p-5 border border-primary/20 rounded-2xl bg-primary/5 space-y-4">
                <h3 className="font-semibold">
                  {myReview
                    ? lang === "ar" ? "تعديل تقييمك" : "Edit your review"
                    : lang === "ar" ? "أضف تقييمك" : "Write a review"}
                </h3>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {lang === "ar" ? "تقييمك:" : "Your rating:"}
                  </p>
                  <StarRatingInput value={reviewRating} onChange={setReviewRating} size={28} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {lang === "ar" ? "تعليقك (اختياري):" : "Your comment (optional):"}
                  </p>
                  <Textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder={lang === "ar" ? "شاركنا رأيك في هذا المنتج..." : "Share your thoughts about this product..."}
                    className="resize-none"
                    rows={3}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-end">
                    {reviewComment.length}/1000
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={addReviewMutation.isPending || reviewRating === 0}
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    {addReviewMutation.isPending
                      ? lang === "ar" ? "جاري الإرسال..." : "Submitting..."
                      : lang === "ar" ? "إرسال التقييم" : "Submit Review"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setShowReviewForm(false); setReviewRating(0); setReviewComment(""); }}
                  >
                    {lang === "ar" ? "إلغاء" : "Cancel"}
                  </Button>
                </div>
              </div>
            )}

            {/* Review list */}
            {reviewData && reviewData.reviews.length > 0 ? (
              <div className="space-y-4">
                {reviewData.reviews.map((review) => (
                  <div key={review.id} className="p-4 border border-border rounded-2xl hover:border-primary/20 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">
                            {review.userName ?? (lang === "ar" ? "مستخدم" : "User")}
                          </span>
                          {review.isVerified && (
                            <span className="flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              {lang === "ar" ? "شراء موثق" : "Verified"}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground ms-auto">
                            {new Date(review.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
                          </span>
                        </div>
                        <StarDisplay rating={review.rating} size={14} />
                        {review.comment && (
                          <p className="text-sm text-foreground/80 mt-1.5 leading-relaxed">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {reviewData.total > REVIEWS_PER_PAGE && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={reviewPage === 0}
                      onClick={() => setReviewPage((p) => p - 1)}
                    >
                      {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {reviewPage + 1} / {Math.ceil(reviewData.total / REVIEWS_PER_PAGE)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={(reviewPage + 1) * REVIEWS_PER_PAGE >= reviewData.total}
                      onClick={() => setReviewPage((p) => p + 1)}
                    >
                      {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <ThumbsUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">{lang === "ar" ? "لا توجد تقييمات بعد" : "No reviews yet"}</p>
                <p className="text-sm mt-1">
                  {lang === "ar" ? "كن أول من يقيّم هذا المنتج!" : "Be the first to review this product!"}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Related Products ── */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="container py-8 border-t border-border">
            <h2 className="text-2xl font-bold mb-6">
              {lang === "ar" ? "منتجات مشابهة" : "Related Products"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((rp) => (
                <Link key={rp.id} href={`/product/${rp.id}`}>
                  <div className="group border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
                    <div className="aspect-square bg-muted overflow-hidden">
                      <img
                        src={rp.imageUrl ?? "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400"}
                        alt={lang === "ar" ? rp.nameAr : rp.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400";
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm truncate">
                        {lang === "ar" ? rp.nameAr : rp.nameEn}
                      </p>
                      <p className="text-primary font-bold text-sm mt-1">
                        {Number(rp.price).toFixed(2)} {lang === "ar" ? "ج.م" : "EGP"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
