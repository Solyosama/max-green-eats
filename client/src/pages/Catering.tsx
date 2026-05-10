import { useLang } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Users, Calendar, MapPin, Phone, Mail, CheckCircle, Star,
  Utensils, Award, Clock, ChefHat
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Catering() {
  const { t, lang, isRTL } = useLang();
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    guestCount: "",
    eventDate: "",
    eventType: "",
    locationAr: "",
    locationEn: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    notes: "",
  });

  const { data: services, isLoading } = trpc.catering.services.useQuery();

  const requestMutation = trpc.catering.request.useMutation({
    onSuccess: () => {
      toast.success(t.catering.success);
      setShowForm(false);
      setForm({ guestCount: "", eventDate: "", eventType: "", locationAr: "", locationEn: "", contactName: "", contactPhone: "", contactEmail: "", notes: "" });
    },
    onError: (err) => toast.error(err.message || t.common.error),
  });

  const handleSubmit = () => {
    if (!selectedService || !form.guestCount || !form.eventDate || !form.contactName || !form.contactPhone) {
      toast.error(lang === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }
    requestMutation.mutate({
      serviceId: selectedService.id,
      guestCount: parseInt(form.guestCount),
      eventDate: form.eventDate,
      eventType: form.eventType || undefined,
      locationAr: form.locationAr || undefined,
      locationEn: form.locationEn || undefined,
      contactName: form.contactName,
      contactPhone: form.contactPhone,
      contactEmail: form.contactEmail || undefined,
      notes: form.notes || undefined,
    });
  };

  const defaultServices = [
    {
      id: 1,
      nameAr: "باقة الأفراح",
      nameEn: "Wedding Package",
      descriptionAr: "تموين احترافي لحفلات الزفاف والأفراح مع قائمة طعام صحية متنوعة",
      descriptionEn: "Professional catering for weddings with a diverse healthy menu",
      pricePerPerson: "150",
      minGuests: 50,
      maxGuests: 500,
      imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600",
    },
    {
      id: 2,
      nameAr: "باقة الاجتماعات",
      nameEn: "Corporate Package",
      descriptionAr: "خدمات تموين للاجتماعات والمؤتمرات والفعاليات الشركاتية",
      descriptionEn: "Catering services for meetings, conferences, and corporate events",
      pricePerPerson: "80",
      minGuests: 10,
      maxGuests: 200,
      imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600",
    },
    {
      id: 3,
      nameAr: "باقة الحفلات الخاصة",
      nameEn: "Private Party Package",
      descriptionAr: "تموين مميز للحفلات الخاصة والمناسبات العائلية",
      descriptionEn: "Premium catering for private parties and family occasions",
      pricePerPerson: "100",
      minGuests: 20,
      maxGuests: 150,
      imageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600",
    },
  ];

  const displayServices = (services && services.length > 0) ? services : defaultServices;

  const features = [
    { icon: ChefHat, title: isRTL ? "طهاة محترفون" : "Professional Chefs", desc: isRTL ? "فريق من أمهر الطهاة" : "Team of skilled chefs" },
    { icon: Utensils, title: isRTL ? "معدات كاملة" : "Full Equipment", desc: isRTL ? "نوفر جميع المعدات اللازمة" : "We provide all necessary equipment" },
    { icon: Clock, title: isRTL ? "في الوقت المحدد" : "On Time", desc: isRTL ? "نلتزم بالمواعيد دائماً" : "We always meet deadlines" },
    { icon: Award, title: isRTL ? "جودة مضمونة" : "Guaranteed Quality", desc: isRTL ? "أعلى معايير الجودة والنظافة" : "Highest quality and hygiene standards" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary/90 to-primary text-white py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1555244162-803834f70033?w=1200"
            alt="Catering"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="container relative">
          <Badge className="bg-white/20 text-white mb-4">{t.catering.title}</Badge>
          <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "'Cairo', sans-serif" }}>{t.catering.title}</h1>
          <p className="text-white/80 text-lg max-w-xl">{t.catering.subtitle}</p>
        </div>
      </div>

      <div className="container py-12">
        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div key={i} className="text-center p-4 bg-card border border-border rounded-xl">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-bold text-sm mb-1">{title}</h4>
              <p className="text-muted-foreground text-xs">{desc}</p>
            </div>
          ))}
        </div>

        {/* Services */}
        <div className="mb-4">
          <Badge variant="secondary" className="mb-2">{isRTL ? "باقاتنا" : "Our Packages"}</Badge>
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {isRTL ? "اختر الباقة المناسبة لمناسبتك" : "Choose the Right Package for Your Occasion"}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted" />
                <CardContent className="p-5 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {displayServices.map((service: any) => (
              <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.imageUrl || "https://images.unsplash.com/photo-1555244162-803834f70033?w=600"}
                    alt={lang === "ar" ? service.nameAr : service.nameEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 start-4 text-white">
                    <div className="text-xl font-bold">{Number(service.pricePerPerson).toFixed(0)} {t.common.egp}</div>
                    <div className="text-xs text-white/80">{t.catering.perPerson}</div>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    {lang === "ar" ? service.nameAr : service.nameEn}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {lang === "ar" ? service.descriptionAr : service.descriptionEn}
                  </p>
                  <div className="flex gap-3 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      {service.minGuests} - {service.maxGuests} {t.catering.guests}
                    </span>
                  </div>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                    onClick={() => { setSelectedService(service); setShowForm(true); }}
                  >
                    {t.catering.bookNow}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Testimonials */}
        <div className="bg-primary/5 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-center mb-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {isRTL ? "ماذا قالوا عن خدماتنا؟" : "What They Said About Our Services?"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: isRTL ? "محمد السيد" : "Mohamed El Sayed", text: isRTL ? "استخدمنا خدمة التموين لحفل زفافنا وكانت رائعة. الطعام كان لذيذاً والخدمة احترافية." : "We used the catering service for our wedding and it was amazing. The food was delicious and the service was professional.", rating: 5 },
              { name: isRTL ? "شركة التقنية المتقدمة" : "Advanced Tech Company", text: isRTL ? "نستخدم خدمات ماكس جرين لجميع اجتماعاتنا. دائماً في الوقت المحدد وبجودة عالية." : "We use Max Green services for all our meetings. Always on time and high quality.", rating: 5 },
            ].map((review, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm text-muted-foreground mb-3 italic">"{review.text}"</p>
                <span className="font-semibold text-sm">{review.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Cairo', sans-serif" }}>
              {t.catering.requestForm} - {selectedService && (lang === "ar" ? selectedService.nameAr : selectedService.nameEn)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">{t.catering.guestCount} *</Label>
                <Input
                  type="number"
                  placeholder={`${selectedService?.minGuests || 10} - ${selectedService?.maxGuests || 500}`}
                  value={form.guestCount}
                  onChange={(e) => setForm(f => ({ ...f, guestCount: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-sm">{t.catering.eventDate} *</Label>
                <Input
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => setForm(f => ({ ...f, eventDate: e.target.value }))}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
            <div>
              <Label className="text-sm">{t.catering.eventType}</Label>
              <Select value={form.eventType} onValueChange={(v) => setForm(f => ({ ...f, eventType: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? "اختر نوع الفعالية" : "Select event type"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wedding">{isRTL ? "حفل زفاف" : "Wedding"}</SelectItem>
                  <SelectItem value="corporate">{isRTL ? "فعالية شركاتية" : "Corporate Event"}</SelectItem>
                  <SelectItem value="birthday">{isRTL ? "حفل عيد ميلاد" : "Birthday Party"}</SelectItem>
                  <SelectItem value="other">{isRTL ? "أخرى" : "Other"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">{t.catering.location}</Label>
              <Input
                placeholder={isRTL ? "موقع الفعالية" : "Event location"}
                value={isRTL ? form.locationAr : form.locationEn}
                onChange={(e) => setForm(f => isRTL ? { ...f, locationAr: e.target.value } : { ...f, locationEn: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">{t.catering.contactName} *</Label>
                <Input
                  value={form.contactName}
                  onChange={(e) => setForm(f => ({ ...f, contactName: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-sm">{t.catering.contactPhone} *</Label>
                <Input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => setForm(f => ({ ...f, contactPhone: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label className="text-sm">{t.catering.contactEmail}</Label>
              <Input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm(f => ({ ...f, contactEmail: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm">{t.catering.notes}</Label>
              <Textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                className="resize-none"
              />
            </div>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white"
              onClick={handleSubmit}
              disabled={requestMutation.isPending}
            >
              {requestMutation.isPending ? (isRTL ? "جاري الإرسال..." : "Sending...") : t.catering.submit}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
