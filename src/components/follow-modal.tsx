/**
 * Modal Daftar Pengikut & Yang Diikuti (FollowModal):
 * Menampilkan daftar pengguna (followers / following),
 * lengkap dengan foto profil, nama, bio, dan tombol Ikuti/Mengikuti.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UserAvatar from "./user-avatar";
import { IFollowUser } from "@/utils/apis/user/type";
import {
  getUserFollowers,
  getUserFollowing,
  toggleFollowUser,
} from "@/utils/apis/user/api";
import { useToken } from "@/utils/contexts/token";
import { toast } from "sonner";

interface Props {
  userId: number;
  type: "followers" | "following" | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFollowChange?: () => void;
}

export default function FollowModal({
  userId,
  type,
  open,
  onOpenChange,
  onFollowChange,
}: Props) {
  const { user: me } = useToken();
  const [list, setList] = useState<IFollowUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!open || !type || !userId) return;

    let isMounted = true;
    setLoading(true);

    const fetchUsers = async () => {
      try {
        const res =
          type === "followers"
            ? await getUserFollowers(userId)
            : await getUserFollowing(userId);
        if (isMounted) setList(res.data);
      } catch (err) {
        toast.error((err as Error).message || "Gagal memuat data");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [open, type, userId]);

  const handleToggle = async (targetUser: IFollowUser) => {
    setActionLoading(targetUser.id);
    try {
      const res = await toggleFollowUser(targetUser.id);
      const nextFollowStatus = res.data.following;
      setList((prev) =>
        prev.map((u) =>
          u.id === targetUser.id ? { ...u, is_following: nextFollowStatus } : u
        )
      );
      onFollowChange?.();
    } catch (err) {
      toast.error((err as Error).message || "Gagal mengubah status ikuti");
    } finally {
      setActionLoading(null);
    }
  };

  const title = type === "followers" ? "Pengikut" : "Mengikuti";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-center text-base font-semibold">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-border/40">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Memuat {title.toLowerCase()}...
            </div>
          ) : list.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {type === "followers"
                ? "Belum ada pengikut."
                : "Belum mengikuti siapapun."}
            </div>
          ) : (
            list.map((u) => {
              const isMe = me?.id === u.id;
              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-muted/40 rounded-xl"
                >
                  <Link
                    to={isMe ? "/profile" : `/user/${u.id}`}
                    onClick={() => onOpenChange(false)}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <UserAvatar
                      name={u.name}
                      src={u.avatar}
                      className="h-10 w-10 text-sm shrink-0"
                    />
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="truncate text-sm font-medium hover:underline">
                        {u.name}
                      </p>
                      {u.bio && (
                        <p className="truncate text-xs text-muted-foreground">
                          {u.bio}
                        </p>
                      )}
                    </div>
                  </Link>

                  {!isMe && me && (
                    <Button
                      size="sm"
                      variant={u.is_following ? "outline" : "brand"}
                      className="h-8 px-3 text-xs rounded-full font-medium shrink-0"
                      disabled={actionLoading === u.id}
                      onClick={() => handleToggle(u)}
                    >
                      {actionLoading === u.id
                        ? "..."
                        : u.is_following
                        ? "Mengikuti"
                        : "Ikuti"}
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
