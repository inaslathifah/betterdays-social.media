/**
 * Komponen Input & Badge Lokasi (LocationAttach):
 * Memungkinkan pengguna menambahkan lokasi ke postingan atau komentar
 */

import { useState } from "react";
import { MapPin, X, Check, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface LocationButtonProps {
  location?: string | null;
  onSelect: (location: string) => void;
  onRemove: () => void;
  disabled?: boolean;
  className?: string;
  size?: "default" | "sm";
  showLabel?: boolean;
}

const POPULAR_LOCATIONS = [
  "Jakarta, Indonesia",
  "Bandung, Jawa Barat",
  "Surabaya, Jawa Timur",
  "Yogyakarta, DIY",
  "Denpasar, Bali",
  "Medan, Sumatera Utara",
  "Semarang, Jawa Tengah",
  "Makassar, Sulawesi Selatan",
];

export function LocationButton({
  location,
  onSelect,
  onRemove,
  disabled,
  className,
  size = "default",
  showLabel = true,
}: LocationButtonProps) {
  const [open, setOpen] = useState(false);
  const [customText, setCustomText] = useState("");
  const [detecting, setDetecting] = useState(false);

  const handleApplyCustom = () => {
    if (customText.trim()) {
      onSelect(customText.trim());
      setCustomText("");
      setOpen(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      onSelect("Indonesia");
      setOpen(false);
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=10`
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.county ||
            data.address?.state ||
            "Indonesia";
          const country = data.address?.country || "Indonesia";
          onSelect(`${city}, ${country}`);
        } catch {
          onSelect("Indonesia");
        } finally {
          setDetecting(false);
          setOpen(false);
        }
      },
      () => {
        setDetecting(false);
        onSelect("Indonesia");
        setOpen(false);
      },
      { timeout: 7000 }
    );
  };

  if (location) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 text-foreground transition-all",
          size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs",
          className
        )}
      >
        <MapPin className={cn("text-primary shrink-0", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
        <span className="max-w-[200px] truncate font-medium">{location}</span>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="rounded-full p-0.5 text-muted-foreground hover:bg-background/80 hover:text-foreground focus-visible:outline-none"
          title="Hapus lokasi"
        >
          <X className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
        </button>
      </div>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={size === "sm" ? "sm" : "default"}
          disabled={disabled}
          className={cn(
            "gap-1.5 rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
            size === "sm" ? "h-8 px-2 text-xs" : "h-9 px-3 text-sm",
            className
          )}
          aria-label="Tambahkan lokasi"
        >
          <MapPin className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
          {showLabel && <span>Tambahkan lokasi</span>}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 p-2" align="start">
        <DropdownMenuLabel className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Cari atau Pilih Lokasi
        </DropdownMenuLabel>

        <div className="flex items-center gap-1.5 px-2 py-1.5">
          <Input
            value={customText}
            placeholder="Ketik nama lokasi..."
            className="h-8 text-xs"
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApplyCustom();
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="brand"
            className="h-8 w-8 shrink-0 p-0"
            disabled={!customText.trim()}
            onClick={handleApplyCustom}
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>

        <DropdownMenuItem
          className="cursor-pointer gap-2 px-2 py-1.5 text-xs text-primary"
          onClick={handleDetectLocation}
          disabled={detecting}
        >
          <Navigation className="h-3.5 w-3.5" />
          <span>{detecting ? "Mendeteksi..." : "Gunakan lokasi saat ini"}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />

        <div className="max-h-48 overflow-y-auto">
          {POPULAR_LOCATIONS.map((loc) => (
            <DropdownMenuItem
              key={loc}
              className="cursor-pointer gap-2 px-2 py-1.5 text-xs"
              onClick={() => {
                onSelect(loc);
                setOpen(false);
              }}
            >
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="truncate">{loc}</span>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
