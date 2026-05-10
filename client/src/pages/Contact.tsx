import { useLang } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Mail, MapPin, MessageSquare, AlertCircle, Lightbulb, Star, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="transition-transform hover:scale-110"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              star <= (hovered || value) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function Contact() {
  const { t, lang, isRTL } = useLang();
  const [activeTab, setActiveTab] = useState("feedback");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    orderId: "",
    rating: 0,
  });

  const submitMutation = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success(t.contact.success);
      setForm({ name: "", email: "", phone: "", subject: "", message: "", orderId: "", rating: 0 });
    },
    onError: (err) => toast.error(err.message || t.common.error),
  });

  const handleSubmit = () => {
    if (!form.message.trim() || form.message.length < 10) {
      toast.error(lang === "ar" ? "يرجى كتابة رسالة (10 أحرف على الأقل)" : "Please write a message (at least 10 characters)");
      return;
    }
    submitMutation.mutate({
      name: form.name || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      type: activeTab as "feedback" | "complaint" | "suggestion",
      orderId: form.orderId ? parseInt(form.orderId) : undefined,
      subject: form.subject || undefined,
      message: form.message,
      rating: form.rating || undefined,
    });
  };

  const contactInfo = [
    { icon: Phone, label: isRTL ? "اتصل بنا" : "Call Us", value: "+20 2 1234 5678", href: "tel:+20212345678" },
    { icon: Mail, label: isRTL ? "راسلنا" : "Email Us", value: "info@maxgreeneats.com", href: "mailto:info@maxgreeneats.com" },
    { icon: MapPin, label: isRTL ? "موقعنا" : "Location", value: isRTL ? "القاهرة، مصر" : "Cairo, Egypt", href: "https://maps.google.com" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary/5 border-b border-border py-10">
        <div className="container">
          <Badge variant="secondary" className="mb-2">{t.contact.title}</Badge>
          <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>{t.contact.title}</h1>
          <p className="text-muted-foreground">{t.contact.subtitle}</p>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            {contactInfo.map(({ icon: Icon, label, value, href }, i) => (
              <a key={i} href={href} target={href.startsWith("http") ? "_blank" : undefined}
                className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors group">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5 text-primary group-hover:text-white" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="font-medium text-foreground">{value}</div>
                </div>
              </a>
            ))}

            {/* Social Media */}
            <div className="p-4 bg-card border border-border rounded-xl">
              <h4 className="font-bold mb-3 text-sm">{isRTL ? "تابعنا على" : "Follow Us On"}</h4>
              <div className="flex gap-3">
                {[
                  { name: "Facebook", color: "bg-blue-600", icon: "f", href: "https://facebook.com" },
                  { name: "Instagram", color: "bg-pink-600", icon: "📷", href: "https://instagram.com" },
                  { name: "Twitter", color: "bg-sky-500", icon: "𝕏", href: "https://twitter.com" },
                  { name: "WhatsApp", color: "bg-green-500", icon: "W", href: "https://wa.me/201234567890" },
                ].map(({ name, color, icon, href }) => (
                  <a key={name} href={href} target="_blank" rel="noopener noreferrer"
                    className={`w-10 h-10 ${color} text-white rounded-xl flex items-center justify-center text-sm font-bold hover:opacity-80 transition-opacity`}
                    title={name}>
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Working Hours */}
            <div className="p-4 bg-card border border-border rounded-xl">
              <h4 className="font-bold mb-3 text-sm">{isRTL ? "ساعات العمل" : "Working Hours"}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isRTL ? "السبت - الخميس" : "Sat - Thu"}</span>
                  <span className="font-medium">{isRTL ? "9ص - 11م" : "9AM - 11PM"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isRTL ? "الجمعة" : "Friday"}</span>
                  <span className="font-medium">{isRTL ? "12م - 11م" : "12PM - 11PM"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <Card>
                <CardContent className="p-10 text-center">
                  <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    {isRTL ? "تم الإرسال بنجاح!" : "Sent Successfully!"}
                  </h3>
                  <p className="text-muted-foreground mb-6">{t.contact.success}</p>
                  <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => setSubmitted(false)}>
                    {isRTL ? "إرسال رسالة أخرى" : "Send Another Message"}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full mb-6 grid grid-cols-3">
                      <TabsTrigger value="feedback" className="gap-1.5 text-xs">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {t.contact.feedback}
                      </TabsTrigger>
                      <TabsTrigger value="complaint" className="gap-1.5 text-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {t.contact.complaint}
                      </TabsTrigger>
                      <TabsTrigger value="suggestion" className="gap-1.5 text-xs">
                        <Lightbulb className="w-3.5 h-3.5" />
                        {t.contact.suggestion}
                      </TabsTrigger>
                    </TabsList>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm">{t.contact.name}</Label>
                          <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div>
                          <Label className="text-sm">{t.contact.phone}</Label>
                          <Input type="tel" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">{t.contact.email}</Label>
                        <Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
                      </div>
                      <div>
                        <Label className="text-sm">{t.contact.subject}</Label>
                        <Input value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))} />
                      </div>

                      {activeTab === "complaint" && (
                        <div>
                          <Label className="text-sm">{t.contact.orderId}</Label>
                          <Input
                            type="number"
                            placeholder={isRTL ? "رقم الطلب (اختياري)" : "Order number (optional)"}
                            value={form.orderId}
                            onChange={(e) => setForm(f => ({ ...f, orderId: e.target.value }))}
                          />
                        </div>
                      )}

                      {activeTab === "feedback" && (
                        <div>
                          <Label className="text-sm mb-2 block">{t.contact.rating}</Label>
                          <StarRating value={form.rating} onChange={(v) => setForm(f => ({ ...f, rating: v }))} />
                        </div>
                      )}

                      <div>
                        <Label className="text-sm">{t.contact.message} *</Label>
                        <Textarea
                          rows={5}
                          value={form.message}
                          onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                          className="resize-none"
                          placeholder={isRTL ? "اكتب رسالتك هنا..." : "Write your message here..."}
                        />
                        <div className="text-xs text-muted-foreground mt-1">{form.message.length}/500</div>
                      </div>

                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-white"
                        onClick={handleSubmit}
                        disabled={submitMutation.isPending}
                      >
                        {submitMutation.isPending ? (isRTL ? "جاري الإرسال..." : "Sending...") : t.contact.submit}
                      </Button>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
