/**
 * Utilitas Pengolahan & Validasi Gambar:
 * Mengatur batasan upload gambar, validasi tipe file & ukuran (pemrosesan akhir dilakukan backend),
 * serta pembuatan inisial huruf nama pengguna untuk avatar cadangan.
 */

// Batas ukuran maksimal upload gambar (2 Megabyte)
export const MAX_MB = 2;
export const MAX_UPLOAD_SIZE = 1024 * 1024 * MAX_MB;

// Daftar tipe MIME gambar yang diperbolehkan
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// String atribut `accept` untuk elemen <input type="file">
export const ACCEPT_ATTR = "image/png, image/jpeg, image/jpg, image/webp";

/**
 * Memvalidasi berkas file gambar yang diupload pengguna.
 * Mengembalikan string pesan error jika tidak lolos validasi, atau `null` jika valid.
 */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Hanya format JPG, PNG, atau WEBP yang didukung";
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    return `Ukuran gambar maksimal ${MAX_MB}MB`;
  }
  return null;
}

/**
 * Memastikan URL gambar aman untuk dimuat (hanya protokol http/https, mencegah XSS javascript:).
 */
export function isSafeImageUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Mengambil inisial nama pengguna (maksimal 2 karakter pertama, huruf kapital).
 * Contoh: "Inas Lathifah" -> "IL", "Rakha" -> "R".
 */
export function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}
