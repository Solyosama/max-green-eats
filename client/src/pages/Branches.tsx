import { useLang } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Navigation, Star, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function Branches() {
  const { t, lang, isRTL } = useLang();
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);

  const { data: branches, isLoading } = trpc.branches.list.useQuery();

  const openMap = (lat: number | null, lng: number | null, name: string) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, "_blank");
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`, "_blank");
    }
  };

  const defaultBranches = [
    {
      id: 1,
      nameAr: "فرع المعادي",
      nameEn: "Maadi Branch",
      addressAr: "شارع 9، المعادي، القاهرة",
      addressEn: "Street 9, Maadi, Cairo",
      phone: "+20 2 1234 5678",
      hoursAr: "9 صباحاً - 11 مساءً",
      hoursEn: "9 AM - 11 PM",
      lat: 29.9602,
      lng: 31.2569,
      isActive: true,
    },
    {
      id: 2,
      nameAr: "فرع الزمالك",
      nameEn: "Zamalek Branch",
      addressAr: "شارع 26 يوليو، الزمالك، القاهرة",
      addressEn: "26 July Street, Zamalek, Cairo",
      phone: "+20 2 9876 5432",
      hoursAr: "10 صباحاً - 12 منتصف الليل",
      hoursEn: "10 AM - 12 AM",
      lat: 30.0626,
      lng: 31.2194,
      isActive: true,
    },
    {
      id: 3,
      nameAr: "فرع مدينة نصر",
      nameEn: "Nasr City Branch",
      addressAr: "شارع عباس العقاد، مدينة نصر",
      addressEn: "Abbas El Akkad Street, Nasr City",
      phone: "+20 2 5555 6666",
      hoursAr: "9 صباحاً - 10 مساءً",
      hoursEn: "9 AM - 10 PM",
      lat: 30.0626,
      lng: 31.3394,
      isActive: true,
    },
    {
      id: 4,
      nameAr: "فرع التجمع الخامس",
      nameEn: "New Cairo Branch",
      addressAr: "التجمع الخامس، القاهرة الجديدة",
      addressEn: "Fifth Settlement, New Cairo",
      phone: "+20 2 7777 8888",
      hoursAr: "9 صباحاً - 11 مساءً",
      hoursEn: "9 AM - 11 PM",
      lat: 30.0071,
      lng: 31.4961,
      isActive: true,
    },
  ];

  const displayBranches = (branches && branches.length > 0) ? branches : defaultBranches;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary/5 border-b border-border py-10">
        <div className="container">
          <Badge variant="secondary" className="mb-2">{t.branches.title}</Badge>
          <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>{t.branches.title}</h1>
          <p className="text-muted-foreground">{t.branches.subtitle}</p>
        </div>
      </div>

      <div className="container py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { value: displayBranches.length.toString(), label: isRTL ? "فروع نشطة" : "Active Branches" },
            { value: "7/7", label: isRTL ? "أيام العمل" : "Days/Week" },
            { value: "30+", label: isRTL ? "دقيقة توصيل" : "Min Delivery" },
            { value: "4.9", label: isRTL ? "تقييم متوسط" : "Avg Rating" },
          ].map((stat, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Branches Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 h-48 bg-muted/30" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayBranches.map((branch: any) => (
              <Card
                key={branch.id}
                className={`overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
                  selectedBranch === branch.id ? "border-primary ring-2 ring-primary/20" : "border-border"
                }`}
                onClick={() => setSelectedBranch(branch.id === selectedBranch ? null : branch.id)}
              >
                {/* Branch Image Header */}
                <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&sig=${branch.id}`}
                    alt={lang === "ar" ? branch.nameAr : branch.nameEn}
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 start-4 text-white">
                    <h3 className="font-bold text-lg" style={{ fontFamily: "'Cairo', sans-serif" }}>
                      {lang === "ar" ? branch.nameAr : branch.nameEn}
                    </h3>
                  </div>
                  {branch.isActive && (
                    <div className="absolute top-3 end-3 flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      {isRTL ? "مفتوح" : "Open"}
                    </div>
                  )}
                </div>

                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">{lang === "ar" ? branch.addressAr : branch.addressEn}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-primary shrink-0" />
                    <span dir="ltr" className="text-foreground">{branch.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-foreground">{lang === "ar" ? branch.hoursAr : branch.hoursEn}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">4.8</span>
                    <span className="text-muted-foreground">(120+ {isRTL ? "تقييم" : "reviews"})</span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="flex-1 bg-primary hover:bg-primary/90 text-white gap-1.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        openMap(branch.lat, branch.lng, lang === "ar" ? branch.nameAr : branch.nameEn);
                      }}
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      {t.branches.getDirections}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-primary text-primary hover:bg-primary hover:text-white gap-1.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `tel:${branch.phone}`;
                      }}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {isRTL ? "اتصل بنا" : "Call Us"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Map CTA */}
        <div className="mt-10 bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
          <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {isRTL ? "ابحث عن أقرب فرع إليك" : "Find the Nearest Branch"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {isRTL ? "استخدم خرائط جوجل للعثور على أقرب فرع من موقعك" : "Use Google Maps to find the nearest branch to your location"}
          </p>
          <Button
            className="bg-primary hover:bg-primary/90 text-white gap-2"
            onClick={() => window.open("https://www.google.com/maps/search/Max+Green+Eats+Cairo", "_blank")}
          >
            <Navigation className="w-4 h-4" />
            {isRTL ? "عرض على الخريطة" : "View on Map"}
          </Button>
        </div>
      </div>
    </div>
  );
}
