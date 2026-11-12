/**
 * Komponen Layout Utama:
 * Membungkus seluruh tampilan halaman dengan struktur konsisten:
 * - Navbar di bagian atas (bisa transparan atau memiliki border & backdrop blur)
 * - Area konten <main> di tengah dengan lebar maksimal responsif (720px)
 * - Footer di bagian bawah halaman
 */

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import Navbar from "./navbar";
import Footer from "./footer";

interface Props {
  children: ReactNode;
  centerX?: boolean; // Pusatkan konten secara horizontal (items-center)
  centerY?: boolean; // Pusatkan konten secara vertikal (justify-center, misalnya di login/register)
  withUser?: boolean; // Tampilkan navigasi pengguna & menu akun di navbar
  navBlue?: boolean; // Berikan efek border bawah dan latar belakang blur pada navbar
  containerTranparant?: boolean;
}

export default function Layout(props: Props) {
  const { children, centerX, centerY, withUser, navBlue } = props;

  return (
    <div className="flex h-dvh w-full flex-col overflow-auto bg-background">
      {/* Navbar Atas */}
      <Navbar withUser={withUser} navBlue={navBlue} />

      {/* Kontainer Konten Utama */}
      <main
        className={cn(
          "mx-auto flex w-full max-w-[720px] grow flex-col px-4 py-8 sm:px-6",
          centerX && "items-center",
          centerY && "justify-center"
        )}
      >
        {children}
      </main>

      {/* Footer Kaki Halaman */}
      <Footer />
    </div>
  );
}
