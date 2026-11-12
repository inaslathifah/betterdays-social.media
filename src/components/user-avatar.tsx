/**
 * Komponen Avatar Pengguna (UserAvatar):
 * Menampilkan foto profil pengguna (src).
 * Jika foto tidak ada atau gagal dimuat, secara otomatis menampilkan AvatarFallback
 * berupa huruf inisial nama dengan warna latar belakang lembut (pastel tones)
 * yang konsisten untuk nama yang sama.
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { initials } from "@/utils/image";

interface Props {
  name?: string; // Nama pengguna (dipakai untuk alt image dan inisial fallback)
  src?: string | null; // URL foto profil
  className?: string; // Kelas CSS tambahan untuk ukuran/border avatar
}

// Pilihan palet warna latar belakang pastel untuk inisial pengguna
const TONES = [
  "bg-[#f1e4d8]",
  "bg-[#dfe7dc]",
  "bg-[#e3ddd0]",
  "bg-[#e4e0f0]",
  "bg-[#f0dcdc]",
];

/**
 * Menghasilkan warna background pastel yang konsisten berdasarkan hash string nama pengguna
 */
function tone(name = "") {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

export default function UserAvatar({ name, src, className }: Props) {
  return (
    <Avatar className={cn("h-10 w-10", className)}>
      {/* Gambar Foto Profil */}
      {src ? (
        <AvatarImage
          src={src}
          alt={name ? `Foto profil ${name}` : "Foto profil"}
          referrerPolicy="no-referrer"
          className="object-cover"
        />
      ) : null}

      {/* Tampilan Pengganti (Fallback) jika Foto Kosong / Gagal Dimuat */}
      <AvatarFallback
        className={cn(
          "text-[0.8em] font-medium text-[#3d3a35]",
          tone(name)
        )}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
