/**
 * Komponen Tombol Pengalih Tema (Theme Toggle):
 * Menggunakan library `next-themes` untuk beralih antara Mode Terang (Light)
 * dan Mode Gelap (Dark) dengan animasi ikon Sun / Moon.
 */

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-full text-muted-foreground"
      aria-label={dark ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {/* Tampilkan ikon matahari saat tema gelap aktif, dan bulan saat tema terang aktif */}
      {dark ? (
        <Sun className="h-[18px] w-[18px]" />
      ) : (
        <Moon className="h-[18px] w-[18px]" />
      )}
    </Button>
  );
}
