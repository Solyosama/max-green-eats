import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Clock, CheckCircle, Truck, Package, XCircle, ChefHat,
  MapPin, CreditCard, Calendar, ArrowLeft, ArrowRight
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { getLoginUrl } from "@/const";

const statusConfig: Record<string, { color: string; bgColor: string; icon: React.ReactNode }> = {
  pending: { color: "text-yellow-700", bgColor: "bg-yellow-100", icon: <Clock className="w-4 h-4" /> },
  confirmed: { color: "text-blue-700", bgColor: "bg-blue-100", icon: <CheckCircle className="w-4 h-4" /> },
  preparing: { color: "text-orange-700", bgColor: "bg-orange-100", icon: <ChefHat className="w-4 h-4" /> },
  ready: { color: "text-purple-700", bgColor: "bg-purple-100", icon: <Package className="w-4 h-4" /> },
  on_the_way: { color: "text-cyan-700", bgColor: "bg-cyan-100", icon: <Truck className="w-4 h-4" /> },
  delivered: { color: "text-green-700", bgColor: "bg-green-100", icon: <CheckCircle className="w-4 h-4" /> },
  cancelled: { color: "text-red-700", bgColor: "bg-red-100", icon: <XCircle className="w-4 h-4" /> },
};

function OrderTimeline({ status }: { status: string }) {
  const { lang } = useLang();
  const steps = [
    { key: "pending", labelAr: "تم الاستلام", labelEn: "Received" },
    { key: "confirmed", labelAr: "تم التأكيد", labelEn: "Confirmed" },
    { key: "preparing", labelAr: "قيد التحضير", labelEn: "Preparing" },
    { key: "on_the_way", labelAr: "في الطريق", labelEn: "On the Way" },
    { key: "delivered", labelAr: "تم التوصيل", labelEn: "Delivered" },
  ];

  const statusOrder = ["pending", "confirmed", "preparing", "on_the_way", "delivered"];
  const currentIdx = statusOrder.indexOf(status);

  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-700 text-sm">
        <XCircle className="w-4 h-4" />
        {lang === "ar" ? "تم إلغاء الطلب" : "Order cancelled"}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-4 start-0 end-0 h-0.5 bg-border" />
        <div
          className="absolute top-4 start-0 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${Math.min((currentIdx / (steps.length - 1)) * 100, 100)}%` }}
        />
        {steps.map((step, i) => {
          const isDone = i <= currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div key={step.key} className="flex flex-col items-center gap-1 relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                isDone ? "bg-primary border-primary text-white" : "bg-background border-border text-muted-foreground"
              } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}>
                {isDone ? <CheckCircle className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
              </div>
              <span className={`text-xs font-medium text-center max-w-[60px] leading-tight ${isDone ? "text-primary" : "text-muted-foreground"}`}>
                {lang === "ar" ? step.labelAr : step.labelEn}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Orders() {
  const { t, lang, isRTL } = useLang();
  const { isAuthenticated } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data: orders, isLoading } = trpc.orders.myOrders.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const ArrowBack = isRTL ? ArrowRight : ArrowLeft;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">{t.common.loginRequired}</h2>
          <Button className="bg-primary hover:bg-primary/90 text-white mt-4" onClick={() => window.location.href = getLoginUrl()}>
            {t.nav.login}
          </Button>
        </div>
      </div>
    );
  }

  if (selectedOrder) {
    const cfg = statusConfig[selectedOrder.status] || statusConfig.pending;
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-primary/5 border-b border-border py-8">
          <div className="container">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                <ArrowBack className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>{t.orders.trackTitle}</h1>
                <p className="text-muted-foreground text-sm">{lang === "ar" ? "طلب رقم" : "Order"} #{selectedOrder.orderNumber}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="container py-8 max-w-2xl">
          {/* Status Badge */}
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${cfg.bgColor} ${cfg.color} mb-6 font-medium`}>
            {cfg.icon}
            {t.orders[selectedOrder.status as keyof typeof t.orders] || selectedOrder.status}
          </div>

          {/* Timeline */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <OrderTimeline status={selectedOrder.status} />
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">{lang === "ar" ? "تفاصيل الطلب" : "Order Details"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedOrder.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{lang === "ar" ? item.product?.nameAr : item.product?.nameEn} × {item.quantity}</span>
                  <span className="font-medium">{(Number(item.unitPrice) * item.quantity).toFixed(0)} {t.common.egp}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>{t.orders.total}</span>
                <span className="text-primary">{Number(selectedOrder.totalAmount).toFixed(0)} {t.common.egp}</span>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          {selectedOrder.deliveryAddress && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{selectedOrder.deliveryAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-primary shrink-0" />
                  <span>{selectedOrder.paymentMethod === "cash" ? (lang === "ar" ? "كاش عند الاستلام" : "Cash on Delivery") : selectedOrder.paymentMethod}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span>{new Date(selectedOrder.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary/5 border-b border-border py-10">
        <div className="container">
          <Badge variant="secondary" className="mb-2">{t.orders.title}</Badge>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>{t.orders.title}</h1>
        </div>
      </div>
      <div className="container py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-5 h-24 bg-muted/30" />
              </Card>
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t.orders.noOrders}</h3>
            <Button asChild className="bg-primary hover:bg-primary/90 text-white mt-4">
              <Link href="/menu">{lang === "ar" ? "ابدأ الطلب" : "Start Ordering"}</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {orders.map((order: any) => {
              const cfg = statusConfig[order.status] || statusConfig.pending;
              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedOrder(order)}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="font-bold text-foreground">#{order.orderNumber}</span>
                        <span className="text-muted-foreground text-sm ms-2">
                          {new Date(order.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.bgColor} ${cfg.color}`}>
                        {cfg.icon}
                        {t.orders[order.status as keyof typeof t.orders] || order.status}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {order.items?.length || 0} {lang === "ar" ? "منتج" : "items"}
                      </span>
                      <span className="font-bold text-primary">{Number(order.totalAmount).toFixed(0)} {t.common.egp}</span>
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
