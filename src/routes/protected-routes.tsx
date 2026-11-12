/**
 * Komponen Penjaga Rute (Protected Routes / Route Guard):
 * Mengontrol navigasi berdasarkan status autentikasi pengguna (token):
 * 1. Mencegah user yang SUDAH login membuka halaman /login dan /register (redirect ke Beranda "/").
 * 2. Mencegah user yang BELUM login membuka halaman privat (/, /profile, /edit-profile, /post/:id)
 *    dan mengarahkannya ke /login dengan pesan notifikasi toast peringatan.
 */

import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useToken } from "@/utils/contexts/token";

// Daftar halaman khusus tamu (guest only) — jika sudah login akan dialihkan ke "/"
const authProtected = ["/login", "/register"];

// Daftar halaman yang wajib memiliki token login aktif
const protectedByToken = ["/", "/profile", "/edit-profile"];

// Helper untuk mengecek apakah rute tertentu membutuhkan autentikasi
const needsLogin = (pathname: string) =>
  protectedByToken.includes(pathname) || pathname.startsWith("/post/");

/**
 * Komponen pembantu untuk menampilkan notifikasi toast peringatan sebelum redirect ke /login
 */
function LoginRequired() {
  useEffect(() => {
    toast.warning("Silakan login terlebih dahulu untuk mengakses halaman ini", {
      id: "login-required",
    });
  }, []);

  return <Navigate to="/login" replace />;
}

const ProtectedRoutes = () => {
  const { pathname } = useLocation();
  const { token } = useToken();

  // Melacak token sebelumnya untuk membedakan antara aksi logout manual dengan akses langsung tanpa login
  const prevToken = useRef(token);
  const justLoggedOut = prevToken.current !== "" && token === "";
  useEffect(() => {
    prevToken.current = token;
  }, [token]);

  // Jika sudah login dan mencoba ke halaman login/register -> redirect ke Beranda
  if (authProtected.includes(pathname)) {
    if (token) return <Navigate to="/" replace />;
  }

  // Jika halaman butuh login namun user tidak memiliki token
  if (needsLogin(pathname)) {
    if (!token) {
      // Jika baru saja logout, redirect langsung tanpa toast peringatan "Wajib login"
      return justLoggedOut ? <Navigate to="/login" replace /> : <LoginRequired />;
    }
  }

  // Jika lolos pengecekan, tampilkan komponen anak (halaman tujuan)
  return <Outlet />;
};

export default ProtectedRoutes;
