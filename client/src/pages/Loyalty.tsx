import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Gift, TrendingUp, Award, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Loyalty() {
  const { t, lang, isRTL } = useLang();
  const { isAuthenticated } = useAuth();

  const { data: points, isLoading: loadingPoints } = trpc.loyalty.myPoints.useQuery(undefined, { enabled: isAuthenticated });
  const { data: history, isLoading: loadingHistory } = trpc.loyalty.myHistory.useQuery(undefined, { enabled: isAuthenticated });

  const currentPoints = points?.points || 0;
  const totalEarned = points?.totalEarned || 0;
  const totalRedeemed = points?.totalRedeemed || 0;

  const nextRewardAt = Math.ceil(currentPoints / 100) * 100;
  const progressToNext = ((currentPoints % 100) / 100) * 100;

  const tiers = [
    { name: isRTL ? "برونزي" : "Bronze", min: 0, max: 499, color: "text-amber-700 bg-amber-100", icon: "🥉" },
    { name: isRTL ? "فضي" : "Silver", min: 500, max: 1499, color: "text-slate-600 bg-slate-100", icon: "🥈" },
    { name: isRTL ? "ذهبي" : "Gold", min: 1500, max: 4999, color: "text-yellow-600 bg-yellow-100", icon: "🥇" },
    { name: isRTL ? "بلاتيني" : "Platinum", min: 5000, max: Infinity, color: "text-purple-600 bg-purple-100", icon: "💎" },
  ];

  const currentTier = tiers.find(t => currentPoints >= t.min && currentPoints <= t.max) || tiers[0];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Cairo', sans-serif" }}>{t.loyalty.title}</h2>
          <p className="text-muted-foreground mb-6">{t.loyalty.subtitle}</p>
          <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => window.location.href = getLoginUrl()}>
            {t.nav.login}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary to-primary/80 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 start-10 text-6xl">⭐</div>
          <div className="absolute top-8 end-20 text-4xl">🎁</div>
          <div className="absolute bottom-4 start-1/3 text-5xl">🏆</div>
        </div>
        <div className="container relative">
          <Badge className="bg-white/20 text-white mb-4">{t.loyalty.title}</Badge>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>{t.loyalty.title}</h1>
          <p className="text-white/80">{t.loyalty.subtitle}</p>
        </div>
      </div>

      <div className="container py-10">
        {loadingPoints ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => <Card key={i} className="animate-pulse h-32 bg-muted/30" />)}
          </div>
        ) : (
          <>
            {/* Points Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Star className="w-8 h-8 text-white/80" />
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentTier.color}`}>{currentTier.icon} {currentTier.name}</span>
                  </div>
                  <div className="text-4xl font-black mb-1">{currentPoints.toLocaleString()}</div>
                  <div className="text-white/80 text-sm">{t.loyalty.yourPoints}</div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-white/70 mb-1">
                      <span>{currentPoints % 100} / 100 {isRTL ? "نقطة للمكافأة التالية" : "pts to next reward"}</span>
                    </div>
                    <Progress value={progressToNext} className="h-2 bg-white/30" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <TrendingUp className="w-8 h-8 text-green-500 mb-2" />
                  <div className="text-3xl font-black text-green-600 mb-1">{totalEarned.toLocaleString()}</div>
                  <div className="text-muted-foreground text-sm">{t.loyalty.totalEarned}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Gift className="w-8 h-8 text-purple-500 mb-2" />
                  <div className="text-3xl font-black text-purple-600 mb-1">{totalRedeemed.toLocaleString()}</div>
                  <div className="text-muted-foreground text-sm">{t.loyalty.totalRedeemed}</div>
                </CardContent>
              </Card>
            </div>

            {/* Tiers */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  {isRTL ? "مستويات العضوية" : "Membership Tiers"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {tiers.map((tier) => (
                    <div key={tier.name} className={`p-4 rounded-xl border-2 text-center ${currentTier.name === tier.name ? "border-primary" : "border-border"}`}>
                      <div className="text-3xl mb-2">{tier.icon}</div>
                      <div className={`font-bold text-sm px-2 py-0.5 rounded-full inline-block mb-2 ${tier.color}`}>{tier.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {tier.max === Infinity ? `${tier.min.toLocaleString()}+` : `${tier.min.toLocaleString()} - ${tier.max.toLocaleString()}`}
                      </div>
                      {currentTier.name === tier.name && (
                        <div className="mt-2 flex items-center justify-center gap-1 text-xs text-primary font-medium">
                          <CheckCircle className="w-3 h-3" />
                          {isRTL ? "مستواك الحالي" : "Your Level"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* How it works */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{t.loyalty.howItWorks}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: "🛒", rule: t.loyalty.rule1 },
                    { icon: "🎁", rule: t.loyalty.rule2 },
                    { icon: "⏰", rule: t.loyalty.rule3 },
                  ].map(({ icon, rule }, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
                      <span className="text-2xl">{icon}</span>
                      <p className="text-sm text-foreground">{rule}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle>{t.loyalty.history}</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted/30 rounded animate-pulse" />)}
              </div>
            ) : !history || history.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>{isRTL ? "لا يوجد سجل نقاط بعد. ابدأ بالطلب لتكسب نقاطك!" : "No points history yet. Start ordering to earn points!"}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry: any) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        entry.type === "earned" ? "bg-green-100 text-green-600" :
                        entry.type === "redeemed" ? "bg-purple-100 text-purple-600" :
                        "bg-red-100 text-red-600"
                      }`}>
                        {entry.type === "earned" ? "+" : entry.type === "redeemed" ? "🎁" : "✕"}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{entry.description || (lang === "ar" ? "معاملة نقاط" : "Points transaction")}</div>
                        <div className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}</div>
                      </div>
                    </div>
                    <div className={`font-bold ${entry.type === "earned" ? "text-green-600" : "text-red-500"}`}>
                      {entry.type === "earned" ? "+" : "-"}{entry.points}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
