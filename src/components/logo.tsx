/**
 * Komponen Logo:
 * Menampilkan gambar ikon logo aplikasi Betterdays (logo.webp).
 * Mendukung kustomisasi ukuran dan gaya melalui properti `className`.
 */

import { cn } from "@/lib/utils";
import logo from "@/assets/logo.webp";

export default function Logo({ className }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="Logo Betterdays"
      aria-hidden="true"
      draggable={false}
      className={cn("h-7 w-7 select-none", className)}
    />
  );
}
