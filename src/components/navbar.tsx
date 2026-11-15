import { cn } from "@/lib/utils";
import { Link, NavLink } from "react-router-dom";
import LoginDropdown from "./login-dropdown";
import { useToken } from "@/utils/contexts/token";
import NoLoginDropdown from "./no-login-dropdown";
import Logo from "./logo";
import ThemeToggle from "./theme-toggle";
import NotificationDropdown from "./notification-dropdown";
import { Home, User } from "lucide-react";

/**
 * Properti untuk komponen Navbar:
 * - withUser: menampilkan menu navigasi user / tombol login & profil
 * - navBlue: jika true, navbar memiliki efek blur dan garis batas bawah (sticky bar)
 */
interface Props {
  withUser?: boolean;
  navBlue?: boolean;
}

/**
 * Helper untuk menentukan class Tailwind pada link navigasi aktif vs tidak aktif.
 */
const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-secondary text-foreground"
      : "text-muted-foreground hover:text-foreground"
  );

/**
 * Komponen Navigasi Utama (Navbar):
 * Menampilkan logo Betterdays, navigasi Beranda/Profil (dengan ikon), notifikasi,
 * pengganti tema gelap/terang, serta menu dropdown status login user.
 */
export default function Navbar(props: Props) {
  const { withUser, navBlue } = props;
  const { token } = useToken();

  return (
    <nav
      className={cn(
        "sticky top-0 z-10 flex w-full justify-center",
        navBlue && "border-b bg-background/85 backdrop-blur-md"
      )}
    >
      <div className="flex h-12 w-full max-w-[2060px] items-center justify-between px-4 sm:px-6">
        {/* Sisi Kiri: Logo Betterdays & Menu Tautan Halaman */}
        <div className="flex items-center gap-5">
          <Link to="/" className="flex items-center gap-2" aria-label="Betterdays">
            <Logo />
          </Link>
          {withUser && token && (
            <div className="flex items-center gap-1">
              <NavLink to="/" end className={linkClass}>
                <Home className="h-4 w-4" />
                <span>Beranda</span>
              </NavLink>
              <NavLink to="/profile" className={linkClass}>
                <User className="h-4 w-4" />
                <span>Profil</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Sisi Kanan: Notifikasi, Pengatur Tema (Dark/Light) & Dropdown Akun Pengguna */}
        <div className="flex items-center gap-2">
          {withUser && token && <NotificationDropdown />}
          <ThemeToggle />
          {withUser ? (
            <>{token ? <LoginDropdown /> : <NoLoginDropdown />}</>
          ) : (
            <></>
          )}
        </div>
      </div>
    </nav>
  );
}
