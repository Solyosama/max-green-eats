import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Check, Star, Clock, Smartphone, Copy, CheckCircle, AlertCircle, Loader2, Utensils, Flame } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

const planColors = [
  { bg: "from-emerald-500 to-green-600", border: "border-emerald-200 hover:border-emerald-400", popular: false },
  { bg: "from-primary to-green-700", border: "border-primary/40 hover:border-primary", popular: true },
  { bg: "from-green-700 to-emerald-900", border: "border-green-300 hover:border-green-500", popular: false },
];

const defaultFeatures: Record<number, { ar: string[]; en: string[] }> = {
  0: {
    ar: ["3 وجبات يومياً", "خطة غذائية مخصصة", "متابعة أسبوعية", "دعم عبر واتساب"],
    en: ["3 meals daily", "Custom nutrition plan", "Weekly follow-up", "WhatsApp support"],
  },
  1: {
    ar: ["5 وجبات يومياً", "خطة غذائية مخصصة", "متابعة يومية", "استشارة مع خبير تغذية", "تقارير أسبوعية"],
    en: ["5 meals daily", "Custom nutrition plan", "Daily follow-up", "Nutritionist consultation", "Weekly reports"],
  },
  2: {
    ar: ["6 وجبات يومياً", "خطة مخصصة بالكامل", "متابعة يومية مكثفة", "جلسات مع خبير تغذية", "تقارير تفصيلية", "أولوية في التوصيل"],
    en: ["6 meals daily", "Fully custom plan", "Intensive daily follow-up", "Nutritionist sessions", "Detailed reports", "Priority delivery"],
  },
};

