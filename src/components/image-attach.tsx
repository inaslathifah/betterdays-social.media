/**
 * Komponen Penanganan Lampiran Gambar (Image Attachments):
 * Terdiri dari 3 sub-komponen:
 * 1. ImageMenu: Tombol dropdown untuk memilih sumber gambar (Upload file dari perangkat atau Tempel URL eksternal).
 * 2. ImagePreview: Thumbnail pratinjau gambar dengan tombol silang (X) untuk menghapus pilihan gambar.
 * 3. UrlInput: Kolom input teks untuk menempel tautan URL gambar (dengan tombol silang untuk membatalkan).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Link2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ACCEPT_ATTR, isSafeImageUrl, validateImageFile } from "@/utils/image";

/* Props untuk ImageMenu */
interface MenuProps {
  onPickFile: (file: File) => void;
  onPickUrl: () => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  align?: "start" | "end";
}

/**
 * Menu Dropdown Pemilih Metode Unggah Gambar
 */
export function ImageMenu(props: MenuProps) {
  const { onPickFile, onPickUrl, disabled, className, align = "start" } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      {/* Input File Tersembunyi */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="hidden"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = ""; // Reset value agar user bisa memilih file yang sama berulang kali
          if (!file) return;
          const error = validateImageFile(file);
          if (error) return toast.error(error);
          onPickFile(file);
        }}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            aria-label={props.label ?? "Lampirkan gambar"}
            className={cn(
              "h-9 w-9 rounded-full text-muted-foreground hover:text-foreground",
              className
            )}
          >
            <ImagePlus className="h-[18px] w-[18px]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} className="w-56 rounded-xl p-1.5">
          <DropdownMenuItem
            className="gap-2.5 rounded-lg py-2 cursor-pointer"
            onSelect={() => inputRef.current?.click()}
          >
            <Upload className="h-4 w-4 text-muted-foreground" />
            Upload dari device kamu
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2.5 rounded-lg py-2 cursor-pointer"
            onSelect={onPickUrl}
          >
            <Link2 className="h-4 w-4 text-muted-foreground" />
            Tempel URL gambar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

/* Props untuk ImagePreview */
interface PreviewProps {
  file?: File | null;
  url?: string;
  existingSrc?: string | null;
  onRemove?: () => void;
  className?: string;
  size?: "md" | "sm";
}

/**
 * Pratinjau Gambar (Thumbnail) dengan Tombol Hapus (X)
 */
export function ImagePreview(props: PreviewProps) {
  const { file, url, existingSrc, onRemove, className, size = "md" } = props;
  const [broken, setBroken] = useState(false);

  // Buat Object URL sementara jika gambar berupa File lokal
  const objectUrl = useMemo(
    () => (file && file.size > 0 ? URL.createObjectURL(file) : null),
    [file]
  );
  useEffect(
    () => () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    },
    [objectUrl]
  );

  const src =
    objectUrl ??
    (url && isSafeImageUrl(url) ? url : null) ??
    existingSrc ??
    null;

  useEffect(() => setBroken(false), [src]);

  if (!src) return null;

  return (
    <div className={cn("relative inline-block max-w-full", className)}>
      {broken ? (
        <div
          className={cn(
            "flex items-center justify-center rounded-xl border border-dashed text-xs text-muted-foreground",
            size === "md" ? "h-28 w-44" : "h-16 w-24"
          )}
        >
          Gambar tidak dapat dimuat
        </div>
      ) : (
        <img
          src={src}
          alt="Pratinjau lampiran"
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
          className={cn(
            "rounded-xl border object-cover",
            size === "md" ? "max-h-44 max-w-full" : "h-16 w-auto max-w-[8rem]"
          )}
        />
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Hapus lampiran"
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/* Props untuk UrlInput */
interface UrlProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  error?: string;
  className?: string;
}

/**
 * Kolom Input Khusus Menempelkan URL Gambar
 */
export function UrlInput({ value, onChange, onClose, error, className }: UrlProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          autoFocus
          type="url"
          inputMode="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "Enter") e.preventDefault();
          }}
          placeholder="https://contoh.com/gambar.jpg"
          className="h-9 rounded-lg text-[13px]"
          aria-label="URL gambar"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-full text-muted-foreground"
          onClick={onClose}
          aria-label="Tutup input URL"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      {error && <p className="mt-1.5 pl-6 text-xs text-destructive">{error}</p>}
    </div>
  );
}
