import { useLang } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ShoppingCart, Trash2, Plus, Minus, Tag, MapPin, CreditCard,
  Banknote, Smartphone, CheckCircle, ArrowLeft, ArrowRight, Leaf
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function Cart() {
  const { t, lang, isRTL } = useLang();
  const { items, removeItem, updateQuantity, clearCart, subtotal, totalItems } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<string>("cart");
  const [orderId, setOrderId] = useState<number | null>(null);

  const validatePromoMutation = trpc.promoCodes.validate.useMutation({
    onSuccess: (data: any) => {
      if (data.valid) {
        setAppliedPromo({ code: promoCode, discount: data.discountValue });
        toast.success(lang === "ar" ? `تم تطبيق كود الخصم! خصم ${data.discountValue}%` : `Promo applied! ${data.discountValue}% off`);
      } else {
        toast.error(lang === "ar" ? "كود الخصم غير صحيح" : "Invalid promo code");
      }
    },
    onError: () => toast.error(lang === "ar" ? "كود الخصم غير صحيح" : "Invalid promo code"),
  });

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (data: any) => {
      setOrderId(data.orderNumber);
      setStep("success");
      clearCart();
      toast.success(lang === "ar" ? "تم تأكيد طلبك بنجاح!" : "Order confirmed successfully!");
    },
    onError: (err) => {
      toast.error(err.message || (lang === "ar" ? "حدث خطأ في الطلب" : "Order failed"));
    },
  });

  const discount = appliedPromo ? (subtotal * appliedPromo.discount) / 100 : 0;
  const delivery = subtotal > 100 ? 0 : 15;
  const total = subtotal - discount + delivery;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    if (!address.trim()) {
      toast.error(lang === "ar" ? "يرجى إدخال عنوان التوصيل" : "Please enter delivery address");
      return;
    }
    createOrderMutation.mutate({
      items: items.map((i) => ({ productId: i.id, quantity: i.quantity, unitPrice: i.price })),
      deliveryType: "delivery" as const,
      deliveryAddress: address,
      paymentMethod: paymentMethod as "cash" | "card" | "instapay",
      promoCode: appliedPromo?.code,
      notes,
    });
  };

  const ArrowBack = isRTL ? ArrowRight : ArrowLeft;

  if (step === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {lang === "ar" ? "تم تأكيد طلبك!" : "Order Confirmed!"}
          </h1>
          <p className="text-muted-foreground mb-2">
            {lang === "ar" ? `رقم الطلب: #${orderId}` : `Order #${orderId}`}
          </p>
          <p className="text-muted-foreground text-sm mb-8">
            {lang === "ar"
              ? "سيتم التواصل معك قريباً لتأكيد التوصيل. يمكنك متابعة حالة طلبك من صفحة الطلبات."
              : "We'll contact you soon to confirm delivery. You can track your order from the orders page."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-primary hover:bg-primary/90 text-white">
              <Link href="/orders">{lang === "ar" ? "متابعة الطلب" : "Track Order"}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/menu">{lang === "ar" ? "تصفح المنيو" : "Browse Menu"}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{t.cart.empty}</h1>
          <p className="text-muted-foreground mb-8">{t.cart.emptyDesc}</p>
          <Button asChild className="bg-primary hover:bg-primary/90 text-white">
            <Link href="/menu">{t.cart.continueShopping}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary/5 border-b border-border py-8">
        <div className="container">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/menu"><ArrowBack className="w-4 h-4" /></Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Cairo', sans-serif" }}>{t.cart.title}</h1>
              <p className="text-muted-foreground text-sm">{totalItems} {lang === "ar" ? "منتج" : "items"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {["cart", "checkout"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s ? "bg-primary text-white" : step === "success" || (s === "cart" && step === "checkout") ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {i + 1}
              </div>
              <span className={`text-sm font-medium ${step === s ? "text-primary" : "text-muted-foreground"}`}>
                {s === "cart" ? t.cart.title : t.cart.checkout}
              </span>
              {i === 0 && <div className="w-8 h-px bg-border mx-1" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items / Checkout Form */}
          <div className="lg:col-span-2 space-y-4">
            {step === "cart" ? (
              <>
                {items.map((item) => {
                  const name = lang === "ar" ? item.nameAr : item.nameEn;
                  return (
                    <Card key={item.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img
                            src={item.imageUrl || "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200"}
                            alt={name}
                            className="w-20 h-20 object-cover rounded-xl shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200"; }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold text-foreground text-sm">{name}</h3>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            {item.calories && (
                              <p className="text-xs text-muted-foreground mb-2">{item.calories} {lang === "ar" ? "سعرة" : "cal"}</p>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <span className="font-bold text-primary">
                                {(item.price * item.quantity).toFixed(0)} {t.common.egp}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 me-1.5" />
                  {t.cart.clearCart}
                </Button>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    {t.cart.deliveryAddress}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder={lang === "ar" ? "العنوان بالتفصيل (الشارع، المبنى، الطابق...)" : "Full address (street, building, floor...)"}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <div>
                    <Label className="text-sm font-medium mb-3 block">{t.cart.paymentMethod}</Label>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                      {[
                        { value: "cash", label: lang === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery", icon: Banknote },
                        { value: "card", label: lang === "ar" ? "بطاقة ائتمانية" : "Credit Card", icon: CreditCard },
                        { value: "instapay", label: lang === "ar" ? "محفظة إلكترونية / InstaPay" : "Digital Wallet / InstaPay", icon: Smartphone },
                      ].map(({ value, label, icon: Icon }) => (
                        <div key={value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${paymentMethod === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                          onClick={() => setPaymentMethod(value)}>
                          <RadioGroupItem value={value} id={value} />
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <Label htmlFor={value} className="cursor-pointer font-medium">{label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">{lang === "ar" ? "ملاحظات إضافية" : "Additional Notes"}</Label>
                    <Textarea
                      placeholder={lang === "ar" ? "أي تعليمات خاصة للطلب..." : "Any special instructions..."}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.cart.orderSummary}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {lang === "ar" ? item.nameAr : item.nameEn} × {item.quantity}
                    </span>
                    <span className="font-medium">{(item.price * item.quantity).toFixed(0)} {t.common.egp}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.cart.subtotal}</span>
                  <span>{subtotal.toFixed(0)} {t.common.egp}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      {appliedPromo.code} (-{appliedPromo.discount}%)
                    </span>
                    <span>-{discount.toFixed(0)} {t.common.egp}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.cart.delivery}</span>
                  <span className={delivery === 0 ? "text-green-600 font-medium" : ""}>
                    {delivery === 0 ? (lang === "ar" ? "مجاني" : "Free") : `${delivery} ${t.common.egp}`}
                  </span>
                </div>
                {subtotal <= 100 && (
                  <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
                    {lang === "ar" ? `أضف ${(100 - subtotal).toFixed(0)} ج.م للحصول على توصيل مجاني` : `Add ${(100 - subtotal).toFixed(0)} EGP for free delivery`}
                  </p>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>{t.cart.total}</span>
                  <span className="text-primary">{total.toFixed(0)} {t.common.egp}</span>
                </div>

                {/* Promo Code */}
                <div className="pt-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder={t.cart.promoCode}
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => promoCode && validatePromoMutation.mutate({ code: promoCode, orderAmount: subtotal })}
                      disabled={validatePromoMutation.isPending}
                      className="shrink-0 border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      {t.cart.apply}
                    </Button>
                  </div>
                  {appliedPromo && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      {lang === "ar" ? "تم تطبيق الكود بنجاح" : "Promo code applied"}
                    </div>
                  )}
                </div>

                {step === "cart" ? (
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-white mt-2"
                    onClick={() => setStep("checkout")}
                  >
                    {t.cart.proceedToCheckout}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                      onClick={handleCheckout}
                      disabled={createOrderMutation.isPending}
                    >
                      {createOrderMutation.isPending
                        ? (lang === "ar" ? "جاري التأكيد..." : "Confirming...")
                        : t.cart.placeOrder}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => setStep("cart")}
                    >
                      {lang === "ar" ? "العودة للسلة" : "Back to Cart"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Free Delivery Badge */}
            <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl p-3">
              <Leaf className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground">
                {lang === "ar" ? "توصيل مجاني للطلبات فوق 100 ج.م" : "Free delivery on orders over 100 EGP"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