export default function Nutrition() {
  const { lang } = useLang();
  const { isAuthenticated } = useAuth();
  const isRTL = lang === "ar";

  const { data: plans, isLoading } = trpc.nutrition.plans.useQuery();
  const { data: instapayData } = trpc.subscriptions.instapaySettings.useQuery();
  const subscribeMutation = trpc.subscriptions.subscribe.useMutation();

  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [instapayRef, setInstapayRef] = useState("");
  const [step, setStep] = useState<"info" | "confirm" | "success">("info");
  const [copied, setCopied] = useState(false);

  const instapayPhone = instapayData?.accountPhone ?? "+201142839399";
  const instapayName = instapayData?.accountName ?? "Max Green Eats";
  const instapayInstructions = instapayData?.instructions ?? "قم بتحويل المبلغ المطلوب عبر InstaPay إلى الرقم المحدد، ثم أدخل رقم المرجع الخاص بالتحويل لتأكيد اشتراكك.";

  const handleSubscribe = (plan: any) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setSelectedPlan(plan);
    setInstapayRef("");
    setStep("info");
    setShowDialog(true);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(instapayPhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(isRTL ? "تم نسخ رقم الهاتف" : "Phone number copied");
  };

  const handleConfirmSubscription = async () => {
    if (!selectedPlan) return;
    if (!instapayRef.trim()) {
      toast.error(isRTL ? "يرجى إدخال رقم مرجع التحويل" : "Please enter the transfer reference number");
      return;
    }
    try {
      await subscribeMutation.mutateAsync({
        planId: selectedPlan.id,
        planNameAr: selectedPlan.nameAr,
        planNameEn: selectedPlan.nameEn,
        amount: Number(selectedPlan.price),
        instapayRef: instapayRef.trim(),
      });
      setStep("success");
    } catch {
      toast.error(isRTL ? "حدث خطأ، يرجى المحاولة مرة أخرى" : "An error occurred, please try again");
    }
  };

  const displayPlans = plans && plans.length > 0 ? plans.filter((p: any) => p.isActive !== false) : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-green-50 to-emerald-50 border-b border-border py-14">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Leaf className="w-4 h-4" />
            {isRTL ? "خطط التغذية الصحية" : "Healthy Nutrition Plans"}
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {isRTL ? "اختر خطتك الغذائية" : "Choose Your Nutrition Plan"}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {isRTL
              ? "خطط غذائية مصممة خصيصاً لأهدافك الصحية، مع متابعة يومية من خبراء التغذية"
              : "Nutrition plans specially designed for your health goals, with daily follow-up from nutrition experts"}
          </p>
          {/* InstaPay badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-full text-sm mt-4">
            <Smartphone className="w-4 h-4" />
            {isRTL ? "الدفع عبر InstaPay — سريع وآمن" : "Pay via InstaPay — Fast & Secure"}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="container py-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {isRTL ? "كيف تعمل الخطة؟" : "How Does It Work?"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { step: "1", title: isRTL ? "اختر خطتك" : "Choose Your Plan", desc: isRTL ? "اختر الخطة التي تناسب أهدافك" : "Choose the plan that suits your goals", icon: Star },
              { step: "2", title: isRTL ? "ادفع عبر InstaPay" : "Pay via InstaPay", desc: isRTL ? "حوّل المبلغ وأدخل رقم المرجع" : "Transfer the amount and enter the reference", icon: Smartphone },
              { step: "3", title: isRTL ? "استلم وجباتك" : "Receive Your Meals", desc: isRTL ? "نوصل وجباتك يومياً لباب منزلك" : "We deliver your meals daily to your door", icon: Utensils },
            ].map(({ step, title, desc, icon: Icon }, i) => (
              <div key={i} className="p-6 bg-card border border-border rounded-2xl text-center">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
                  {step}
                </div>
                <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <h3 className="font-bold mb-1">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Plans Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 bg-muted rounded-t-xl" />
                <CardContent className="p-6 space-y-3">
                  <div className="h-5 bg-muted rounded w-2/3" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-10 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : displayPlans.length === 0 ? (
          <div className="text-center py-20">
            <Leaf className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{isRTL ? "لا توجد خطط متاحة حالياً" : "No plans available currently"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {displayPlans.map((plan: any, idx: number) => {
              const color = planColors[idx % planColors.length];
              const name = isRTL ? plan.nameAr : plan.nameEn;
              const desc = isRTL ? plan.descriptionAr : plan.descriptionEn;
              const features = isRTL
                ? (defaultFeatures[idx]?.ar ?? defaultFeatures[0].ar)
                : (defaultFeatures[idx]?.en ?? defaultFeatures[0].en);

              return (
                <Card
                  key={plan.id}
                  className={`relative overflow-hidden border-2 transition-all duration-300 ${color.border} ${color.popular ? "shadow-xl scale-105" : "hover:shadow-lg"}`}
                >
                  {color.popular && (
                    <div className="absolute top-0 inset-x-0 bg-primary text-white text-xs text-center py-1.5 font-semibold z-10">
                      <Star className="w-3 h-3 inline me-1" />
                      {isRTL ? "الأكثر شعبية" : "Most Popular"}
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className={`bg-gradient-to-br ${color.bg} p-6 text-white ${color.popular ? "pt-9" : ""}`}>
                    {plan.imageUrl && (
                      <img
                        src={plan.imageUrl}
                        alt={name}
                        className="w-full h-28 object-cover rounded-lg mb-4 opacity-70"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    )}
                    <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>{name}</h3>
                    {desc && <p className="text-white/80 text-sm mb-3 line-clamp-2">{desc}</p>}
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-bold">{Number(plan.price).toFixed(0)}</span>
                      <div className="mb-1">
                        <span className="text-white/80 text-sm">{isRTL ? "جنيه" : "EGP"}</span>
                        {plan.duration && (
                          <div className="flex items-center gap-1 text-white/70 text-xs">
                            <Clock className="w-3 h-3" />
                            {plan.duration} {isRTL ? "يوم" : "days"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    {/* Stats */}
                    {(plan.mealsPerDay || plan.caloriesTarget) && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {plan.mealsPerDay && (
                          <div className="text-center p-2 bg-muted/50 rounded-lg">
                            <Utensils className="w-4 h-4 text-primary mx-auto mb-1" />
                            <div className="text-xs font-bold">{plan.mealsPerDay}</div>
                            <div className="text-xs text-muted-foreground">{isRTL ? "وجبات" : "meals"}</div>
                          </div>
                        )}
                        {plan.caloriesTarget && (
                          <div className="text-center p-2 bg-muted/50 rounded-lg">
                            <Flame className="w-4 h-4 text-primary mx-auto mb-1" />
                            <div className="text-xs font-bold">{plan.caloriesTarget}</div>
                            <div className="text-xs text-muted-foreground">{isRTL ? "سعرة" : "cal"}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Features */}
                    <ul className="space-y-2 mb-5">
                      {features.map((feature: string, fi: number) => (
                        <li key={fi} className="flex items-center gap-2 text-sm text-foreground">
                          <Check className="w-4 h-4 text-primary shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* InstaPay Badge */}
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-4">
                      <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-xs text-blue-700 font-medium">
                        {isRTL ? "الدفع عبر InstaPay" : "Pay via InstaPay"}
                      </span>
                    </div>

                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                      onClick={() => handleSubscribe(plan)}
                    >
                      {isRTL ? "اشترك الآن" : "Subscribe Now"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center max-w-2xl mx-auto">
          <Leaf className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {isRTL ? "هل تحتاج خطة مخصصة؟" : "Need a Custom Plan?"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {isRTL ? "تواصل مع خبراء التغذية لدينا للحصول على خطة مصممة خصيصاً لك" : "Contact our nutrition experts for a plan designed specifically for you"}
          </p>
          <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => window.location.href = "/contact"}>
            {isRTL ? "تواصل معنا" : "Contact Us"}
          </Button>
        </div>
      </div>

      {/* InstaPay Payment Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) { setShowDialog(false); setStep("info"); } }}>
        <DialogContent className="max-w-md" dir={isRTL ? "rtl" : "ltr"}>
          {step === "info" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  {isRTL ? "الدفع عبر InstaPay" : "Pay via InstaPay"}
                </DialogTitle>
                <DialogDescription>
                  {isRTL ? `اشتراك في خطة: ${selectedPlan?.nameAr}` : `Subscribe to: ${selectedPlan?.nameEn}`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Amount */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">{isRTL ? "المبلغ المطلوب" : "Amount Due"}</p>
                  <p className="text-3xl font-bold text-primary">
                    {Number(selectedPlan?.price ?? 0).toFixed(0)}
                    <span className="text-lg font-normal ms-1">{isRTL ? "جنيه" : "EGP"}</span>
                  </p>
                </div>

                {/* InstaPay Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                  <p className="text-xs text-blue-600 font-semibold">{isRTL ? "رقم InstaPay للتحويل:" : "InstaPay Transfer Number:"}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold text-blue-800 font-mono" dir="ltr">{instapayPhone}</p>
                      <p className="text-xs text-blue-600">{instapayName}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 gap-1"
                      onClick={handleCopyPhone}
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? (isRTL ? "تم النسخ" : "Copied") : (isRTL ? "نسخ" : "Copy")}
                    </Button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">{instapayInstructions}</p>
                  </div>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => setStep("confirm")}>
                  {isRTL ? "لقد أكملت التحويل ← أدخل رقم المرجع" : "I've completed the transfer → Enter Reference"}
                </Button>
              </div>
            </>
          )}

          {step === "confirm" && (
            <>
              <DialogHeader>
                <DialogTitle>{isRTL ? "تأكيد الاشتراك" : "Confirm Subscription"}</DialogTitle>
                <DialogDescription>
                  {isRTL ? "أدخل رقم مرجع تحويل InstaPay لتأكيد اشتراكك" : "Enter your InstaPay transfer reference to confirm"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">{isRTL ? "الخطة" : "Plan"}</span>
                    <span className="font-medium">{isRTL ? selectedPlan?.nameAr : selectedPlan?.nameEn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isRTL ? "المبلغ" : "Amount"}</span>
                    <span className="font-bold text-primary">{Number(selectedPlan?.price ?? 0).toFixed(0)} {isRTL ? "جنيه" : "EGP"}</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="instapay-ref" className="text-sm font-medium mb-2 block">
                    {isRTL ? "رقم مرجع التحويل (Transaction Reference)" : "Transfer Reference Number"}
                  </Label>
                  <Input
                    id="instapay-ref"
                    placeholder={isRTL ? "مثال: TXN123456789" : "e.g. TXN123456789"}
                    value={instapayRef}
                    onChange={(e) => setInstapayRef(e.target.value)}
                    className="font-mono"
                    dir="ltr"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {isRTL ? "يمكنك العثور على رقم المرجع في تطبيق البنك الخاص بك بعد إتمام التحويل" : "Find the reference number in your banking app after completing the transfer"}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep("info")}>
                    {isRTL ? "رجوع" : "Back"}
                  </Button>
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={handleConfirmSubscription}
                    disabled={subscribeMutation.isPending || !instapayRef.trim()}
                  >
                    {subscribeMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      isRTL ? "تأكيد الاشتراك" : "Confirm Subscription"
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}

          {step === "success" && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {isRTL ? "تم استلام طلب اشتراكك!" : "Subscription Request Received!"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {isRTL
                    ? "سيتم مراجعة طلبك وتفعيل اشتراكك خلال 24 ساعة. سنتواصل معك عبر البريد الإلكتروني."
                    : "Your request will be reviewed and your subscription activated within 24 hours. We'll contact you via email."}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-sm text-start">
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">{isRTL ? "الخطة" : "Plan"}</span>
                  <span className="font-medium">{isRTL ? selectedPlan?.nameAr : selectedPlan?.nameEn}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">{isRTL ? "المبلغ" : "Amount"}</span>
                  <span className="font-bold text-primary">{Number(selectedPlan?.price ?? 0).toFixed(0)} {isRTL ? "جنيه" : "EGP"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isRTL ? "رقم المرجع" : "Reference"}</span>
                  <span className="font-mono text-xs">{instapayRef}</span>
                </div>
              </div>
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                {isRTL ? "قيد المراجعة" : "Under Review"}
              </Badge>
              <Button className="w-full" onClick={() => { setShowDialog(false); setStep("info"); }}>
                {isRTL ? "حسناً" : "OK"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
