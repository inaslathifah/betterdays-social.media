/**
 * Utilitas Format Tanggal & Waktu:
 * Menggunakan library Day.js dengan plugin `relativeTime` dan bahasa Indonesia (`id`).
 */

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";

// Pasang plugin relative time (format "beberapa saat yang lalu", "5 menit yang lalu", dsb.)
dayjs.extend(relativeTime);
// Set bahasa standar ke Bahasa Indonesia
dayjs.locale("id");

/**
 * Mengubah ISO string menjadi format waktu relatif (misal: "baru saja", "10 menit yang lalu").
 * Jika perbedaan waktu kurang dari 45 detik, ditampilkan teks ramah "baru saja".
 */
export const timeAgo = (iso: string) => {
  const d = dayjs(iso);
  if (Date.now() - d.valueOf() < 45_000) return "baru saja";
  return d.fromNow();
};

/**
 * Mengubah ISO string menjadi format tanggal lengkap (contoh: "15 April 2026, 14.30").
 */
export const fullDate = (iso: string) =>
  dayjs(iso).format("D MMMM YYYY, HH.mm");
