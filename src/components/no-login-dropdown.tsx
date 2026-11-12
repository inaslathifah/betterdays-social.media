/**
 * Komponen Dropdown Menu Pengunjung Tamu (Belum Login):
 * Menampilkan avatar anonim ("?") di navbar yang dapat diklik
 * untuk membuka opsi cepat: Masuk (Login) atau Daftar (Register).
 */

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

export default function NoLoginDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Menu Masuk atau Daftar">
        <Avatar>
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40 p-2" align="end">
        {/* Tautan ke Halaman Login */}
        <Link to="/login">
          <DropdownMenuItem className="cursor-pointer">
            <LogIn className="w-5 text-muted-foreground" />
            <p className="ms-2">Masuk</p>
          </DropdownMenuItem>
        </Link>
        {/* Tautan ke Halaman Registrasi */}
        <Link to="/register">
          <DropdownMenuItem className="cursor-pointer">
            <UserPlus className="w-5 text-muted-foreground" />
            <p className="ms-2">Daftar</p>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
