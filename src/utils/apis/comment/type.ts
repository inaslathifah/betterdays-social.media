/**
 * Tipe Data & Skema Validasi Komentar (Comment):
 * Menangani validasi pengiriman komentar baru dan struktur data komentar tersimpan.
 */

import { z } from "zod";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_MB,
  MAX_UPLOAD_SIZE,
  isSafeImageUrl,
} from "@/utils/image";

/**
 * Skema validasi pembuatan komentar baru:
 * - post_id: ID postingan tujuan komentar
 * - comment: teks komentar (maksimal 1000 karakter)
 * - image: berkas gambar yang diunggah pengguna (opsional)
 * - image_url: tautan URL gambar eksternal (opsional)
 * - refine: minimal salah satu dari teks komentar atau gambar harus ada
 */
export const commentSchema = z
  .object({
    post_id: z.number(),
    comment: z.string().trim().max(1000, "Maksimal 1000 karakter"),
    image: z
      .instanceof(File)
      .refine(
        (file) => file.name === "" || file.size <= MAX_UPLOAD_SIZE,
        `Ukuran gambar maksimal ${MAX_MB}MB`
      )
      .refine(
        (file) => file.name === "" || ACCEPTED_IMAGE_TYPES.includes(file.type),
        "Hanya format JPG, PNG, atau WEBP yang didukung"
      ),
    image_url: z
      .string()
      .trim()
      .refine(
        (v) => v === "" || isSafeImageUrl(v),
        "URL gambar tidak valid (harus diawali http:// atau https://)"
      ),
  })
  .refine((d) => d.comment !== "" || d.image.name !== "" || d.image_url !== "", {
    path: ["comment"],
    message: "Tulis komentar atau lampirkan gambar",
  });

// Tipe data input formulir komentar
export type CommentType = z.infer<typeof commentSchema>;

/**
 * Entitas Baris Komentar (IComments):
 * Berisi ID, nama penulis, avatar, teks komentar, lampiran gambar, dan waktu dibuat.
 */
export interface IComments {
  id: number;
  post_id: number;
  user_id: number;
  name: string;
  avatar: string | null;
  comment: string;
  image: string | null;
  created_at: string;
}
