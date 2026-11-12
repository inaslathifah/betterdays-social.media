/**
 * Komponen Tombol Suka (LikeButton):
 * Menampilkan ikon hati (Heart) dan angka jumlah like.
 * - Berwarna brand (merah/accent) dan hati terisi penuh (fill-current) jika sudah disukai (liked: true).
 * - Berwarna abu-abu lembut jika belum disukai.
 * - Efek animasi sentuhan/klik (scale-90).
 */

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  liked: boolean; // Status apakah user sudah menyukai postingan ini
  count: number; // Total jumlah orang yang menyukai postingan
  onToggle: () => void; // Fungsi callback saat tombol like diklik
}

export default function LikeButton({ liked, count, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={liked}
      aria-label={liked ? "Batalkan suka" : "Sukai postingan"}
      className={cn(
        "group inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        liked
          ? "text-brand"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      <Heart
        className={cn(
          "h-[18px] w-[18px] transition-transform group-active:scale-90",
          liked && "fill-current"
        )}
      />
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
