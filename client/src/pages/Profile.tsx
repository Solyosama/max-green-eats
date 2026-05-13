import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { User, Star, ShoppingBag, Leaf, MapPin, Phone, Edit, Save, X } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Profile() {
  const { isRTL } = useLang();
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: profile } = trpc.profile.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: loyalty } = trpc.profile.loyaltyPoints.useQuery(undefined, { enabled: isAuthenticated });
  const { data: loyaltyHistory } = trpc.profile.loyaltyHistory.useQuery(undefined, { enabled: isAuthenticated });
  const { data: orders } = trpc.profile.myOrders.useQuery(undefined, { enabled: isAuthenticated });
  const { data: subscriptions } = trpc.profile.mySubscriptions.useQuery(undefined, { enabled: isAuthenticated });

  const updateMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success(isRTL ? "تم تحديث الملف الشخصي" : "Profile updated");
      utils.profile.get.invalidate();
      setEditing(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  const openEdit = () => {
    setForm({ name: profile?.name ?? "", phone: profile?.phone ?? "", address: (profile as any)?.address ?? "" });
    setEditing(true);
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    preparing: "bg-orange-100 text-orange-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const subStatusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    active: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    expired: "bg-gray-100 text-gray-600",
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {isRTL ? "سجّل دخولك أولاً" : "Please sign in first"}
          </h2>
          <Button className="bg-primary text-white" asChild>
            <Link href="/phone-login">{isRTL ? "تسجيل الدخول" : "Sign In"}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <div className="bg-primary/5 border-b border-border py-6">
        <div className="container">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {isRTL ? "حسابي" : "My Account"}
          </h1>
        </div>
      </div>

      <div className="container py-6">
        <Tabs defaultValue="profile">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="profile" className="gap-1.5 text-xs"><User className="w-3.5 h-3.5" />{isRTL ? "الملف الشخصي" : "Profile"}</TabsTrigger>
            <TabsTrigger value="loyalty" className="gap-1.5 text-xs"><Star className="w-3.5 h-3.5" />{isRTL ? "نقاط الولاء" : "Loyalty Points"}</TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5 text-xs"><ShoppingBag className="w-3.5 h-3.5" />{isRTL ? "طلباتي" : "My Orders"}</TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-1.5 text-xs"><Leaf className="w-3.5 h-3.5" />{isRTL ? "اشتراكاتي" : "Subscriptions"}</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    {isRTL ? "المعلومات الشخصية" : "Personal Information"}
                  </CardTitle>
                  {!editing && (
                    <Button size="sm" variant="outline" onClick={openEdit} className="gap-1">
                      <Edit className="w-3.5 h-3.5" />{isRTL ? "تعديل" : "Edit"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editing ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm mb-1 block">{isRTL ? "الاسم" : "Name"}</Label>
                      <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-sm mb-1 block"><Phone className="w-3 h-3 inline me-1" />{isRTL ? "رقم الهاتف" : "Phone"}</Label>
                      <Input dir="ltr" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-sm mb-1 block"><MapPin className="w-3 h-3 inline me-1" />{isRTL ? "العنوان المسجل" : "Saved Address"}</Label>
                      <Input value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} placeholder={isRTL ? "أدخل عنوانك" : "Enter your address"} />
                    </div>
                    <div className="flex gap-2">
                      <Button className="bg-primary text-white gap-1" onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending}>
                        <Save className="w-3.5 h-3.5" />{isRTL ? "حفظ" : "Save"}
                      </Button>
                      <Button variant="outline" onClick={() => setEditing(false)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">{isRTL ? "الاسم" : "Name"}</div>
                        <div className="font-medium text-sm">{profile?.name || (isRTL ? "غير محدد" : "Not set")}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">{isRTL ? "رقم الهاتف" : "Phone"}</div>
                        <div className="font-medium text-sm" dir="ltr">{profile?.phone || "—"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">{isRTL ? "العنوان المسجل" : "Saved Address"}</div>
                        <div className="font-medium text-sm">{(profile as any)?.address || (isRTL ? "لم يتم إضافة عنوان بعد" : "No address added yet")}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Badge variant={user?.role === "admin" ? "default" : "secondary"} className="text-xs">{user?.role}</Badge>
                      <div className="text-xs text-muted-foreground">{isRTL ? "نوع الحساب" : "Account Type"}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loyalty Tab */}
          <TabsContent value="loyalty">
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-10 h-10 text-yellow-500" />
                  </div>
                  <div className="text-4xl font-black text-primary mb-1">{loyalty?.points ?? 0}</div>
                  <div className="text-muted-foreground text-sm">{isRTL ? "نقطة متاحة" : "Available Points"}</div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    {isRTL ? `إجمالي المكتسبة: ${loyalty?.totalEarned ?? 0} نقطة` : `Total earned: ${loyalty?.totalEarned ?? 0} points`}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">{isRTL ? "سجل النقاط" : "Points History"}</CardTitle></CardHeader>
                <CardContent>
                  {!loyaltyHistory?.length ? (
                    <p className="text-center text-muted-foreground text-sm py-4">{isRTL ? "لا يوجد سجل بعد" : "No history yet"}</p>
                  ) : (
                    <div className="space-y-2">
                      {loyaltyHistory.map((h: any) => (
                        <div key={h.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div>
                            <div className="text-sm font-medium">{h.description}</div>
                            <div className="text-xs text-muted-foreground">{new Date(h.createdAt).toLocaleDateString(isRTL ? "ar-EG" : "en-US")}</div>
                          </div>
                          <span className={`font-bold text-sm ${h.type === "earned" ? "text-green-600" : "text-red-600"}`}>
                            {h.type === "earned" ? "+" : "-"}{h.points}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader><CardTitle className="text-sm">{isRTL ? "طلباتي" : "My Orders"}</CardTitle></CardHeader>
              <CardContent>
                {!orders?.length ? (
                  <p className="text-center text-muted-foreground text-sm py-8">{isRTL ? "لا توجد طلبات بعد" : "No orders yet"}</p>
                ) : (
                  <div className="space-y-3">
                    {orders.map((o: any) => (
                      <div key={o.id} className="flex items-center justify-between p-4 border border-border rounded-xl">
                        <div>
                          <div className="font-bold text-sm">#{o.orderNumber}</div>
                          <div className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString(isRTL ? "ar-EG" : "en-US")}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary text-sm">{Number(o.totalAmount).toFixed(0)} {isRTL ? "ج.م" : "EGP"}</div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[o.status] ?? "bg-gray-100 text-gray-700"}`}>{o.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <Card>
              <CardHeader><CardTitle className="text-sm">{isRTL ? "اشتراكاتي في خطط التغذية" : "My Nutrition Subscriptions"}</CardTitle></CardHeader>
              <CardContent>
                {!subscriptions?.length ? (
                  <div className="text-center py-8">
                    <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm mb-3">{isRTL ? "لا توجد اشتراكات بعد" : "No subscriptions yet"}</p>
                    <Button asChild className="bg-primary text-white"><Link href="/nutrition">{isRTL ? "استعرض الخطط" : "Browse Plans"}</Link></Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subscriptions.map((s: any) => (
                      <div key={s.id} className="p-4 border border-border rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-sm">{isRTL ? s.planNameAr : s.planNameEn}</div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${subStatusColors[s.status] ?? ""}`}>{s.status}</span>
                        </div>
                        <div className="text-primary font-bold">{Number(s.amount).toFixed(0)} {isRTL ? "ج.م" : "EGP"}</div>
                        <div className="text-xs text-muted-foreground mt-1">{new Date(s.createdAt).toLocaleDateString(isRTL ? "ar-EG" : "en-US")}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
