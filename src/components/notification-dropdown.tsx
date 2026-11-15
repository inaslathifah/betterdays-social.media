/**
 * Komponen Dropdown Notifikasi (NotificationDropdown):
 * Menampilkan ikon lonceng di navbar dengan indikator jumlah notifikasi belum dibaca,
 * serta daftar aktivitas terkini (like, komentar, follow).
 */

import { useCallback, useEffect, useState } from "react";
import { Bell, Heart, MessageCircle, UserPlus, CheckCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { timeAgo } from "@/utils/date";
import UserAvatar from "./user-avatar";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/utils/apis/notification/api";
import { INotification } from "@/utils/apis/notification/type";
import { useToken } from "@/utils/contexts/token";

export default function NotificationDropdown() {
  const { token } = useToken();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await getUnreadNotificationCount();
      setUnreadCount(res.data.unread_count);
    } catch {
      // Abaikan error
    }
  }, [token]);

  const fetchList = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch {
      // Abaikan error
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 20000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (open) {
      fetchList();
      fetchUnreadCount();
    }
  }, [open, fetchList, fetchUnreadCount]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // Error
    }
  };

  const handleItemClick = async (notif: INotification) => {
    if (!notif.is_read) {
      try {
        await markNotificationRead(notif.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
      } catch {
        // Error
      }
    }

    setOpen(false);

    if (notif.type === "follow") {
      navigate(`/user/${notif.actor_id}`);
    } else if (notif.post_id) {
      navigate(`/post/${notif.post_id}`);
    }
  };

  if (!token) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Buka notifikasi"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between p-3.5 border-b">
          <DropdownMenuLabel className="p-0 text-base font-semibold">
            Notifikasi
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Tandai dibaca
            </Button>
          )}
        </div>

        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/50">
          {loading && notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Memuat notifikasi...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Bell className="mx-auto mb-2 h-7 w-7 opacity-30" />
              Belum ada notifikasi
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors ${
                  !n.is_read ? "bg-primary/5 font-medium" : ""
                }`}
              >
                <div className="relative shrink-0">
                  <UserAvatar
                    name={n.actor_name}
                    src={n.actor_avatar}
                    className="h-9 w-9 text-xs"
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-background ring-1 ring-border text-[9px]">
                    {n.type === "like" && <Heart className="h-2.5 w-2.5 fill-red-500 text-red-500" />}
                    {n.type === "comment" && <MessageCircle className="h-2.5 w-2.5 text-blue-500" />}
                    {n.type === "follow" && <UserPlus className="h-2.5 w-2.5 text-emerald-500" />}
                  </span>
                </div>

                <div className="min-w-0 flex-1 leading-snug">
                  <p className="text-xs text-foreground">
                    <span className="font-semibold">{n.actor_name}</span>{" "}
                    {n.type === "like" && "menyukai postingan kamu."}
                    {n.type === "comment" && "mengomentari postingan kamu."}
                    {n.type === "follow" && "mulai mengikuti kamu."}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {timeAgo(n.created_at)}
                  </p>
                </div>

                {!n.is_read && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
