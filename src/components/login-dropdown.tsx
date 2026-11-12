/**
 * Komponen Dropdown Menu Pengguna yang Sudah Login:
 * Menampilkan ringkasan info user (avatar, nama, email), tautan cepat
 * ke halaman Profil, Edit Profil, dan tombol Logout.
 */

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { userLogout } from "@/utils/apis/auth/api";
import { useToken } from "@/utils/contexts/token";
import { Home, Settings, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import UserAvatar from "./user-avatar";

export default function LoginDropdown() {
  const { changeToken, user } = useToken();
  const navigate = useNavigate();

  /**
   * Menangani proses keluar (logout):
   * Memanggil endpoint logout, menghapus sesi token di context,
   * dan mengarahkan pengguna kembali ke halaman /login.
   */
  const handleLogout = async () => {
    try {
      await userLogout(); 
    } catch {
      // Tetap lanjutkan pembersihan sesi di sisi klien meskipun jaringan error
    }
    changeToken();
    navigate("/login", { replace: true });
    toast.success("Logout berhasil");
  };

  return (
    <DropdownMenu>
      {/* Tombol Pemicu: Avatar Pengguna di Navbar */}
      <DropdownMenuTrigger
        className="rounded-full ring-offset-background transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2"
        aria-label="Menu akun"
      >
        <UserAvatar name={user?.name} src={user?.avatar} className="h-9 w-9 text-sm" />
      </DropdownMenuTrigger>

      {/* Konten Dropdown */}
      <DropdownMenuContent className="w-60 rounded-xl p-1.5" align="end">
        {/* Info Singkat User (Nama & Email) */}
        <div className="flex items-center gap-3 px-2 py-2.5">
          <UserAvatar name={user?.name} src={user?.avatar} className="h-9 w-9 text-sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />

        {/* Tautan Beranda (Khusus Tampilan Mobile) */}
        <Link to="/">
          <DropdownMenuItem className="gap-2.5 rounded-lg py-2 sm:hidden">
            <Home className="w-[18px] text-muted-foreground" />
            Beranda
          </DropdownMenuItem>
        </Link>

        {/* Tautan ke Profil Saya */}
        <Link to="/profile">
          <DropdownMenuItem className="gap-2.5 rounded-lg py-2">
            <User className="w-[18px] text-muted-foreground" />
            Profil saya
          </DropdownMenuItem>
        </Link>

        {/* Tautan ke Pengaturan / Edit Profil */}
        <Link to="/edit-profile">
          <DropdownMenuItem className="gap-2.5 rounded-lg py-2">
            <Settings className="w-[18px] text-muted-foreground" />
            Edit profil
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />

        {/* Tombol Logout */}
        <DropdownMenuItem
          className="cursor-pointer gap-2.5 rounded-lg py-2 focus:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-[18px] text-muted-foreground" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
