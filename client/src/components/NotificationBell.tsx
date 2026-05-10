import { useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck, Package, Leaf } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Link } from "wouter";

const POLL_INTERVAL_MS = 30_000; // 30 seconds

export default function NotificationBell() {
  const { lang, isRTL } = useLang();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const prevCountRef = useRef<number | null>(null);
  const utils = trpc.useUtils();

  // ── Unread count (polled every 30s) ──────────────────────────────────────
  const { data: countData } = trpc.notifications.unreadCount.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: true,
  });

  const unreadCount = countData?.count ?? 0;

  // ── Notification list (fetched on dropdown open) ──────────────────────────
  const { data: notifications, refetch: refetchList } = trpc.notifications.list.useQuery(
    { limit: 20 },
    { enabled: isAuthenticated && open }
  );

  // ── Mutations ─────────────────────────────────────────────────────────────
  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      utils.notifications.unreadCount.invalidate();
      utils.notifications.list.invalidate();
    },
  });

  const markAllReadMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.unreadCount.invalidate();
      utils.notifications.list.invalidate();
    },
  });

  // ── Show toast when new notification arrives ──────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    if (prevCountRef.current === null) {
      prevCountRef.current = unreadCount;
      return;
    }
    if (unreadCount > prevCountRef.current) {
      // New notification arrived — fetch list to get the latest message
      refetchList().then(({ data }) => {
        const latest = data?.[0];
        if (latest && !latest.isRead) {
          const title = lang === "ar" ? latest.titleAr : latest.titleEn;
          const message = lang === "ar" ? latest.messageAr : latest.messageEn;
          toast(title, {
            description: message,
            icon: <Leaf className="w-4 h-4 text-primary" />,
            duration: 6000,
            action: latest.orderNumber
              ? {
                  label: lang === "ar" ? "تتبع الطلب" : "Track Order",
                  onClick: () => (window.location.href = "/orders"),
                }
              : undefined,
          });
        }
      });
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount, isAuthenticated]);

  if (!isAuthenticated) return null;

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) refetchList();
  };

  const handleMarkRead = (id: number) => {
    markReadMutation.mutate({ id });
  };

  const handleMarkAll = () => {
    markAllReadMutation.mutate();
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (lang === "ar") {
      if (diffMins < 1) return "الآن";
      if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      return `منذ ${diffDays} يوم`;
    } else {
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative w-9 h-9 rounded-full hover:bg-primary/10"
          aria-label={lang === "ar" ? "الإشعارات" : "Notifications"}
        >
          <Bell className="w-5 h-5 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={isRTL ? "start" : "end"}
        className="w-80 p-0 shadow-xl border border-border rounded-2xl overflow-hidden"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary/5 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm text-foreground">
              {lang === "ar" ? "الإشعارات" : "Notifications"}
            </span>
            {unreadCount > 0 && (
              <span className="bg-primary text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              {lang === "ar" ? "قراءة الكل" : "Mark all read"}
            </button>
          )}
        </div>

        {/* Notification List */}
        <ScrollArea className="max-h-[360px]">
          {!notifications || notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                <Bell className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                {lang === "ar" ? "لا توجد إشعارات" : "No notifications yet"}
              </p>
              <p className="text-xs text-muted-foreground">
                {lang === "ar"
                  ? "ستظهر هنا تحديثات طلباتك"
                  : "Your order updates will appear here"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex gap-3 px-4 py-3 transition-colors cursor-pointer group ${
                    !notif.isRead
                      ? "bg-primary/5 hover:bg-primary/10"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                >
                  {/* Icon */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      !notif.isRead ? "bg-primary/15" : "bg-muted"
                    }`}
                  >
                    <Package
                      className={`w-4 h-4 ${!notif.isRead ? "text-primary" : "text-muted-foreground"}`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p
                        className={`text-sm leading-snug ${
                          !notif.isRead ? "font-semibold text-foreground" : "font-medium text-foreground/80"
                        }`}
                      >
                        {lang === "ar" ? notif.titleAr : notif.titleEn}
                      </p>
                      {!notif.isRead && (
                        <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                      {lang === "ar" ? notif.messageAr : notif.messageEn}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {formatTime(notif.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications && notifications.length > 0 && (
          <>
            <Separator />
            <div className="px-4 py-2.5 bg-muted/30">
              <Link
                href="/orders"
                onClick={() => setOpen(false)}
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors flex items-center justify-center gap-1"
              >
                {lang === "ar" ? "عرض جميع الطلبات" : "View all orders"}
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
