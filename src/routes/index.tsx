/**
 * Definisi Routing Aplikasi:
 * Menggunakan React Router DOM (createBrowserRouter).
 * Semua halaman dibungkus dalam ProtectedRoutes untuk mengatur hak akses pengguna
 * (halaman publik vs halaman yang butuh login).
 */

import Home from "@/pages";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import ProfilePage from "@/pages/profile-page";
import {
  Navigate,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import EditProfile from "@/pages/edit-profile";
import ProtectedRoutes from "./protected-routes";
import PostWithComment from "@/pages/post-with-comment";

// Konfigurasi daftar rute URL aplikasi
const router = createBrowserRouter([
  {
    // Komponen pembungkus pelindung rute
    element: <ProtectedRoutes />,
    children: [
      // Beranda / Timeline postingan (dapat diakses siapa saja, tapi buat post butuh login)
      { path: "/", element: <Home /> },
      // Halaman Masuk / Login (hanya untuk yang belum login)
      { path: "/login", element: <Login /> },
      // Halaman Registrasi Akun (hanya untuk yang belum login)
      { path: "/register", element: <Register /> },
      // Halaman Profil Pengguna yang sedang login (butuh login)
      { path: "/profile", element: <ProfilePage /> },
      // Halaman Edit Profil & Ganti Password (butuh login)
      { path: "/edit-profile", element: <EditProfile /> },
      // Halaman Detail Postingan beserta Komentarnya
      { path: "/post/:postID", element: <PostWithComment /> },
      // Fallback: Jika URL tidak cocok dengan apa pun, redirect ke Beranda ("/")
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

/**
 * Komponen App Router utama yang dipanggil oleh main.tsx.
 */
export default function App() {
  return <RouterProvider router={router} />;
}
