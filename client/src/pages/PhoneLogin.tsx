import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLang } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Phone, Leaf } from "lucide-react";

export default function PhoneLogin() {
  const { isRTL } = useLang();
  const [, navigate] = useLocation();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"phone" | "name">("phone");

  const loginMutation = trpc.auth.phoneLogin.useMutation({
    onSuccess: () => {
      toast.success(isRTL ? "تم تسجيل الدخول بنجاح!" : "Logged in successfully!");
      window.location.href = "/profile";
    },
    onError: (err) => toast.error(err.message),
  });

  const handleNext = () => {
    if (!phone || phone.length < 8) {
      toast.error(isRTL ? "أدخل رقم هاتف صحيح" : "Enter a valid phone number");
      return;
    }
    setStep("name");
  };

  const handleLogin = () => {
    loginMutation.mutate({ phone, name: name || undefined });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir={isRTL ? "rtl" : "ltr"}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {isRTL ? "تسجيل الدخول" : "Sign In"}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {isRTL ? "سجّل دخولك برقم هاتفك" : "Sign in with your phone number"}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "phone" ? (
            <>
              <div>
                <Label className="text-sm mb-1 block">
                  <Phone className="w-3.5 h-3.5 inline me-1" />
                  {isRTL ? "رقم الهاتف" : "Phone Number"}
                </Label>
                <Input
                  dir="ltr"
                  type="tel"
                  placeholder="+201XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNext()}
                />
              </div>
              <Button className="w-full bg-primary text-white" onClick={handleNext}>
                {isRTL ? "متابعة" : "Continue"}
              </Button>
            </>
          ) : (
            <>
              <div>
                <Label className="text-sm mb-1 block">
                  {isRTL ? "اسمك (اختياري)" : "Your Name (optional)"}
                </Label>
                <Input
                  placeholder={isRTL ? "أدخل اسمك" : "Enter your name"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              <Button
                className="w-full bg-primary text-white"
                onClick={handleLogin}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending
                  ? (isRTL ? "جاري التسجيل..." : "Signing in...")
                  : (isRTL ? "دخول" : "Sign In")}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setStep("phone")}>
                {isRTL ? "تغيير الرقم" : "Change number"}
              </Button>
            </>
          )}
          <p className="text-xs text-muted-foreground text-center">
            {isRTL
              ? "بتسجيل دخولك، أنت توافق على شروط الاستخدام"
              : "By signing in, you agree to our terms of use"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
