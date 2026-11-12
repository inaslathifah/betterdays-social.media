/**
 * Tipe Data & Skema Validasi Pengguna (User):
 * Mendefinisikan profil user, validasi form update profil (nama, bio, avatar),
 * dan validasi form perubahan kata sandi (change password).
 */

import { z } from "zod";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_MB,
  MAX_UPLOAD_SIZE,
  isSafeImageUrl,
} from "@/utils/image";

/**
 * Entitas Profil Pengguna (IProfile)
 */
export interface IProfile {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  created_at: string;
}

/**
 * Skema validasi pembaruan profil pengguna:
 * - name: nama lengkap (wajib, maks 100 karakter)
 * - bio: biodata singkat (maks 300 karakter)
 * - avatar: file foto profil (opsional, maks 2MB, JPG/PNG/WEBP)
 * - avatar_url: link URL foto profil eksternal (opsional)
 * - remove_avatar: boolean penanda apakah ingin menghapus foto profil yang sudah ada
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Nama wajib diisi" })
    .max(100, "Nama maksimal 100 karakter"),
  bio: z.string().trim().max(300, "Bio maksimal 300 karakter"),
  avatar: z
    .instanceof(File)
    .refine(
      (file) => file.name === "" || file.size <= MAX_UPLOAD_SIZE,
      `Ukuran gambar maksimal ${MAX_MB}MB`
    )
    .refine(
      (file) => file.name === "" || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Hanya format JPG, PNG, atau WEBP yang didukung"
    ),
  avatar_url: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || isSafeImageUrl(v),
      "URL gambar tidak valid (harus diawali http:// atau https://)"
    ),
  remove_avatar: z.boolean(),
});

export type UpdateProfileType = z.infer<typeof updateProfileSchema>;

/**
 * Skema validasi pergantian kata sandi (Change Password):
 * - old_password: password saat ini (wajib diisi untuk verifikasi)
 * - new_password: password baru (minimal 6 karakter)
 * - confirm_password: harus cocok dengan new_password
 * - refine: password baru tidak boleh sama dengan password lama
 */
export const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, "Password lama wajib diisi"),
    new_password: z.string().min(6, "Password baru minimal 6 karakter"),
    confirm_password: z.string().min(1, "Konfirmasi password baru wajib diisi"),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    path: ["confirm_password"],
    message: "Konfirmasi password baru tidak cocok",
  })
  .refine((d) => d.old_password !== d.new_password, {
    path: ["new_password"],
    message: "Password baru harus berbeda dari password lama",
  });

export type ChangePasswordType = z.infer<typeof changePasswordSchema>;
