/**
 * Skema Validasi & Tipe Data Autentikasi (Auth):
 * Menggunakan pustaka Zod untuk memvalidasi input formulir di sisi klien (client-side)
 * sebelum dikirimkan ke server.
 */

import * as z from "zod";

/**
 * Skema validasi untuk Form Login:
 * - email: wajib diisi, otomatis di-trim, harus format email valid
 * - password: wajib diisi, harus tepat 6 karakter
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email wajib diisi" })
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(6, { message: "Password Harus 6 Karakter" })
    .max(6, { message: "Password Harus 6 Karakter" }),
});

/**
 * Skema validasi untuk Form Registrasi:
 * - fullname: wajib diisi, maksimal 100 karakter
 * - email: format email valid, maksimal 150 karakter
 * - password: harus tepat 6 karakter
 * - confirm_password: harus persis sama dengan nilai password
 */
export const registerSchema = z
  .object({
    fullname: z
      .string()
      .trim()
      .min(1, { message: "Nama lengkap wajib diisi" })
      .max(100, "Nama maksimal 100 karakter"),
    email: z
      .string()
      .trim()
      .min(1, { message: "Email wajib diisi" })
      .email("Format email tidak valid")
      .max(150, "Email maksimal 150 karakter"),
    password: z
      .string()
      .min(6, { message: "Password Harus 6 Karakter" })
      .max(6, { message: "Password Harus 6 Karakter" }),
    confirm_password: z
      .string()
      .min(1, { message: "Konfirmasi password wajib diisi" }),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Konfirmasi password tidak cocok",
  });

// Tipe TypeScript yang diturunkan otomatis dari skema Zod
export type LoginType = z.infer<typeof loginSchema>;
export type RegisterType = z.infer<typeof registerSchema>;
