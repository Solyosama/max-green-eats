import React, { useRef, useEffect } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  LayoutDashboard, Package, ShoppingCart, Users, ChefHat,
  MessageSquare, DollarSign, Plus, Edit, Trash2,
  CheckCircle, XCircle, AlertCircle, Smartphone, Leaf, Save, Settings,
  Image, Boxes, Truck, Globe, Palette, Phone, Mail, MapPin,
  Upload, Tag, Building2, Calendar, Eye, EyeOff, Percent, Hash, Clock, MapPinned
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

// ─── Subscriptions Panel ─────────────────────────────────────────────────────
function SubscriptionsPanel({ isRTL, isAuthenticated, userRole }: { isRTL: boolean; isAuthenticated: boolean; userRole?: string }) {
  const utils = trpc.useUtils();
  const { data: subsData, isLoading } = trpc.admin.subscriptions.useQuery(
    { limit: 100 },
    { enabled: isAuthenticated && userRole === "admin" }
  );
  const { data: instapayData } = trpc.admin.getInstapaySettings.useQuery(
    undefined,
    { enabled: isAuthenticated && userRole === "admin" }
  );
  const updateSubMutation = trpc.admin.updateSubscription.useMutation({
    onSuccess: () => { toast.success(isRTL ? "تم تحديث الاشتراك" : "Subscription updated"); utils.admin.subscriptions.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const updateInstapayMutation = trpc.admin.updateInstapaySettings.useMutation({
    onSuccess: () => toast.success(isRTL ? "تم حفظ إعدادات InstaPay" : "InstaPay settings saved"),
    onError: (err) => toast.error(err.message),
  });
  const [instapayForm, setInstapayForm] = useState({ accountPhone: "", accountName: "", instructions: "" });
  const [instapayLoaded, setInstapayLoaded] = useState(false);

  if (instapayData && !instapayLoaded) {
    setInstapayForm({ accountPhone: instapayData.accountPhone ?? "", accountName: instapayData.accountName ?? "", instructions: instapayData.instructions ?? "" });
    setInstapayLoaded(true);
  }

  const subStatusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    active: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    expired: "bg-gray-100 text-gray-600",
  };
  const subStatusLabels: Record<string, { ar: string; en: string }> = {
    pending: { ar: "قيد المراجعة", en: "Pending" },
    active: { ar: "نشط", en: "Active" },
    cancelled: { ar: "ملغي", en: "Cancelled" },
    expired: { ar: "منتهي", en: "Expired" },
  };

  return (
    <div className="space-y-6">
      {/* InstaPay Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-600" />
            {isRTL ? "إعدادات InstaPay" : "InstaPay Settings"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-sm mb-1 block">{isRTL ? "رقم الهاتف" : "Phone Number"}</Label>
              <Input dir="ltr" value={instapayForm.accountPhone} onChange={(e) => setInstapayForm(f => ({ ...f, accountPhone: e.target.value }))} placeholder="+201142839399" />
            </div>
            <div>
              <Label className="text-sm mb-1 block">{isRTL ? "اسم الحساب" : "Account Name"}</Label>
              <Input value={instapayForm.accountName} onChange={(e) => setInstapayForm(f => ({ ...f, accountName: e.target.value }))} />
            </div>
          </div>
          <div className="mb-4">
            <Label className="text-sm mb-1 block">{isRTL ? "تعليمات الدفع" : "Payment Instructions"}</Label>
            <textarea
              className="w-full border border-border rounded-lg p-3 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              rows={3}
              value={instapayForm.instructions}
              onChange={(e) => setInstapayForm(f => ({ ...f, instructions: e.target.value }))}
            />
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 text-white gap-2"
            onClick={() => updateInstapayMutation.mutate(instapayForm)}
            disabled={updateInstapayMutation.isPending}
          >
            <Save className="w-4 h-4" />
            {isRTL ? "حفظ الإعدادات" : "Save Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isRTL ? `الاشتراكات (${subsData?.total ?? 0})` : `Subscriptions (${subsData?.total ?? 0})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}</div>
          ) : !subsData?.subscriptions?.length ? (
            <p className="text-muted-foreground text-sm text-center py-8">{isRTL ? "لا توجد اشتراكات بعد" : "No subscriptions yet"}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? "المستخدم" : "User"}</TableHead>
                    <TableHead>{isRTL ? "الخطة" : "Plan"}</TableHead>
                    <TableHead>{isRTL ? "المبلغ" : "Amount"}</TableHead>
                    <TableHead>{isRTL ? "رقم المرجع" : "Reference"}</TableHead>
                    <TableHead>{isRTL ? "الحالة" : "Status"}</TableHead>
                    <TableHead>{isRTL ? "التاريخ" : "Date"}</TableHead>
                    <TableHead>{isRTL ? "إجراء" : "Action"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subsData.subscriptions.map((sub: any) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div className="text-sm font-medium">{sub.userName ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{sub.userEmail ?? ""}</div>
                      </TableCell>
                      <TableCell className="text-sm">{isRTL ? sub.planNameAr : sub.planNameEn}</TableCell>
                      <TableCell className="font-bold text-primary">{Number(sub.amount).toFixed(0)} {isRTL ? "ج.م" : "EGP"}</TableCell>
                      <TableCell><span className="font-mono text-xs">{sub.instapayRef ?? "—"}</span></TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${subStatusColors[sub.status] ?? ""}`}>
                          {isRTL ? subStatusLabels[sub.status]?.ar : subStatusLabels[sub.status]?.en}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(sub.createdAt).toLocaleDateString(isRTL ? "ar-EG" : "en-US")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {sub.status === "pending" && (
                            <>
                              <Button size="sm" className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white text-xs"
                                onClick={() => updateSubMutation.mutate({ id: sub.id, status: "active" })}>
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 px-2 border-red-300 text-red-600 hover:bg-red-50 text-xs"
                                onClick={() => updateSubMutation.mutate({ id: sub.id, status: "cancelled" })}>
                                <XCircle className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                          {sub.status === "active" && (
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs"
                              onClick={() => updateSubMutation.mutate({ id: sub.id, status: "expired" })}>
                              {isRTL ? "إنهاء" : "Expire"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
// ─── Image Uploader Component ────────────────────────────────────────────────────
function ImageUploader({ value, onChange, isRTL, folder = "uploads" }: { value: string; onChange: (url: string) => void; isRTL: boolean; folder?: string }) {
  const uploadMutation = trpc.upload.image.useMutation({
    onSuccess: (data) => { onChange(data.url); toast.success(isRTL ? "تم رفع الصورة" : "Image uploaded"); },
    onError: (err) => toast.error(err.message),
  });
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error(isRTL ? "الصورة أكبر من 5MB" : "Image must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1];
      const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      uploadMutation.mutate({ base64, filename, mimeType: file.type, folder });
    };
    reader.readAsDataURL(file);
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <label className="flex-1 cursor-pointer">
          <div className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors">
            <Upload className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{uploadMutation.isPending ? (isRTL ? "جاري الرفع..." : "Uploading...") : (isRTL ? "اختر صورة" : "Choose image")}</span>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploadMutation.isPending} />
        </label>
        {value && <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")} className="text-destructive h-8 px-2"><Trash2 className="w-3.5 h-3.5" /></Button>}
      </div>
      {value && <img src={value} alt="" className="w-full max-h-32 object-cover rounded-lg border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
    </div>
  );
}

// ─── Promo Codes Management Panel ────────────────────────────────────────────────────
function PromoCodesMgmtPanel({ isRTL }: { isRTL: boolean }) {
  const utils = trpc.useUtils();
  const { data: codes, isLoading } = trpc.promoCodes.all.useQuery();
  const createMutation = trpc.promoCodes.create.useMutation({
    onSuccess: () => { toast.success(isRTL ? "تم إضافة كود الخصم" : "Promo code created"); utils.promoCodes.all.invalidate(); setShowForm(false); resetForm(); },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.promoCodes.update.useMutation({
    onSuccess: () => { toast.success(isRTL ? "تم تحديث كود الخصم" : "Promo code updated"); utils.promoCodes.all.invalidate(); setEditingId(null); setShowForm(false); resetForm(); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.promoCodes.delete.useMutation({
    onSuccess: () => { toast.success(isRTL ? "تم حذف كود الخصم" : "Promo code deleted"); utils.promoCodes.all.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const emptyForm = { code: "", descriptionAr: "", descriptionEn: "", discountType: "percentage" as "percentage" | "fixed", discountValue: "", minOrderAmount: "", maxUsageCount: "", validFrom: new Date().toISOString().slice(0, 10), validUntil: "", isActive: true, showOnHome: true };
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const resetForm = () => setForm(emptyForm);
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const handleEdit = (c: any) => {
    setEditingId(c.id);
    setForm({ code: c.code, descriptionAr: c.descriptionAr ?? "", descriptionEn: c.descriptionEn ?? "", discountType: c.discountType, discountValue: String(c.discountValue), minOrderAmount: c.minOrderAmount ? String(c.minOrderAmount) : "", maxUsageCount: c.maxUsageCount ? String(c.maxUsageCount) : "", validFrom: c.validFrom ? new Date(c.validFrom).toISOString().slice(0, 10) : "", validUntil: c.validUntil ? new Date(c.validUntil).toISOString().slice(0, 10) : "", isActive: c.isActive, showOnHome: c.showOnHome ?? true });
    setShowForm(true);
  };
  const handleSave = () => {
    const payload = { code: form.code.toUpperCase(), descriptionAr: form.descriptionAr || undefined, descriptionEn: form.descriptionEn || undefined, discountType: form.discountType, discountValue: parseFloat(form.discountValue), minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : undefined, maxUsageCount: form.maxUsageCount ? parseInt(form.maxUsageCount) : undefined, validFrom: form.validFrom, validUntil: form.validUntil || undefined, isActive: form.isActive, showOnHome: form.showOnHome };
    if (editingId) updateMutation.mutate({ id: editingId, ...payload });
    else createMutation.mutate(payload);
  };
  const statusColor = (c: any) => { if (!c.isActive) return "bg-red-100 text-red-700"; if (c.validUntil && new Date(c.validUntil) < new Date()) return "bg-gray-100 text-gray-600"; return "bg-green-100 text-green-700"; };
  const statusLabel = (c: any) => { if (!c.isActive) return isRTL ? "معطل" : "Inactive"; if (c.validUntil && new Date(c.validUntil) < new Date()) return isRTL ? "منتهي" : "Expired"; return isRTL ? "نشط" : "Active"; };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>{isRTL ? "إدارة كودات الخصم" : "Promo Codes Management"}</h2>
        <Button size="sm" onClick={() => { resetForm(); setEditingId(null); setShowForm(true); }} className="gap-1.5"><Plus className="w-4 h-4" />{isRTL ? "إضافة كود" : "Add Code"}</Button>
      </div>
      {showForm && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm">{isRTL ? "كود الخصم" : "Code"} *</Label><Input value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="SAVE20" /></div>
              <div><Label className="text-sm">{isRTL ? "نوع الخصم" : "Discount Type"}</Label>
                <Select value={form.discountType} onValueChange={(v) => set("discountType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="percentage">{isRTL ? "نسبة مئوية %" : "Percentage %"}</SelectItem><SelectItem value="fixed">{isRTL ? "مبلغ ثابت" : "Fixed Amount"}</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label className="text-sm">{isRTL ? "قيمة الخصم" : "Discount Value"} *</Label><Input type="number" min="0" value={form.discountValue} onChange={(e) => set("discountValue", e.target.value)} /></div>
              <div><Label className="text-sm">{isRTL ? "حد أدنى للطلب" : "Min Order Amount"}</Label><Input type="number" min="0" value={form.minOrderAmount} onChange={(e) => set("minOrderAmount", e.target.value)} /></div>
              <div><Label className="text-sm">{isRTL ? "أقصى عدد استخدام" : "Max Usage Count"}</Label><Input type="number" min="0" value={form.maxUsageCount} onChange={(e) => set("maxUsageCount", e.target.value)} /></div>
              <div><Label className="text-sm">{isRTL ? "تاريخ البدء" : "Valid From"} *</Label><Input type="date" value={form.validFrom} onChange={(e) => set("validFrom", e.target.value)} /></div>
              <div><Label className="text-sm">{isRTL ? "تاريخ الانتهاء" : "Valid Until"}</Label><Input type="date" value={form.validUntil} onChange={(e) => set("validUntil", e.target.value)} /></div>
              <div><Label className="text-sm">{isRTL ? "وصف عربي" : "Description (Arabic)"}</Label><Input value={form.descriptionAr} onChange={(e) => set("descriptionAr", e.target.value)} /></div>
              <div><Label className="text-sm">{isRTL ? "وصف إنجليزي" : "Description (English)"}</Label><Input value={form.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} /></div>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.isActive} onCheckedChange={(v) => set("isActive", v)} /><Label className="text-sm">{isRTL ? "نشط" : "Active"}</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.showOnHome} onCheckedChange={(v) => set("showOnHome", v)} /><Label className="text-sm">{isRTL ? "إظهار في الصفحة الرئيسية" : "Show on Home Page"}</Label></div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }}>{isRTL ? "إلغاء" : "Cancel"}</Button>
              <Button size="sm" onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}><Save className="w-3.5 h-3.5 me-1" />{isRTL ? "حفظ" : "Save"}</Button>
            </div>
          </CardContent>
        </Card>
      )}
      {isLoading ? <div className="h-32 bg-muted animate-pulse rounded-lg" /> : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead>{isRTL ? "الكود" : "Code"}</TableHead><TableHead>{isRTL ? "الخصم" : "Discount"}</TableHead><TableHead>{isRTL ? "الصلاحية" : "Validity"}</TableHead><TableHead>{isRTL ? "الاستخدام" : "Usage"}</TableHead><TableHead>{isRTL ? "الحالة" : "Status"}</TableHead><TableHead>{isRTL ? "الصفحة الرئيسية" : "Home"}</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {(codes ?? []).map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell><span className="font-mono font-bold text-primary">{c.code}</span><div className="text-xs text-muted-foreground">{isRTL ? c.descriptionAr : c.descriptionEn}</div></TableCell>
                  <TableCell><span className="font-semibold">{c.discountType === "percentage" ? `${c.discountValue}%` : `${c.discountValue} جم`}</span>{c.minOrderAmount && <div className="text-xs text-muted-foreground">{isRTL ? `حد أدنى: ${c.minOrderAmount}` : `Min: ${c.minOrderAmount}`}</div>}</TableCell>
                  <TableCell><div className="text-xs">{c.validFrom ? new Date(c.validFrom).toLocaleDateString("ar-EG") : "-"}</div><div className="text-xs text-muted-foreground">{c.validUntil ? new Date(c.validUntil).toLocaleDateString("ar-EG") : isRTL ? "غير محدود" : "No limit"}</div></TableCell>
                  <TableCell><span className="text-sm">{c.currentUsageCount}{c.maxUsageCount ? ` / ${c.maxUsageCount}` : ""}</span></TableCell>
                  <TableCell><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(c)}`}>{statusLabel(c)}</span></TableCell>
                  <TableCell>{c.showOnHome ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}</TableCell>
                  <TableCell><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => handleEdit(c)} className="h-7 w-7 p-0"><Edit className="w-3.5 h-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: c.id })} className="h-7 w-7 p-0 text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ─── Branches Management Panel ────────────────────────────────────────────────────
function BranchesMgmtPanel({ isRTL }: { isRTL: boolean }) {
  const utils = trpc.useUtils();
  const { data: branches, isLoading } = trpc.branches.listAll.useQuery();
  const createMutation = trpc.branches.create.useMutation({
    onSuccess: () => { toast.success(isRTL ? "تم إضافة الفرع" : "Branch created"); utils.branches.listAll.invalidate(); utils.branches.list.invalidate(); setShowForm(false); resetForm(); },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.branches.update.useMutation({
    onSuccess: () => { toast.success(isRTL ? "تم تحديث الفرع" : "Branch updated"); utils.branches.listAll.invalidate(); utils.branches.list.invalidate(); setEditingId(null); setShowForm(false); resetForm(); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.branches.delete.useMutation({
    onSuccess: () => { toast.success(isRTL ? "تم حذف الفرع" : "Branch deleted"); utils.branches.listAll.invalidate(); utils.branches.list.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const emptyForm = { nameAr: "", nameEn: "", addressAr: "", addressEn: "", phone: "", openingHours: "", latitude: "", longitude: "", isActive: true };
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const resetForm = () => setForm(emptyForm);
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const handleEdit = (b: any) => {
    setEditingId(b.id);
    setForm({ nameAr: b.nameAr, nameEn: b.nameEn, addressAr: b.addressAr ?? "", addressEn: b.addressEn ?? "", phone: b.phone ?? "", openingHours: b.openingHours ?? "", latitude: b.latitude ? String(b.latitude) : "", longitude: b.longitude ? String(b.longitude) : "", isActive: b.isActive });
    setShowForm(true);
  };
  const handleSave = () => {
    const payload = { nameAr: form.nameAr, nameEn: form.nameEn, addressAr: form.addressAr || undefined, addressEn: form.addressEn || undefined, phone: form.phone || undefined, openingHours: form.openingHours || undefined, latitude: form.latitude || undefined, longitude: form.longitude || undefined, isActive: form.isActive };
    if (editingId) updateMutation.mutate({ id: editingId, ...payload });
    else createMutation.mutate(payload);
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>{isRTL ? "إدارة الفروع" : "Branches Management"}</h2>
        <Button size="sm" onClick={() => { resetForm(); setEditingId(null); setShowForm(true); }} className="gap-1.5"><Plus className="w-4 h-4" />{isRTL ? "إضافة فرع" : "Add Branch"}</Button>
      </div>
      {showForm && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm">{isRTL ? "اسم الفرع بالعربية" : "Name (Arabic)"} *</Label><Input value={form.nameAr} onChange={(e) => set("nameAr", e.target.value)} /></div>
              <div><Label className="text-sm">{isRTL ? "اسم الفرع بالإنجليزية" : "Name (English)"} *</Label><Input value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} /></div>
              <div><Label className="text-sm">{isRTL ? "العنوان بالعربية" : "Address (Arabic)"}</Label><Input value={form.addressAr} onChange={(e) => set("addressAr", e.target.value)} /></div>
              <div><Label className="text-sm">{isRTL ? "العنوان بالإنجليزية" : "Address (English)"}</Label><Input value={form.addressEn} onChange={(e) => set("addressEn", e.target.value)} /></div>
              <div><Label className="text-sm">{isRTL ? "رقم الهاتف" : "Phone"}</Label><Input dir="ltr" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+20..." /></div>
              <div><Label className="text-sm">{isRTL ? "ساعات العمل" : "Opening Hours"}</Label><Input value={form.openingHours} onChange={(e) => set("openingHours", e.target.value)} placeholder={isRTL ? "مثال: 9ص - 11م" : "e.g. 9AM - 11PM"} /></div>
              <div><Label className="text-sm">{isRTL ? "خط العرض (للخريطة)" : "Latitude (for map)"}</Label><Input dir="ltr" type="number" step="any" value={form.latitude} onChange={(e) => set("latitude", e.target.value)} placeholder="30.0444" /></div>
              <div><Label className="text-sm">{isRTL ? "خط الطول (للخريطة)" : "Longitude (for map)"}</Label><Input dir="ltr" type="number" step="any" value={form.longitude} onChange={(e) => set("longitude", e.target.value)} placeholder="31.2357" /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.isActive} onCheckedChange={(v) => set("isActive", v)} /><Label className="text-sm">{isRTL ? "فرع نشط" : "Active Branch"}</Label></div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }}>{isRTL ? "إلغاء" : "Cancel"}</Button>
              <Button size="sm" onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}><Save className="w-3.5 h-3.5 me-1" />{isRTL ? "حفظ" : "Save"}</Button>
            </div>
          </CardContent>
        </Card>
      )}
      {isLoading ? <div className="h-32 bg-muted animate-pulse rounded-lg" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(branches ?? []).map((b: any) => (
            <Card key={b.id} className={b.isActive ? "" : "opacity-60"}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Building2 className="w-5 h-5 text-primary" /></div>
                    <div>
                      <div className="font-semibold" style={{ fontFamily: "'Cairo', sans-serif" }}>{isRTL ? b.nameAr : b.nameEn}</div>
                      {(isRTL ? b.addressAr : b.addressEn) && <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{isRTL ? b.addressAr : b.addressEn}</div>}
                      {b.phone && <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{b.phone}</div>}
                      {b.openingHours && <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />{b.openingHours}</div>}
                      {b.latitude && b.longitude && <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPinned className="w-3 h-3" />{b.latitude}, {b.longitude}</div>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(b)} className="h-7 w-7 p-0"><Edit className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: b.id })} className="h-7 w-7 p-0 text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{b.isActive ? (isRTL ? "نشط" : "Active") : (isRTL ? "معطل" : "Inactive")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Nutrition Management Panel ────────────────────────────────────────────────────
function NutritionMgmtPanel({ isRTL, isAuthenticated, userRole }: { isRTL: boolean; isAuthenticated: boolean; userRole?: string }) {
  const utils = trpc.useUtils();
  const { data: plans, isLoading } = trpc.admin.allNutritionPlans.useQuery();
  const createPlanMutation = trpc.admin.createNutritionPlan.useMutation({ onSuccess: () => { toast.success(isRTL ? "تم إضافة الخطة" : "Plan created"); utils.admin.allNutritionPlans.invalidate(); setShowForm(false); resetForm(); }, onError: (err) => toast.error(err.message) });
  const updatePlanMutation = trpc.admin.updateNutritionPlan.useMutation({ onSuccess: () => { toast.success(isRTL ? "تم تحديث الخطة" : "Plan updated"); utils.admin.allNutritionPlans.invalidate(); setShowForm(false); setEditing(null); }, onError: (err) => toast.error(err.message) });
  const deletePlanMutation = trpc.admin.deleteNutritionPlan.useMutation({ onSuccess: () => { toast.success(isRTL ? "تم حذف الخطة" : "Plan deleted"); utils.admin.allNutritionPlans.invalidate(); }, onError: (err) => toast.error(err.message) });
  const emptyForm = { titleAr: "", titleEn: "", descriptionAr: "", descriptionEn: "", price: "", imageUrl: "", isActive: true, features: "" };
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const resetForm = () => setForm(emptyForm);
  const openEdit = (plan: any) => { setEditing(plan); setForm({ titleAr: plan.titleAr, titleEn: plan.titleEn, descriptionAr: plan.descriptionAr ?? "", descriptionEn: plan.descriptionEn ?? "", price: String(plan.price), imageUrl: plan.imageUrl ?? "", isActive: plan.isActive !== false, features: plan.features ?? "" }); setShowForm(true); };
  const handleSave = () => { if (!form.titleAr || !form.titleEn || !form.price) { toast.error(isRTL ? "يرجى ملء الحقول المطلوبة" : "Please fill required fields"); return; } const payload = { titleAr: form.titleAr, titleEn: form.titleEn, descriptionAr: form.descriptionAr || undefined, descriptionEn: form.descriptionEn || undefined, price: parseFloat(form.price), imageUrl: form.imageUrl || undefined, isActive: form.isActive, features: form.features || undefined }; if (editing) updatePlanMutation.mutate({ id: editing.id, ...payload }); else createPlanMutation.mutate(payload); };
  return (
    <div className="space-y-4">      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Leaf className="w-4 h-4 text-primary" />
            {isRTL ? "إدارة خطط التغذية" : "Manage Nutrition Plans"}
        </CardTitle>
          <Button size="sm" className="gap-1 bg-primary text-white" onClick={() => { resetForm(); setEditing(null); setShowForm(true); }}><Plus className="w-3.5 h-3.5" />{isRTL ? "إضافة خطة" : "Add Plan"}</Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded" />)}</div>
          ) : (
            <div className="space-y-3">
              {(plans ?? []).map((plan: any) => (
                <div key={plan.id} className="flex items-center gap-4 p-4 border border-border rounded-xl">
                  {plan.imageUrl && (
                    <img src={plan.imageUrl} alt="" className="w-16 h-16 object-cover rounded-lg shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm">{isRTL ? plan.titleAr : plan.titleEn}</div>
                    <div className="text-muted-foreground text-xs line-clamp-1">{isRTL ? plan.descriptionAr : plan.descriptionEn}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-primary font-bold text-sm">{Number(plan.price).toFixed(0)} {isRTL ? "ج.م" : "EGP"}</span>
                      <Badge className={plan.isActive !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"} variant="secondary">
                        {plan.isActive !== false ? (isRTL ? "نشط" : "Active") : (isRTL ? "معطل" : "Inactive")}
                      </Badge>
                    </div>
                  </div>
                 <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-blue-600" onClick={() => openEdit(plan)}><Edit className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-red-600" onClick={() => { if (confirm(isRTL ? "حذف هذه الخطة؟" : "Delete this plan?")) deletePlanMutation.mutate({ id: plan.id }); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      </Card>

      {/* Edit Plan Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setEditing(null); resetForm(); } }}>
        <DialogContent className="max-w-lg" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{editing ? (isRTL ? "تعديل خطة التغذية" : "Edit Nutrition Plan") : (isRTL ? "إضافة خطة جديدة" : "Add New Plan")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm mb-1 block">{isRTL ? "الاسم بالعربية" : "Name (Arabic)"}</Label>
                <Input value={form.titleAr} onChange={(e) => setForm(f => ({ ...f, titleAr: e.target.value }))} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">{isRTL ? "الاسم بالإنجليزية" : "Name (English)"}</Label>
                <Input value={form.titleEn} onChange={(e) => setForm(f => ({ ...f, titleEn: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm mb-1 block">{isRTL ? "الوصف بالعربية" : "Description (Arabic)"}</Label>
                <textarea className="w-full border border-border rounded-lg p-2 text-sm bg-background resize-none" rows={2} value={form.descriptionAr} onChange={(e) => setForm(f => ({ ...f, descriptionAr: e.target.value }))} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">{isRTL ? "الوصف بالإنجليزية" : "Description (English)"}</Label>
                <textarea className="w-full border border-border rounded-lg p-2 text-sm bg-background resize-none" rows={2} value={form.descriptionEn} onChange={(e) => setForm(f => ({ ...f, descriptionEn: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm mb-1 block">{isRTL ? "السعر (ج.م)" : "Price (EGP)"}</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">{isRTL ? "صورة الخطة" : "Plan Image"}</Label>
                <ImageUploader value={form.imageUrl} onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))} isRTL={isRTL} folder="nutrition" />
              </div>
            </div>
            <div>
                <Label className="text-sm mb-1 block">{isRTL ? "المميزات (سطر لكل ميزة)" : "Features (one per line)"}</Label>
                <textarea className="w-full border border-border rounded-lg p-2 text-sm bg-background resize-none" rows={4} value={form.features} onChange={(e) => setForm(f => ({ ...f, features: e.target.value }))} placeholder={isRTL ? "3 وجبات يومياً\nخطة غذائية مخصصة" : "3 meals daily\nCustom nutrition plan"} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm(f => ({ ...f, isActive: v }))} />
                <Label className="text-sm">{isRTL ? "الخطة نشطة" : "Plan Active"}</Label>
              </div>
            <div className="flex gap-3 pt-2">
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-white gap-2"
                onClick={handleSave}
                disabled={createPlanMutation.isPending || updatePlanMutation.isPending}>
                <Save className="w-4 h-4" />
                {isRTL ? "حفظ التغييرات" : "Save Changes"}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => { setShowForm(false); setEditing(null); resetForm(); }}>
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Sliders Management Panel ───────────────────────────────────────────────────────────────
function SlidersMgmtPanel({ isRTL, isAuthenticated, userRole }: { isRTL: boolean; isAuthenticated: boolean; userRole?: string }) {
  const utils = trpc.useUtils();
  const { data: sliders, isLoading } = trpc.sliders.listAll.useQuery(undefined, { enabled: isAuthenticated && userRole === "admin" });
  const createMutation = trpc.sliders.create.useMutation({
    onSuccess: () => { toast.success(isRTL ? "تم إضافة الشريحة" : "Slider created"); utils.sliders.listAll.invalidate(); utils.sliders.list.invalidate(); setShowForm(false); resetForm(); },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.sliders.update.useMutation({
    onSuccess: () => { toast.success(isRTL ? "تم تحديث الشريحة" : "Slider updated"); utils.sliders.listAll.invalidate(); utils.sliders.list.invalidate(); setShowForm(false); setEditing(null); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.sliders.delete.useMutation({
    onSuccess: () => { toast.success(isRTL ? "تم حذف الشريحة" : "Slider deleted"); utils.sliders.listAll.invalidate(); utils.sliders.list.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const emptyForm = { titleAr: "", titleEn: "", subtitleAr: "", subtitleEn: "", imageUrl: "", link: "", displayOrder: "0", isActive: true };
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const resetForm = () => setForm(emptyForm);
  const openEdit = (s: any) => {
    setEditing(s);
    setForm({ titleAr: s.titleAr, titleEn: s.titleEn, subtitleAr: s.subtitleAr ?? "", subtitleEn: s.subtitleEn ?? "", imageUrl: s.imageUrl, link: s.link ?? "", displayOrder: String(s.displayOrder), isActive: s.isActive });
    setShowForm(true);
  };
  const handleSave = () => {
    const payload = { titleAr: form.titleAr, titleEn: form.titleEn, subtitleAr: form.subtitleAr || undefined, subtitleEn: form.subtitleEn || undefined, imageUrl: form.imageUrl, link: form.link || undefined, displayOrder: parseInt(form.displayOrder) || 0, isActive: form.isActive };
    if (editing) updateMutation.mutate({ id: editing.id, ...payload });
    else createMutation.mutate(payload);
  };
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Image className="w-4 h-4 text-primary" />{isRTL ? "إدارة السلايدر" : "Manage Sliders"}</CardTitle>
            <Button size="sm" className="gap-1 bg-primary text-white" onClick={() => { resetForm(); setEditing(null); setShowForm(true); }}>
              <Plus className="w-3.5 h-3.5" />{isRTL ? "إضافة شريحة" : "Add Slide"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded" />)}</div> : (
            <div className="space-y-3">
              {(sliders as any[] ?? []).map((s: any) => (
                <div key={s.id} className="flex items-center gap-3 p-3 border border-border rounded-xl">
                  <img src={s.imageUrl} alt="" className="w-20 h-12 rounded-lg object-cover shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=80"; }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{isRTL ? s.titleAr : s.titleEn}</div>
                    <div className="text-xs text-muted-foreground">{isRTL ? "الترتيب:" : "Order:"} {s.displayOrder} • <span className={s.isActive ? "text-green-600" : "text-red-500"}>{s.isActive ? (isRTL ? "نشط" : "Active") : (isRTL ? "معطل" : "Inactive")}</span></div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-blue-600" onClick={() => openEdit(s)}><Edit className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-red-600" onClick={() => { if (confirm(isRTL ? "حذف هذه الشريحة؟" : "Delete this slide?")) deleteMutation.mutate({ id: s.id }); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              ))}
              {!(sliders as any[] ?? []).length && <p className="text-center text-muted-foreground text-sm py-8">{isRTL ? "لا توجد شرائح بعد" : "No slides yet"}</p>}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) { setEditing(null); resetForm(); } }}>
        <DialogContent className="max-w-lg" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader><DialogTitle>{editing ? (isRTL ? "تعديل شريحة" : "Edit Slide") : (isRTL ? "إضافة شريحة جديدة" : "Add New Slide")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm mb-1 block">{isRTL ? "العنوان بالعربية" : "Title (Arabic)"} *</Label><Input value={form.titleAr} onChange={(e) => setForm(f => ({ ...f, titleAr: e.target.value }))} /></div>
              <div><Label className="text-sm mb-1 block">{isRTL ? "العنوان بالإنجليزية" : "Title (English)"} *</Label><Input value={form.titleEn} onChange={(e) => setForm(f => ({ ...f, titleEn: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm mb-1 block">{isRTL ? "الوصف بالعربية" : "Subtitle (Arabic)"}</Label><Input value={form.subtitleAr} onChange={(e) => setForm(f => ({ ...f, subtitleAr: e.target.value }))} /></div>
              <div><Label className="text-sm mb-1 block">{isRTL ? "الوصف بالإنجليزية" : "Subtitle (English)"}</Label><Input value={form.subtitleEn} onChange={(e) => setForm(f => ({ ...f, subtitleEn: e.target.value }))} /></div>
            </div>
            <div><Label className="text-sm mb-1 block">{isRTL ? "صورة السلايد" : "Slider Image"} *</Label><ImageUploader value={form.imageUrl} onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))} isRTL={isRTL} folder="sliders" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm mb-1 block">{isRTL ? "رابط الزر" : "Button Link"}</Label><Input dir="ltr" value={form.link} onChange={(e) => setForm(f => ({ ...f, link: e.target.value }))} placeholder="/menu" /></div>
              <div><Label className="text-sm mb-1 block">{isRTL ? "الترتيب" : "Display Order"}</Label><Input type="number" value={form.displayOrder} onChange={(e) => setForm(f => ({ ...f, displayOrder: e.target.value }))} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.isActive} onCheckedChange={(v) => setForm(f => ({ ...f, isActive: v }))} /><Label className="text-sm">{isRTL ? "نشط" : "Active"}</Label></div>
            <div className="flex gap-3 pt-2">
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-white gap-2" onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}><Save className="w-4 h-4" />{isRTL ? "حفظ" : "Save"}</Button>
              <Button variant="outline" className="flex-1" onClick={() => { setShowForm(false); setEditing(null); resetForm(); }}>{isRTL ? "إلغاء" : "Cancel"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Packages Management Panel ───────────────────────────────────────────────────────────────
function PackagesMgmtPanel({ isRTL, isAuthenticated, userRole }: { isRTL: boolean; isAuthenticated: boolean; userRole?: string }) {
  const utils = trpc.useUtils();
  const { data: pkgs, isLoading } = trpc.packagesAdmin.list.useQuery(undefined, { enabled: isAuthenticated && userRole === "admin" });
  const createMutation = trpc.packagesAdmin.create.useMutation({
    onSuccess: () => { toast.success(isRTL ? "تم إضافة الباكدج" : "Package created"); utils.packagesAdmin.list.invalidate(); setShowForm(false); resetForm(); },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.packagesAdmin.update.useMutation({
    onSuccess: () => { toast.success(isRTL ? "تم تحديث الباكدج" : "Package updated"); utils.packagesAdmin.list.invalidate(); setShowForm(false); setEditing(null); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.packagesAdmin.delete.useMutation({
    onSuccess: () => { toast.success(isRTL ? "تم حذف الباكدج" : "Package deleted"); utils.packagesAdmin.list.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const emptyForm = { titleAr: "", titleEn: "", descriptionAr: "", descriptionEn: "", mealCount: "7", originalPrice: "", discountedPrice: "", discountPercentage: "", imageUrl: "", isActive: true };
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const resetForm = () => setForm(emptyForm);
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ titleAr: p.titleAr, titleEn: p.titleEn, descriptionAr: p.descriptionAr ?? "", descriptionEn: p.descriptionEn ?? "", mealCount: String(p.mealCount), originalPrice: String(p.originalPrice), discountedPrice: String(p.discountedPrice), discountPercentage: p.discountPercentage ? String(p.discountPercentage) : "", imageUrl: p.imageUrl ?? "", isActive: p.isActive });
    setShowForm(true);
  };
  const handleSave = () => {
    if (!form.titleAr || !form.titleEn || !form.originalPrice || !form.discountedPrice) { toast.error(isRTL ? "يرجى ملء الحقول المطلوبة" : "Please fill required fields"); return; }
    const payload = { titleAr: form.titleAr, titleEn: form.titleEn, descriptionAr: form.descriptionAr || undefined, descriptionEn: form.descriptionEn || undefined, mealCount: parseInt(form.mealCount) || 1, originalPrice: parseFloat(form.originalPrice), discountedPrice: parseFloat(form.discountedPrice), discountPercentage: form.discountPercentage ? parseInt(form.discountPercentage) : undefined, imageUrl: form.imageUrl || undefined, isActive: form.isActive };
    if (editing) updateMutation.mutate({ id: editing.id, ...payload });
    else createMutation.mutate(payload);
  };
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Boxes className="w-4 h-4 text-primary" />{isRTL ? "إدارة الباكدجات" : "Manage Packages"}</CardTitle>
            <Button size="sm" className="gap-1 bg-primary text-white" onClick={() => { resetForm(); setEditing(null); setShowForm(true); }}>
              <Plus className="w-3.5 h-3.5" />{isRTL ? "إضافة باكدج" : "Add Package"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded" />)}</div> : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>{isRTL ? "الباكدج" : "Package"}</TableHead>
                  <TableHead>{isRTL ? "عدد الوجبات" : "Meals"}</TableHead>
                  <TableHead>{isRTL ? "السعر الأصلي" : "Original"}</TableHead>
                  <TableHead>{isRTL ? "سعر بعد الخصم" : "Discounted"}</TableHead>
                  <TableHead>{isRTL ? "الحالة" : "Status"}</TableHead>
                  <TableHead>{isRTL ? "إجراء" : "Action"}</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {(pkgs as any[] ?? []).map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {p.imageUrl && <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                          <div>
                            <div className="font-medium text-sm">{isRTL ? p.titleAr : p.titleEn}</div>
                            <div className="text-xs text-muted-foreground">{isRTL ? p.descriptionAr : p.descriptionEn}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">{p.mealCount}</TableCell>
                      <TableCell className="line-through text-muted-foreground">{Number(p.originalPrice).toFixed(0)}</TableCell>
                      <TableCell className="font-bold text-primary">{Number(p.discountedPrice).toFixed(0)} {isRTL ? "ج.م" : "EGP"}</TableCell>
                      <TableCell><span className={`px-2 py-0.5 rounded-full text-xs ${p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{p.isActive ? (isRTL ? "نشط" : "Active") : (isRTL ? "معطل" : "Inactive")}</span></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-blue-600" onClick={() => openEdit(p)}><Edit className="w-3.5 h-3.5" /></Button>
                          <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-red-600" onClick={() => { if (confirm(isRTL ? "حذف هذا الباكدج؟" : "Delete this package?")) deleteMutation.mutate({ id: p.id }); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) { setEditing(null); resetForm(); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader><DialogTitle>{editing ? (isRTL ? "تعديل باكدج" : "Edit Package") : (isRTL ? "إضافة باكدج جديد" : "Add New Package")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm mb-1 block">{isRTL ? "الاسم بالعربية" : "Title (Arabic)"} *</Label><Input value={form.titleAr} onChange={(e) => setForm(f => ({ ...f, titleAr: e.target.value }))} /></div>
              <div><Label className="text-sm mb-1 block">{isRTL ? "الاسم بالإنجليزية" : "Title (English)"} *</Label><Input value={form.titleEn} onChange={(e) => setForm(f => ({ ...f, titleEn: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm mb-1 block">{isRTL ? "الوصف بالعربية" : "Description (Arabic)"}</Label><Input value={form.descriptionAr} onChange={(e) => setForm(f => ({ ...f, descriptionAr: e.target.value }))} /></div>
              <div><Label className="text-sm mb-1 block">{isRTL ? "الوصف بالإنجليزية" : "Description (English)"}</Label><Input value={form.descriptionEn} onChange={(e) => setForm(f => ({ ...f, descriptionEn: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-sm mb-1 block">{isRTL ? "عدد الوجبات" : "Meal Count"} *</Label><Input type="number" value={form.mealCount} onChange={(e) => setForm(f => ({ ...f, mealCount: e.target.value }))} /></div>
              <div><Label className="text-sm mb-1 block">{isRTL ? "السعر الأصلي" : "Original Price"} *</Label><Input type="number" value={form.originalPrice} onChange={(e) => setForm(f => ({ ...f, originalPrice: e.target.value }))} /></div>
              <div><Label className="text-sm mb-1 block">{isRTL ? "سعر بعد الخصم" : "Discounted Price"} *</Label><Input type="number" value={form.discountedPrice} onChange={(e) => setForm(f => ({ ...f, discountedPrice: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm mb-1 block">{isRTL ? "نسبة الخصم (%)" : "Discount %"}</Label><Input type="number" value={form.discountPercentage} onChange={(e) => setForm(f => ({ ...f, discountPercentage: e.target.value }))} /></div>
              <div><Label className="text-sm mb-1 block">{isRTL ? "صورة الباكدج" : "Package Image"}</Label><ImageUploader value={form.imageUrl} onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))} isRTL={isRTL} folder="packages" /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.isActive} onCheckedChange={(v) => setForm(f => ({ ...f, isActive: v }))} /><Label className="text-sm">{isRTL ? "نشط" : "Active"}</Label></div>
            <div className="flex gap-3 pt-2">
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-white gap-2" onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}><Save className="w-4 h-4" />{isRTL ? "حفظ" : "Save"}</Button>
              <Button variant="outline" className="flex-1" onClick={() => { setShowForm(false); setEditing(null); resetForm(); }}>{isRTL ? "إلغاء" : "Cancel"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Tracking Panel ───────────────────────────────────────────────────────────────
function TrackingPanel({ isRTL, orders, updateOrderStatusMutation, t, lang }: { isRTL: boolean; orders: any[]; updateOrderStatusMutation: any; t: any; lang: string }) {
  const [search, setSearch] = useState("");
  const deliveryOrders = orders.filter((o: any) => o.deliveryType === "delivery" || o.deliveryType === "pickup");
  const filtered = deliveryOrders.filter((o: any) => !search || o.orderNumber?.includes(search) || o.user?.name?.toLowerCase().includes(search.toLowerCase()));
  const trackingSteps = ["confirmed", "preparing", "ready", "on_the_way", "delivered"];
  const stepLabels: Record<string, { ar: string; en: string }> = {
    confirmed: { ar: "مؤكد", en: "Confirmed" }, preparing: { ar: "يجهز", en: "Preparing" },
    ready: { ar: "جاهز", en: "Ready" }, on_the_way: { ar: "في الطريق", en: "On The Way" },
    delivered: { ar: "تم التسليم", en: "Delivered" },
  };
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700", confirmed: "bg-blue-100 text-blue-700",
    preparing: "bg-orange-100 text-orange-700", ready: "bg-purple-100 text-purple-700",
    on_the_way: "bg-cyan-100 text-cyan-700", delivered: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700",
  };
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Truck className="w-4 h-4 text-primary" />{isRTL ? "تتبع الشحنات" : "Shipment Tracking"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input placeholder={isRTL ? "بحث برقم الطلب أو اسم العميل" : "Search by order number or customer name"} value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
          </div>
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">{isRTL ? "لا توجد طلبات توصيل بعد" : "No delivery orders found"}</p>
          ) : (
            <div className="space-y-4">
              {filtered.map((order: any) => {
                const currentStep = trackingSteps.indexOf(order.status);
                return (
                  <div key={order.id} className="border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-bold text-sm">#{order.orderNumber}</div>
                        <div className="text-xs text-muted-foreground">{order.user?.name || "-"} • {order.deliveryAddress || (isRTL ? "بدون عنوان" : "No address")}</div>
                        <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                          {t.orders[order.status as keyof typeof t.orders] || order.status}
                        </span>
                        <Select value={order.status} onValueChange={(v) => updateOrderStatusMutation.mutate({ id: order.id, status: v as any })}>
                          <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["pending","confirmed","preparing","ready","on_the_way","delivered","cancelled"].map(s => (
                              <SelectItem key={s} value={s} className="text-xs">{t.orders[s as keyof typeof t.orders] || s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {/* Progress bar */}
                    {order.status !== "cancelled" && order.status !== "pending" && (
                      <div className="flex items-center gap-1 mt-2">
                        {trackingSteps.map((step, idx) => (
                          <React.Fragment key={step}>
                            <div className={`flex flex-col items-center gap-0.5 ${idx <= currentStep ? "text-primary" : "text-muted-foreground/40"}`}>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border-2 ${idx <= currentStep ? "bg-primary border-primary text-white" : "border-muted-foreground/30 bg-background"}`}>
                                {idx < currentStep ? "✓" : idx + 1}
                              </div>
                              <span className="text-[9px] text-center leading-tight hidden sm:block">{isRTL ? stepLabels[step]?.ar : stepLabels[step]?.en}</span>
                            </div>
                            {idx < trackingSteps.length - 1 && (
                              <div className={`flex-1 h-0.5 ${idx < currentStep ? "bg-primary" : "bg-muted-foreground/20"}`} />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Site Settings Panel ───────────────────────────────────────────────────────────────
function SiteSettingsPanel({ isRTL, isAuthenticated, userRole }: { isRTL: boolean; isAuthenticated: boolean; userRole?: string }) {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.settings.get.useQuery(undefined, { enabled: isAuthenticated && userRole === "admin" });
  const updateMutation = trpc.settings.update.useMutation({
    onSuccess: () => { toast.success(isRTL ? "تم حفظ الإعدادات" : "Settings saved"); utils.settings.get.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const [form, setForm] = useState<Record<string, string>>({});
  const settingsRef = React.useRef<Record<string, string> | null>(null);
  useEffect(() => {
    if (settings && settingsRef.current !== settings) {
      settingsRef.current = settings;
      setForm(settings);
    }
  }, [settings]);
  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));
  const handleSave = () => {
    const entries = Object.entries(form).map(([key, value]) => ({ key, value }));
    updateMutation.mutate({ entries });
    // Apply primary color immediately
    if (form.primaryColor) {
      // Apply color as CSS variable - browsers accept hex in custom properties used with oklch fallback
      const r = parseInt(form.primaryColor.slice(1,3),16)/255, g = parseInt(form.primaryColor.slice(3,5),16)/255, b = parseInt(form.primaryColor.slice(5,7),16)/255;
      const l = 0.2126*r+0.7152*g+0.0722*b;
      document.documentElement.style.setProperty("--primary", `oklch(${(l*0.7+0.3).toFixed(3)} 0.18 ${Math.atan2(b-g,r-b)*180/Math.PI+150})`);
    }
  };
  if (isLoading) return <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}</div>;
  return (
    <div className="space-y-6">
      {/* Identity */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="w-4 h-4 text-primary" />{isRTL ? "هوية الموقع" : "Site Identity"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-sm mb-1 block">{isRTL ? "اسم الموقع (عربي)" : "Site Name (Arabic)"}</Label><Input value={form.siteNameAr ?? ""} onChange={(e) => set("siteNameAr", e.target.value)} /></div>
            <div><Label className="text-sm mb-1 block">{isRTL ? "اسم الموقع (إنجليزي)" : "Site Name (English)"}</Label><Input value={form.siteNameEn ?? ""} onChange={(e) => set("siteNameEn", e.target.value)} /></div>
          </div>
          <div><Label className="text-sm mb-1 block">{isRTL ? "شعار الموقع" : "Site Logo"}</Label><ImageUploader value={form.logoUrl ?? ""} onChange={(url) => set("logoUrl", url)} isRTL={isRTL} folder="logo" /></div>
          <div><Label className="text-sm mb-1 block flex items-center gap-2"><Palette className="w-3.5 h-3.5" />{isRTL ? "اللون الرئيسي" : "Primary Color"}</Label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.primaryColor ?? "#16a34a"} onChange={(e) => set("primaryColor", e.target.value)} className="w-12 h-10 rounded cursor-pointer border border-border" />
              <Input dir="ltr" value={form.primaryColor ?? ""} onChange={(e) => set("primaryColor", e.target.value)} className="w-32" placeholder="#16a34a" />
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Contact */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Phone className="w-4 h-4 text-primary" />{isRTL ? "معلومات التواصل" : "Contact Information"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-sm mb-1 block flex items-center gap-1"><Phone className="w-3 h-3" />{isRTL ? "رقم الهاتف الأساسي" : "Primary Phone"}</Label><Input dir="ltr" value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} placeholder="+201142839399" /></div>
            <div><Label className="text-sm mb-1 block flex items-center gap-1"><Phone className="w-3 h-3" />{isRTL ? "رقم هاتف ثانوي" : "Secondary Phone"}</Label><Input dir="ltr" value={form.phone2 ?? ""} onChange={(e) => set("phone2", e.target.value)} /></div>
          </div>
          <div><Label className="text-sm mb-1 block flex items-center gap-1"><Mail className="w-3 h-3" />{isRTL ? "البريد الإلكتروني" : "Email"}</Label><Input dir="ltr" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-sm mb-1 block flex items-center gap-1"><MapPin className="w-3 h-3" />{isRTL ? "العنوان (عربي)" : "Address (Arabic)"}</Label><Input value={form.addressAr ?? ""} onChange={(e) => set("addressAr", e.target.value)} /></div>
            <div><Label className="text-sm mb-1 block flex items-center gap-1"><MapPin className="w-3 h-3" />{isRTL ? "العنوان (إنجليزي)" : "Address (English)"}</Label><Input value={form.addressEn ?? ""} onChange={(e) => set("addressEn", e.target.value)} /></div>
          </div>
          <div><Label className="text-sm mb-1 block">WhatsApp</Label><Input dir="ltr" value={form.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+201142839399" /></div>
        </CardContent>
      </Card>
      {/* Social Media */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="w-4 h-4 text-primary" />{isRTL ? "روابط السوشيال ميديا" : "Social Media Links"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[{key: "facebook", label: "Facebook"}, {key: "instagram", label: "Instagram"}, {key: "twitter", label: "Twitter / X"}, {key: "tiktok", label: "TikTok"}].map(({key, label}) => (
            <div key={key}><Label className="text-sm mb-1 block">{label}</Label><Input dir="ltr" value={form[key] ?? ""} onChange={(e) => set(key, e.target.value)} placeholder={`https://${key}.com/...`} /></div>
          ))}
        </CardContent>
      </Card>
      {/* Hero Section */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Image className="w-4 h-4 text-primary" />{isRTL ? "نص الصفحة الرئيسية" : "Hero Section Text"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-sm mb-1 block">{isRTL ? "العنوان الرئيسي (عربي)" : "Tagline (Arabic)"}</Label><Input value={form.heroTaglineAr ?? ""} onChange={(e) => set("heroTaglineAr", e.target.value)} /></div>
            <div><Label className="text-sm mb-1 block">{isRTL ? "العنوان الرئيسي (إنجليزي)" : "Tagline (English)"}</Label><Input value={form.heroTaglineEn ?? ""} onChange={(e) => set("heroTaglineEn", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-sm mb-1 block">{isRTL ? "الوصف (عربي)" : "Subtitle (Arabic)"}</Label><Input value={form.heroSubtitleAr ?? ""} onChange={(e) => set("heroSubtitleAr", e.target.value)} /></div>
            <div><Label className="text-sm mb-1 block">{isRTL ? "الوصف (إنجليزي)" : "Subtitle (English)"}</Label><Input value={form.heroSubtitleEn ?? ""} onChange={(e) => set("heroSubtitleEn", e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>
      {/* Commerce Settings */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Settings className="w-4 h-4 text-primary" />{isRTL ? "إعدادات التجارة" : "Commerce Settings"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-sm mb-1 block">{isRTL ? "رسوم التوصيل (ج.م)" : "Delivery Fee (EGP)"}</Label><Input type="number" value={form.deliveryFee ?? ""} onChange={(e) => set("deliveryFee", e.target.value)} /></div>
            <div><Label className="text-sm mb-1 block">{isRTL ? "الحد الأدنى للطلب (ج.م)" : "Min Order Amount (EGP)"}</Label><Input type="number" value={form.minOrderAmount ?? ""} onChange={(e) => set("minOrderAmount", e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button className="bg-primary hover:bg-primary/90 text-white gap-2 px-8" onClick={handleSave} disabled={updateMutation.isPending}>
          <Save className="w-4 h-4" />{isRTL ? "حفظ جميع الإعدادات" : "Save All Settings"}
        </Button>
      </div>
    </div>
  );
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  ready: "bg-purple-100 text-purple-700",
  on_the_way: "bg-cyan-100 text-cyan-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function Admin() {
  const { t, lang, isRTL } = useLang();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    nameAr: "", nameEn: "", descriptionAr: "", descriptionEn: "",
    category: "", price: "", calories: "", protein: "", carbs: "", fat: "",
    imageUrl: "", isAvailable: true, isFeatured: false,
    branchId: "none", hasExtras: false,
  });
   const [productExtrasState, setProductExtrasState] = useState<Array<{ type: "sauce"|"spice"|"bread"; nameAr: string; nameEn: string; price: string; isDefault: boolean }>>([]);
  const { data: editingProductExtras } = trpc.products.extras.useQuery(
    { productId: editingProduct?.id ?? 0 },
    { enabled: !!editingProduct?.id && showProductForm }
  );
  // Load extras into state when editing product extras are fetched
  const extrasLoadedRef = useRef<number | null>(null);
  useEffect(() => {
    if (editingProduct?.id && editingProductExtras && extrasLoadedRef.current !== editingProduct.id) {
      extrasLoadedRef.current = editingProduct.id;
      setProductExtrasState(editingProductExtras.map((e: any) => ({
        type: e.type,
        nameAr: e.nameAr,
        nameEn: e.nameEn,
        price: String(e.price ?? 0),
        isDefault: e.isDefault ?? false,
      })));
    }
    if (!editingProduct) extrasLoadedRef.current = null;
  }, [editingProduct, editingProductExtras]);
  const utils = trpc.useUtils();

  const { data: stats } = trpc.admin.stats.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const { data: productsData } = trpc.products.list.useQuery({ limit: 100 }, { enabled: isAuthenticated && user?.role === "admin" });
  const products = productsData?.products;
  const { data: ordersData } = trpc.orders.all.useQuery({ limit: 50 }, { enabled: isAuthenticated && user?.role === "admin" });
  const orders = ordersData?.orders;
  const { data: usersData } = trpc.admin.users.useQuery({}, { enabled: isAuthenticated && user?.role === "admin" });
  const users = usersData?.users;
  const { data: feedbacks } = trpc.feedback.all.useQuery({}, { enabled: isAuthenticated && user?.role === "admin" });
  const { data: cateringRequests } = trpc.catering.allRequests.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const { data: branchesData } = trpc.branches.list.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const branchesList = branchesData ?? [];

  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success(lang === "ar" ? "تم إضافة المنتج بنجاح" : "Product added successfully");
      setShowProductForm(false);
      utils.products.list.invalidate();
      resetProductForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateProductMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success(lang === "ar" ? "تم تحديث المنتج" : "Product updated");
      setShowProductForm(false);
      setEditingProduct(null);
      utils.products.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success(lang === "ar" ? "تم حذف المنتج" : "Product deleted");
      utils.products.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateOrderStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success(lang === "ar" ? "تم تحديث حالة الطلب" : "Order status updated");
      utils.orders.all.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const resetProductForm = () => {
    setProductForm({ nameAr: "", nameEn: "", descriptionAr: "", descriptionEn: "", category: "", price: "", calories: "", protein: "", carbs: "", fat: "", imageUrl: "", isAvailable: true, isFeatured: false, branchId: "none", hasExtras: false });
    setProductExtrasState([]);
  };

  const openEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      nameAr: product.nameAr, nameEn: product.nameEn,
      descriptionAr: product.descriptionAr || "", descriptionEn: product.descriptionEn || "",
      category: product.category, price: String(product.price),
      calories: product.calories ? String(product.calories) : "",
      protein: product.protein ? String(product.protein) : "",
      carbs: product.carbs ? String(product.carbs) : "",
      fat: product.fat ? String(product.fat) : "",
      imageUrl: product.imageUrl || "",
      isAvailable: product.isAvailable, isFeatured: product.isFeatured,
      branchId: product.branchId ? String(product.branchId) : "none",
      hasExtras: product.hasExtras ?? false,
    });
    setProductExtrasState([]);
    setShowProductForm(true);
  };

  const handleSaveProduct = () => {
    if (!productForm.nameAr || !productForm.nameEn || !productForm.category || !productForm.price) {
      toast.error(lang === "ar" ? "يرجى ملء الحقول المطلوبة" : "Please fill required fields");
      return;
    }
    const data = {
      nameAr: productForm.nameAr, nameEn: productForm.nameEn,
      descriptionAr: productForm.descriptionAr || undefined, descriptionEn: productForm.descriptionEn || undefined,
      category: productForm.category, price: parseFloat(productForm.price),
      calories: productForm.calories ? parseInt(productForm.calories) : undefined,
      protein: productForm.protein ? parseFloat(productForm.protein) : undefined,
      carbs: productForm.carbs ? parseFloat(productForm.carbs) : undefined,
      fat: productForm.fat ? parseFloat(productForm.fat) : undefined,
      imageUrl: productForm.imageUrl || undefined,
      isAvailable: productForm.isAvailable, isFeatured: productForm.isFeatured,
      branchId: (productForm.branchId && productForm.branchId !== "none") ? parseInt(productForm.branchId) : undefined,
      hasExtras: productForm.hasExtras,
      extras: productExtrasState.map((e, i) => ({ ...e, price: parseFloat(e.price || "0"), sortOrder: i })),
    };
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, ...data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">{t.common.loginRequired}</h2>
          <Button className="bg-primary text-white" onClick={() => window.location.href = getLoginUrl()}>
            {t.nav.login}
          </Button>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">{isRTL ? "غير مصرح بالدخول" : "Access Denied"}</h2>
          <p className="text-muted-foreground mb-4">{isRTL ? "هذه الصفحة للمسؤولين فقط" : "This page is for admins only"}</p>
          <Button asChild variant="outline"><Link href="/">{isRTL ? "العودة للرئيسية" : "Back to Home"}</Link></Button>
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: ShoppingCart, label: t.admin.totalOrders, value: stats?.totalOrders || 0, color: "text-blue-600 bg-blue-100" },
    { icon: DollarSign, label: t.admin.totalRevenue, value: `${Number(stats?.totalRevenue || 0).toFixed(0)} ${t.common.egp}`, color: "text-green-600 bg-green-100" },
    { icon: Package, label: t.admin.totalProducts, value: stats?.totalProducts || 0, color: "text-purple-600 bg-purple-100" },
    { icon: Users, label: t.admin.totalUsers, value: stats?.totalUsers || 0, color: "text-orange-600 bg-orange-100" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary/5 border-b border-border py-6">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="secondary" className="mb-1">{t.admin.title}</Badge>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>{t.admin.title}</h1>
            </div>
            <Button className="bg-primary text-white gap-2" onClick={() => { resetProductForm(); setEditingProduct(null); setShowProductForm(true); }}>
              <Plus className="w-4 h-4" />
              {t.admin.addProduct}
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            {[
              { value: "overview", label: t.admin.overview, icon: LayoutDashboard },
              { value: "products", label: t.admin.products, icon: Package },
              { value: "orders", label: t.admin.orders, icon: ShoppingCart },
              { value: "users", label: t.admin.users, icon: Users },
              { value: "catering", label: t.admin.catering, icon: ChefHat },
              { value: "feedback", label: t.admin.feedback, icon: MessageSquare },
              { value: "subscriptions", label: isRTL ? "الاشتراكات" : "Subscriptions", icon: Smartphone },
              { value: "nutrition_mgmt", label: isRTL ? "خطط التغذية" : "Nutrition Plans", icon: Leaf },
              { value: "sliders_mgmt", label: isRTL ? "السلايدر" : "Sliders", icon: Image },
              { value: "packages_mgmt", label: isRTL ? "الباكدجات" : "Packages", icon: Boxes },
              { value: "tracking", label: isRTL ? "تتبع الشحنة" : "Tracking", icon: Truck },
              { value: "promo_codes", label: isRTL ? "كودات الخصم" : "Promo Codes", icon: Tag },
              { value: "branches_mgmt", label: isRTL ? "الفروع" : "Branches", icon: Building2 },
              { value: "site_settings", label: isRTL ? "إعدادات الموقع" : "Site Settings", icon: Globe },
            ].map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value} className="gap-1.5 text-xs">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {statCards.map(({ icon: Icon, label, value, color }, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-black mb-1">{value}</div>
                    <div className="text-muted-foreground text-sm">{label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Recent Orders */}
            <Card>
              <CardHeader><CardTitle className="text-base">{isRTL ? "آخر الطلبات" : "Recent Orders"}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.orders.orderNumber}</TableHead>
                      <TableHead>{t.orders.status}</TableHead>
                      <TableHead>{t.orders.total}</TableHead>
                      <TableHead>{t.orders.date}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders?.slice(0, 5).map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                            {t.orders[order.status as keyof typeof t.orders] || order.status}
                          </span>
                        </TableCell>
                        <TableCell>{Number(order.totalAmount).toFixed(0)} {t.common.egp}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{new Date(order.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{t.admin.products} ({products?.length || 0})</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isRTL ? "المنتج" : "Product"}</TableHead>
                      <TableHead>{isRTL ? "الفئة" : "Category"}</TableHead>
                      <TableHead>{isRTL ? "الفرع" : "Branch"}</TableHead>
                      <TableHead>{isRTL ? "إضافات" : "Extras"}</TableHead>
                      <TableHead>{isRTL ? "السعر" : "Price"}</TableHead>
                      <TableHead>{isRTL ? "الحالة" : "Status"}</TableHead>
                      <TableHead>{t.admin.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products?.map((product: any) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img src={product.imageUrl || "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=60"} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            <div>
                              <div className="font-medium text-sm">{lang === "ar" ? product.nameAr : product.nameEn}</div>
                              {product.calories && <div className="text-xs text-muted-foreground">{product.calories} cal</div>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="secondary" className="text-xs">{product.category}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {product.branchId ? (
                            (branchesList as any[]).find((b: any) => b.id === product.branchId)
                              ? (isRTL ? (branchesList as any[]).find((b: any) => b.id === product.branchId)?.nameAr : (branchesList as any[]).find((b: any) => b.id === product.branchId)?.nameEn)
                              : "—"
                          ) : (isRTL ? "جميع الفروع" : "All branches")}
                        </TableCell>
                        <TableCell>
                          {product.hasExtras ? (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">{isRTL ? "نعم" : "Yes"}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{Number(product.price).toFixed(0)} {t.common.egp}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${product.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {product.isAvailable ? (isRTL ? "متاح" : "Available") : (isRTL ? "غير متاح" : "Unavailable")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-blue-600" onClick={() => openEditProduct(product)}>
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-red-600"
                              onClick={() => { if (confirm(t.admin.confirmDelete)) deleteProductMutation.mutate({ id: product.id }); }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders */}
          <TabsContent value="orders">
            <Card>
              <CardHeader><CardTitle className="text-base">{t.admin.orders} ({orders?.length || 0})</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.orders.orderNumber}</TableHead>
                      <TableHead>{isRTL ? "العميل" : "Customer"}</TableHead>
                      <TableHead>{t.orders.status}</TableHead>
                      <TableHead>{t.orders.total}</TableHead>
                      <TableHead>{t.admin.updateStatus}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders?.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{order.user?.name || "-"}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                            {t.orders[order.status as keyof typeof t.orders] || order.status}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{Number(order.totalAmount).toFixed(0)} {t.common.egp}</TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(v) => updateOrderStatusMutation.mutate({ id: order.id, status: v as any })}
                          >
                            <SelectTrigger className="h-7 text-xs w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["pending","confirmed","preparing","ready","on_the_way","delivered","cancelled"].map(s => (
                                <SelectItem key={s} value={s} className="text-xs">
                                  {t.orders[s as keyof typeof t.orders] || s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            <Card>
              <CardHeader><CardTitle className="text-base">{t.admin.users} ({users?.length || 0})</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isRTL ? "الاسم" : "Name"}</TableHead>
                      <TableHead>{isRTL ? "البريد الإلكتروني" : "Email"}</TableHead>
                      <TableHead>{isRTL ? "الدور" : "Role"}</TableHead>
                      <TableHead>{isRTL ? "تاريخ الانضمام" : "Joined"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((u: any) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name || "-"}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{u.email || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-xs">
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(u.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Catering Requests */}
          <TabsContent value="catering">
            <Card>
              <CardHeader><CardTitle className="text-base">{t.admin.catering} ({cateringRequests?.length || 0})</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isRTL ? "الاسم" : "Name"}</TableHead>
                      <TableHead>{isRTL ? "الهاتف" : "Phone"}</TableHead>
                      <TableHead>{isRTL ? "عدد الضيوف" : "Guests"}</TableHead>
                      <TableHead>{isRTL ? "تاريخ الفعالية" : "Event Date"}</TableHead>
                      <TableHead>{isRTL ? "الحالة" : "Status"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cateringRequests?.map((req: any) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.contactName}</TableCell>
                        <TableCell dir="ltr">{req.contactPhone}</TableCell>
                        <TableCell>{req.guestCount}</TableCell>
                        <TableCell>{new Date(req.eventDate).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${req.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                            {req.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback */}
          <TabsContent value="feedback">
            <Card>
              <CardHeader><CardTitle className="text-base">{t.admin.feedback} ({feedbacks?.length || 0})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {feedbacks?.map((fb: any) => (
                    <div key={fb.id} className="p-4 border border-border rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-medium text-sm">{fb.name || (isRTL ? "مجهول" : "Anonymous")}</span>
                          {fb.rating && (
                            <div className="flex gap-0.5 mt-0.5">
                              {[1,2,3,4,5].map(s => (
                                <span key={s} className={s <= fb.rating ? "text-yellow-400" : "text-muted-foreground"}>★</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">{fb.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{fb.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <SubscriptionsPanel isRTL={isRTL} isAuthenticated={isAuthenticated} userRole={user?.role} />
          </TabsContent>

          {/* Nutrition Management Tab */}
          <TabsContent value="nutrition_mgmt">
            <NutritionMgmtPanel isRTL={isRTL} isAuthenticated={isAuthenticated} userRole={user?.role} />
          </TabsContent>

          {/* Sliders Management Tab */}
          <TabsContent value="sliders_mgmt">
            <SlidersMgmtPanel isRTL={isRTL} isAuthenticated={isAuthenticated} userRole={user?.role} />
          </TabsContent>

          {/* Packages Management Tab */}
          <TabsContent value="packages_mgmt">
            <PackagesMgmtPanel isRTL={isRTL} isAuthenticated={isAuthenticated} userRole={user?.role} />
          </TabsContent>

          {/* Shipment Tracking Tab */}
          <TabsContent value="tracking">
            <TrackingPanel isRTL={isRTL} orders={orders ?? []} updateOrderStatusMutation={updateOrderStatusMutation} t={t} lang={lang} />
          </TabsContent>

          {/* Promo Codes Tab */}
          <TabsContent value="promo_codes">
            <PromoCodesMgmtPanel isRTL={isRTL} />
          </TabsContent>
          {/* Branches Management Tab */}
          <TabsContent value="branches_mgmt">
            <BranchesMgmtPanel isRTL={isRTL} />
          </TabsContent>
          {/* Site Settings Tab */}
          <TabsContent value="site_settings">
            <SiteSettingsPanel isRTL={isRTL} isAuthenticated={isAuthenticated} userRole={user?.role} />
          </TabsContent>

        </Tabs>
      </div>

      {/* Product Form Dialog */}
      <Dialog open={showProductForm} onOpenChange={(open) => { setShowProductForm(open); if (!open) { setEditingProduct(null); resetProductForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Cairo', sans-serif" }}>
              {editingProduct ? t.admin.editProduct : t.admin.addProduct}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">{isRTL ? "الاسم بالعربية" : "Name (Arabic)"} *</Label>
                <Input value={productForm.nameAr} onChange={(e) => setProductForm(f => ({ ...f, nameAr: e.target.value }))} />
              </div>
              <div>
                <Label className="text-sm">{isRTL ? "الاسم بالإنجليزية" : "Name (English)"} *</Label>
                <Input value={productForm.nameEn} onChange={(e) => setProductForm(f => ({ ...f, nameEn: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">{isRTL ? "الوصف بالعربية" : "Description (Arabic)"}</Label>
                <Textarea rows={2} value={productForm.descriptionAr} onChange={(e) => setProductForm(f => ({ ...f, descriptionAr: e.target.value }))} className="resize-none" />
              </div>
              <div>
                <Label className="text-sm">{isRTL ? "الوصف بالإنجليزية" : "Description (English)"}</Label>
                <Textarea rows={2} value={productForm.descriptionEn} onChange={(e) => setProductForm(f => ({ ...f, descriptionEn: e.target.value }))} className="resize-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">{isRTL ? "الفئة" : "Category"} *</Label>
                <Select value={productForm.category} onValueChange={(v) => setProductForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue placeholder={isRTL ? "اختر الفئة" : "Select category"} /></SelectTrigger>
                  <SelectContent>
                    {["salads","grills","soups","sandwiches","juices","desserts","breakfast","main_course"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">{isRTL ? "السعر (ج.م)" : "Price (EGP)"} *</Label>
                <Input type="number" value={productForm.price} onChange={(e) => setProductForm(f => ({ ...f, price: e.target.value }))} />
              </div>
            </div>
            {/* Branch selector */}
            <div>
              <Label className="text-sm">{isRTL ? "الفرع" : "Branch"}</Label>
              <Select value={productForm.branchId} onValueChange={(v) => setProductForm(f => ({ ...f, branchId: v }))}>
                <SelectTrigger><SelectValue placeholder={isRTL ? "اختر الفرع (اختياري)" : "Select branch (optional)"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{isRTL ? "— بدون فرع محدد —" : "— No specific branch —"}</SelectItem>
                  {(branchesList as any[]).map((b: any) => (
                    <SelectItem key={b.id} value={String(b.id)}>{isRTL ? b.nameAr : b.nameEn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { key: "calories", label: isRTL ? "السعرات" : "Calories" },
                { key: "protein", label: isRTL ? "بروتين (g)" : "Protein (g)" },
                { key: "carbs", label: isRTL ? "كربوهيدرات (g)" : "Carbs (g)" },
                { key: "fat", label: isRTL ? "دهون (g)" : "Fat (g)" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <Label className="text-sm">{label}</Label>
                  <Input type="number" value={productForm[key as keyof typeof productForm] as string} onChange={(e) => setProductForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div>
              <Label className="text-sm">{isRTL ? "صورة المنتج" : "Product Image"}</Label>
              <ImageUploader value={productForm.imageUrl} onChange={(url) => setProductForm(f => ({ ...f, imageUrl: url }))} isRTL={isRTL} folder="products" />
            </div>
            <div className="flex gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Switch checked={productForm.isAvailable} onCheckedChange={(v) => setProductForm(f => ({ ...f, isAvailable: v }))} />
                <Label className="text-sm">{isRTL ? "متاح" : "Available"}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={productForm.isFeatured} onCheckedChange={(v) => setProductForm(f => ({ ...f, isFeatured: v }))} />
                <Label className="text-sm">{isRTL ? "مميز" : "Featured"}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={productForm.hasExtras} onCheckedChange={(v) => setProductForm(f => ({ ...f, hasExtras: v }))} />
                <Label className="text-sm">{isRTL ? "يحتوي على إضافات" : "Has Extras"}</Label>
              </div>
            </div>
            {/* Extras Builder */}
            {productForm.hasExtras && (
              <div className="border border-border rounded-lg p-3 space-y-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">{isRTL ? "الإضافات (صوص، حدة، خبز)" : "Extras (Sauces, Spice, Bread)"}</Label>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setProductExtrasState(e => [...e, { type: "sauce", nameAr: "", nameEn: "", price: "0", isDefault: false }])}>
                    <Plus className="w-3 h-3" />{isRTL ? "إضافة" : "Add"}
                  </Button>
                </div>
                {productExtrasState.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">{isRTL ? "لا توجد إضافات بعد" : "No extras yet. Click Add to start."}</p>
                )}
                {productExtrasState.map((extra, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end border-b border-border/50 pb-2">
                    <div className="col-span-2">
                      <Label className="text-xs">{isRTL ? "النوع" : "Type"}</Label>
                      <Select value={extra.type} onValueChange={(v) => setProductExtrasState(e => e.map((x, i) => i === idx ? { ...x, type: v as "sauce"|"spice"|"bread" } : x))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sauce">{isRTL ? "صوص" : "Sauce"}</SelectItem>
                          <SelectItem value="spice">{isRTL ? "حدة" : "Spice"}</SelectItem>
                          <SelectItem value="bread">{isRTL ? "خبز" : "Bread"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Label className="text-xs">{isRTL ? "اسم عربي" : "Arabic Name"}</Label>
                      <Input className="h-8 text-xs" value={extra.nameAr} onChange={(e) => setProductExtrasState(ex => ex.map((x, i) => i === idx ? { ...x, nameAr: e.target.value } : x))} />
                    </div>
                    <div className="col-span-3">
                      <Label className="text-xs">{isRTL ? "اسم إنجليزي" : "English Name"}</Label>
                      <Input className="h-8 text-xs" value={extra.nameEn} onChange={(e) => setProductExtrasState(ex => ex.map((x, i) => i === idx ? { ...x, nameEn: e.target.value } : x))} />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">{isRTL ? "سعر إضافي" : "Extra Price"}</Label>
                      <Input className="h-8 text-xs" type="number" value={extra.price} onChange={(e) => setProductExtrasState(ex => ex.map((x, i) => i === idx ? { ...x, price: e.target.value } : x))} />
                    </div>
                    <div className="col-span-1 flex items-center gap-1 pb-1">
                      <Switch checked={extra.isDefault} onCheckedChange={(v) => setProductExtrasState(ex => ex.map((x, i) => i === idx ? { ...x, isDefault: v } : x))} />
                      <span className="text-xs">{isRTL ? "افتراضي" : "Def"}</span>
                    </div>
                    <div className="col-span-1 flex justify-end pb-1">
                      <Button size="sm" variant="ghost" className="w-7 h-7 p-0 text-red-500" onClick={() => setProductExtrasState(e => e.filter((_, i) => i !== idx))}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-white" onClick={handleSaveProduct}
                disabled={createProductMutation.isPending || updateProductMutation.isPending}>
                {t.admin.save}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => { setShowProductForm(false); setEditingProduct(null); resetProductForm(); }}>
                {t.admin.cancel}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
