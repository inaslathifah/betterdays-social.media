/**
 * Komponen Kartu Bio Profil Pengguna (BioProfile):
 * Menampilkan ringkasan profil di bagian atas halaman profil:
 * - Foto avatar besar dengan inisial fallback
 * - Nama lengkap dan alamat email
 * - Bio deskripsi pribadi
 * - Jumlah total postingan yang telah dibuat
 * - Tombol navigasi menuju halaman Edit Profil
 */

import { Link } from "react-router-dom";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserAvatar from "./user-avatar";

interface Props {
  name?: string; // Nama lengkap user
  email?: string; // Alamat email user
  bio?: string | null; // Biodata singkat
  avatar?: string | null; // URL gambar avatar
  totalPost: number; // Jumlah postingan yang dibuat oleh user
}

export function BioProfile(props: Props) {
  const { name, email, bio, avatar, totalPost } = props;

  return (
    <section className="mb-10 flex w-full flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
      {/* Avatar Pengguna Ukuran Besar */}
      <UserAvatar
        name={name}
        src={avatar}
        className="h-24 w-24 shrink-0 text-3xl ring-4 ring-secondary"
      />

      {/* Rincian Teks Profil (Nama, Email, Bio, Statistik Post) */}
      <div className="min-w-0 flex-1">
        <h2 className="font-serif text-[32px] font-medium leading-tight tracking-tight">
          {name}
        </h2>
        <p className="text-sm text-muted-foreground">{email}</p>
        <p className="my-2.5 max-w-prose whitespace-pre-wrap text-[15px] leading-6">
          {bio || (
            <span className="text-muted-foreground">Belum ada bio.</span>
          )}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{totalPost}</span>{" "}
          postingan
        </p>
      </div>

      {/* Tombol Menuju Edit Profil */}
      <Button asChild variant="outline" className="self-start bg-card">
        <Link to="/edit-profile">
          <Settings2 className="mr-2 h-4 w-4" />
          Edit profil
        </Link>
      </Button>
    </section>
  );
}
