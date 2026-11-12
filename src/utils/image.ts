/**
 * Utilitas Pengolahan & Validasi Gambar:
 * Mengatur batasan upload gambar, validasi tipe file & ukuran,
 * konversi gambar lokal ke Data URL (Base64 JPEG terkompresi) via Canvas HTML5,
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
 * Mengonversi File gambar menjadi Base64 Data URL JPEG yang sudah di-resize & dikompres.
 * Tujuannya agar gambar yang disimpan di mock localStorage tidak menghabiskan kuota browser.
 * 
 * @param file Berkas gambar asli yang dipilih pengguna
 * @param maxDim Batas dimensi maksimal lebar/tinggi dalam pixel (default: 1280px)
 */
export function fileToDataURL(file: File, maxDim = 1280): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      // Hitung skala rasio agar tidak melebihi maxDim
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));

      // Buat elemen canvas di latar belakang untuk me-render ulang
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        return reject(new Error("Gambar tidak dapat diproses"));
      }

      // Beri background putih untuk gambar PNG transparan sebelum dikonversi ke JPEG
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(objectUrl);

      // Simpan sebagai JPEG dengan kualitas kompresi 82%
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Berkas bukan gambar yang valid"));
    };
    img.src = objectUrl;
  });
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
