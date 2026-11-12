/**
 * File Titik Masuk Utama (Main Entry Point) React:
 * Menginisialisasi React DOM ke elemen #root di index.html,
 * serta membungkus aplikasi dengan Provider global:
 * 1. ThemeProvider: Untuk pengaturan tema Gelap/Terang (Dark/Light mode).
 * 2. TokenProvider: Mengelola state sesi login dan autentikasi token.
 * 3. Toaster: Komponen notifikasi pop-up (toast) menggunakan sonner.
 * 4. App: Router utama aplikasi Betterdays.
 */

import ReactDOM from "react-dom/client";
import { ThemeProvider } from "next-themes";
// Import font web Newsreader (serif) dan Hanken Grotesk (sans-serif)
import "@fontsource-variable/newsreader";
import "@fontsource-variable/newsreader/wght-italic.css";
import "@fontsource-variable/hanken-grotesk";
import App from "./routes/";
import "./styles/index.css";
import { TokenProvider } from "./utils/contexts/token";
import { Toaster } from "./components/ui/sonner";

// Render tree komponen aplikasi ke elemen HTML root
ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <TokenProvider>
      {/* Notifikasi toast yang muncul di bagian tengah atas layar */}
      <Toaster position="top-center" />
      {/* Navigasi dan rute halaman aplikasi */}
      <App />
    </TokenProvider>
  </ThemeProvider>
);
