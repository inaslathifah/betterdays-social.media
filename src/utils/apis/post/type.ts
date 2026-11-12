/**
 * Tipe Data & Skema Validasi Postingan (Post):
 * Mendefinisikan format data postingan, skema validasi pembuatan post baru
 * menggunakan Zod, serta tipe respon status Like dan komentar.
 */

import { z } from "zod";
import { IComments } from "../comment/type";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_MB,
  MAX_UPLOAD_SIZE,
  isSafeImageUrl,
} from "@/utils/image";

/**
 * Skema validasi pembuatan postingan (Create Post):
 * - image: lampiran file gambar (opsional, maks 2MB, JPG/PNG/WEBP)
 * - image_url: tautan URL gambar eksternal (opsional, aman http/https)
 * - caption: teks postingan (maksimal 2000 karakter)
 * - refine: minimal salah satu dari caption atau gambar harus diisi
 */
export const createPostSchema = z
  .object({
    // File kosong (name === "") berarti pengguna tidak memilih berkas file
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
    caption: z.string().trim().max(2000, "Maksimal 2000 karakter"),
  })
  .refine((d) => d.caption !== "" || d.image.name !== "" || d.image_url !== "", {
    path: ["caption"],
    message: "Tulis sesuatu atau lampirkan gambar",
  });

// Tipe data input pembuatan post baru
export type createPostType = z.infer<typeof createPostSchema>;

// Tipe data input pembaruan post (dilengkapi flag opsional remove_image)
export type updatePostType = createPostType & { remove_image?: boolean };

/**
 * Entitas Postingan Lengkap (IPost):
 * Digunakan pada timeline beranda dan halaman profil.
 */
export interface IPost {
  id: number;
  user_id: number;
  name: string;
  avatar: string | null;
  created_at: string;
  updated_at: string | null;
  image: string | null;
  caption: string;
  likes_count: number;
  liked: boolean;
  comments: IComments[];
}

export interface IPostWithComments<C = []> extends Omit<IPost, "comments"> {
  comments: C;
}

export type { IComments };

/**
 * Hasil kembalian API saat tombol like ditekan (status like user & total jumlah like)
 */
export interface ILikeResult {
  liked: boolean;
  likes_count: number;
}
