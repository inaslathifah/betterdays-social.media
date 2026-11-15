/**
 * Komponen Kartu Bio Profil Pengguna (BioProfile):
 * Menampilkan ringkasan profil di bagian atas halaman profil (gaya Instagram):
 * - Foto avatar besar dengan inisial fallback
 * - Nama lengkap dan alamat email
 * - Bio deskripsi pribadi
 * - Statistik: Postingan, Pengikut (Followers), Mengikuti (Following)
 * - Tombol Edit Profil (jika profil sendiri) atau tombol Ikuti / Mengikuti (jika profil pengguna lain)
 */

import { Link } from "react-router-dom";
import { Settings2, UserCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserAvatar from "./user-avatar";

interface Props {
  userId?: number;
  name?: string; // Nama lengkap user
  email?: string; // Alamat email user
  bio?: string | null; // Biodata singkat
  avatar?: string | null; // URL gambar avatar
  totalPost: number; // Jumlah postingan yang dibuat oleh user
  followersCount?: number; // Jumlah pengikut
  followingCount?: number; // Jumlah yang diikuti
  isOwn?: boolean; // False saat melihat profil user lain
  isFollowing?: boolean; // Status apakah user yang sedang login mengikuti user ini
  followLoading?: boolean; // Status loading saat toggle follow
  onToggleFollow?: () => void; // Handler toggle follow
  onFollowersClick?: () => void; // Handler klik pengikut
  onFollowingClick?: () => void; // Handler klik mengikuti
}

export function BioProfile(props: Props) {
  const {
    name,
    email,
    bio,
    avatar,
    totalPost,
    followersCount = 0,
    followingCount = 0,
    isOwn = true,
    isFollowing = false,
    followLoading = false,
    onToggleFollow,
    onFollowersClick,
    onFollowingClick,
  } = props;

  return (
    <section className="mb-10 flex w-full flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
      {/* Avatar Pengguna Ukuran Besar */}
      <UserAvatar
        name={name}
        src={avatar}
        className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 text-3xl ring-4 ring-secondary"
      />

      {/* Rincian Teks Profil (Nama, Email, Bio, Statistik Instagram) */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-serif text-[28px] sm:text-[32px] font-medium leading-tight tracking-tight">
            {name}
          </h2>

          {/* Tombol Follow / Unfollow (Khusus Profil Orang Lain) */}
          {!isOwn && (
            <Button
              size="sm"
              variant={isFollowing ? "outline" : "brand"}
              disabled={followLoading}
              onClick={onToggleFollow}
              className="h-8 gap-1.5 rounded-full px-4 text-xs font-medium"
            >
              {isFollowing ? (
                <>
                  <UserCheck className="h-3.5 w-3.5" />
                  Mengikuti
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5" />
                  Ikuti
                </>
              )}
            </Button>
          )}

          {/* Tombol Menuju Edit Profil (Khusus Profil Sendiri) */}
          {isOwn && (
            <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 rounded-full bg-card px-3 text-xs">
              <Link to="/edit-profile">
                <Settings2 className="h-3.5 w-3.5" />
                Edit profil
              </Link>
            </Button>
          )}
        </div>

        {email && <p className="mt-0.5 text-xs text-muted-foreground">{email}</p>}

        {/* Bio Pengguna */}
        <p className="my-3 max-w-prose whitespace-pre-wrap text-[15px] leading-6">
          {bio || (
            <span className="text-muted-foreground">Belum ada bio.</span>
          )}
        </p>

        {/* Statistik Gaya Instagram: Post, Pengikut, Mengikuti */}
        <div className="flex flex-wrap items-center gap-5 text-sm">
          <div>
            <span className="font-semibold text-foreground">{totalPost}</span>{" "}
            <span className="text-muted-foreground">postingan</span>
          </div>

          <button
            type="button"
            onClick={onFollowersClick}
            className="cursor-pointer transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:underline"
          >
            <span className="font-semibold text-foreground">{followersCount}</span>{" "}
            <span className="text-muted-foreground">pengikut</span>
          </button>

          <button
            type="button"
            onClick={onFollowingClick}
            className="cursor-pointer transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:underline"
          >
            <span className="font-semibold text-foreground">{followingCount}</span>{" "}
            <span className="text-muted-foreground">mengikuti</span>
          </button>
        </div>
      </div>
    </section>
  );
}
