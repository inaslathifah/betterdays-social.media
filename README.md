<div align="center">

# 🌟 Betterdays Social Media

**Platform media sosial modern yang dibangun dengan React, TypeScript, dan Vite.**

[![React](https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-97%25-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Ready-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-Fast-646CFF?style=for-the-badge&logo=vitejs)](https://vitejs.dev/)

</div>

👩‍💻 Kontributor
Inas Lathifah - Creator & Lead Developer

---

## 📖 Tentang Proyek

**Betterdays** adalah aplikasi web media sosial interaktif yang dirancang untuk memberikan pengalaman pengguna yang mulus dalam berbagi momen, berinteraksi, dan mengelola konten. Proyek ini dibangun dengan fokus pada performa tinggi menggunakan tumpukan teknologi modern frontend serta sistem manajemen data yang fleksibel.

---

## 🚀 Fitur Utama

- **Backend nyata + MySQL:** semua data (akun, postingan, komentar, balasan bercabang, like) tersimpan di database MySQL lewat REST API Express (repositori terpisah: `be-sosial-media`).
- **Upload gambar:** foto profil, gambar postingan, dan gambar komentar diunggah ke server. Gambar divalidasi dari isinya, di-resize, metadata EXIF dibuang, lalu disimpan sebagai WEBP; path-nya disimpan di database.
- **Akun & keamanan:** registrasi/login dengan JWT, password di-hash `bcrypt`, ganti password/nama/bio/foto profil, hapus akun.
- **Interaksi sosial:** like, komentar, replies, lihat profil pengguna lain.
- **UI modern:** antarmuka responsif dengan [shadcn/ui](https://ui.shadcn.com/) dan Tailwind CSS.

---

## 🛠️ Tech Stack

- **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/) + TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Express 5 (JavaScript) + `mysql2`, JWT, `bcryptjs`, `multer` + `sharp`, `zod`
- **Database:** MySQL / MariaDB (XAMPP)

---

## 📦 Memulai Cepat (Installation & Running)

Prasyarat: **Node.js 20+** dan MySQL yang sedang menyala (XAMPP).

### 1. Jalankan Backend dulu
Ikuti petunjuk di `README.md` pada folder backend (`be-sosial-media`). 
Setelah berhasil, API aktif di `http://localhost:8000`.

### 2. Jalankan Frontend
```bash
git clone https://github.com/inaslathifah/betterdays-social.media.git
```
```bash
cd betterdays-social.media
```
```bash
npm install
```
```bash
npm run dev              # buka http://localhost:5173
```