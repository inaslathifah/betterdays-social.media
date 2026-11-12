/**
 * Halaman Pengaturan Akun (Edit Profil & Ubah Password):
 * Menyediakan dua formulir utama:
 * 1. ProfileForm: Mengubah nama pengguna, bio, dan foto avatar (unggah file baru, link URL, atau hapus foto).
 * 2. PasswordForm: Mengubah password akun dengan validasi password lama & konfirmasi password baru.
 * 3. Opsi Reset Data Demo (khusus mode dummy): Mengembalikan database dummy ke kondisi default.
 */

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import Layout from "@/components/layout";
import Alert from "@/components/alert";
import UserAvatar from "@/components/user-avatar";
import { CustomFormField } from "@/components/custom-formfield";
import { ImageMenu, UrlInput } from "@/components/image-attach";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { changePassword, updateProfile } from "@/utils/apis/user/api";
import {
  ChangePasswordType,
  UpdateProfileType,
  changePasswordSchema,
  updateProfileSchema,
} from "@/utils/apis/user/type";
import { USE_DUMMY_API } from "@/utils/apis/axios-with-config";
import { useToken } from "@/utils/contexts/token";
import { isSafeImageUrl } from "@/utils/image";
import { resetDB } from "@/utils/mock/db";

// Helper membuat objek File kosong sebagai penanda awal
const emptyFile = () => new File([], "");

/**
 * Form Pengubahan Profil (Nama, Bio, Foto Avatar)
 */
function ProfileForm() {
  const { user, refreshUser } = useToken();
  const [urlOpen, setUrlOpen] = useState(false);

  // Inisialisasi react-hook-form dengan updateProfileSchema Zod
  const form = useForm<UpdateProfileType>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: "",
      bio: "",
      avatar: emptyFile(),
      avatar_url: "",
      remove_avatar: false,
    },
  });

  // Isi form dengan data user saat ini saat halaman dimuat
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        bio: user.bio ?? "",
        avatar: emptyFile(),
        avatar_url: "",
        remove_avatar: false,
      });
      setUrlOpen(false);
    }
  }, [form, user]);

  // Pantau perubahan field secara real-time untuk live preview foto
  const file = form.watch("avatar");
  const url = form.watch("avatar_url");
  const remove = form.watch("remove_avatar");
  const name = form.watch("name");
  const urlError = form.formState.errors.avatar_url?.message;
  const busy = form.formState.isSubmitting;

  // Buat Object URL sementara untuk preview gambar lokal yang baru dipilih
  const objectUrl = useMemo(
    () => (file.size > 0 ? URL.createObjectURL(file) : null),
    [file]
  );
  // Bersihkan memory browser saat komponen unmount atau file berganti
  useEffect(
    () => () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    },
    [objectUrl]
  );

  // Tentukan sumber gambar avatar yang ditampilkan di preview
  const previewSrc =
    objectUrl ??
    (url && !urlError && isSafeImageUrl(url) ? url : null) ??
    (remove ? null : user?.avatar ?? null);

  const hasAvatar = !!previewSrc;

  // Handler simpan data profil
  async function submit(data: UpdateProfileType) {
    try {
      const result = await updateProfile(data);
      toast.success(result.message);
      // Perbarui context profil user secara global
      await refreshUser();
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil</CardTitle>
        <CardDescription>
          Nama dan foto profilmu akan tampil di navbar, di postingan, dan komentar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="grid gap-5" noValidate>
            {/* Bagian Foto Profil & Tombol Ganti/Hapus */}
            <div className="flex items-center gap-4">
              <UserAvatar name={name} src={previewSrc} className="h-20 w-20 text-2xl" />
              <div className="flex flex-col items-start gap-1.5">
                <div className="flex items-center gap-1 text-sm">
                  <ImageMenu
                    disabled={busy}
                    label="Ganti foto profil"
                    className="rounded-full border"
                    onPickFile={(f) => {
                      form.setValue("avatar", f, { shouldValidate: true });
                      form.setValue("avatar_url", "");
                      form.setValue("remove_avatar", false);
                      setUrlOpen(false);
                    }}
                    onPickUrl={() => {
                      form.setValue("avatar", emptyFile());
                      form.setValue("remove_avatar", false);
                      setUrlOpen(true);
                    }}
                  />
                  <span className="ml-1">Ganti foto</span>
                </div>
                {hasAvatar && (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
                    onClick={() => {
                      form.setValue("avatar", emptyFile());
                      form.setValue("avatar_url", "");
                      form.setValue("remove_avatar", true);
                      setUrlOpen(false);
                    }}
                  >
                    Hapus foto
                  </button>
                )}
              </div>
            </div>

            {/* Input URL Gambar jika mode URL dipilih */}
            {urlOpen && (
              <UrlInput
                value={url}
                error={urlError}
                onChange={(v) =>
                  form.setValue("avatar_url", v, { shouldValidate: true })
                }
                onClose={() => {
                  form.setValue("avatar_url", "");
                  setUrlOpen(false);
                }}
              />
            )}
            {form.formState.errors.avatar?.message && (
              <p className="text-xs text-destructive">
                {form.formState.errors.avatar.message}
              </p>
            )}

            {/* Input Nama Pengguna */}
            <CustomFormField control={form.control} name="name" label="Nama pengguna">
              {(field) => (
                <Input
                  {...field}
                  maxLength={100}
                  autoComplete="name"
                  disabled={busy}
                  value={field.value as string}
                />
              )}
            </CustomFormField>

            {/* Input Bio Singkat */}
            <CustomFormField
              control={form.control}
              name="bio"
              label="Bio"
              description="Ceritakan dirimu secara singkat ..."
            >
              {(field) => (
                <Textarea
                  {...field}
                  maxLength={300}
                  rows={3}
                  className="resize-none"
                  placeholder="Tulis bio singkat…"
                  disabled={busy}
                  value={field.value as string}
                />
              )}
            </CustomFormField>

            {/* Tombol Simpan Perubahan Profil */}
            <div>
              <Button type="submit" disabled={busy}>
                {busy ? "Menyimpan…" : "Simpan profil"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

/**
 * Form Pengubahan Kata Sandi (Password)
 */
function PasswordForm() {
  const [show, setShow] = useState(false);

  const form = useForm<ChangePasswordType>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { old_password: "", new_password: "", confirm_password: "" },
  });
  const busy = form.formState.isSubmitting;

  async function submit(data: ChangePasswordType) {
    try {
      const result = await changePassword(data);
      toast.success(result.message);
      form.reset();
    } catch (error) {
      const message = (error as Error).message;
      if (message.toLowerCase().includes("lama")) {
        form.setError("old_password", { message });
      }
      toast.error(message);
    }
  }

  const type = show ? "text" : "password";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Keamanan</CardTitle>
        <CardDescription>
          Masukkan password lama untuk memverifikasi, lalu ganti dengan password baru.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="grid gap-4" noValidate>
            {/* Input Password Lama */}
            <CustomFormField control={form.control} name="old_password" label="Password lama">
              {(field) => (
                <Input {...field} type={type} autoComplete="current-password" disabled={busy} />
              )}
            </CustomFormField>

            {/* Input Password Baru */}
            <CustomFormField
              control={form.control}
              name="new_password"
              label="Password baru"
              description="Minimal 6 karakter."
            >
              {(field) => (
                <Input {...field} type={type} autoComplete="new-password" disabled={busy} />
              )}
            </CustomFormField>

            {/* Input Konfirmasi Password Baru */}
            <CustomFormField
              control={form.control}
              name="confirm_password"
              label="Konfirmasi password baru"
            >
              {(field) => (
                <Input {...field} type={type} autoComplete="new-password" disabled={busy} />
              )}
            </CustomFormField>

            {/* Checkbox Tampilkan Karakter Password */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-pw"
                checked={show}
                onCheckedChange={(c: boolean) => setShow(c)}
              />
              <label htmlFor="show-pw" className="text-sm font-medium leading-none">
                Tampilkan password
              </label>
            </div>

            {/* Tombol Simpan Perubahan Password */}
            <div>
              <Button type="submit" disabled={busy}>
                {busy ? "Menyimpan…" : "Ubah password"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

/**
 * Komponen Induk Halaman Pengaturan Akun
 */
export default function EditProfile() {
  const { changeToken } = useToken();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <Layout withUser navBlue centerX>
      {/* Tautan Kembali ke Halaman Profil */}
      <Link
        to="/profile"
        className="mb-5 inline-flex items-center gap-1.5 self-start text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke profil
      </Link>
      <h2 className="mb-6 self-start font-serif text-[34px] font-normal leading-tight tracking-tight">
        Pengaturan akun
      </h2>

      <div className="grid w-full gap-5">
        <ProfileForm />
        <PasswordForm />

        {/* Tombol Reset Data Demo (Hanya aktif dalam Mode Dummy) */}
        {USE_DUMMY_API && (
          <div className="flex items-center justify-between gap-4 px-1 text-sm text-muted-foreground">
            <p>Data demo disimpan di browser ini.</p>
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="shrink-0 underline-offset-4 hover:text-foreground hover:underline"
            >
              Reset data demo
            </button>
          </div>
        )}
      </div>

      {/* Dialog Konfirmasi Reset Data Dummy */}
      <Alert
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Reset data demo?"
        description="Semua akun, postingan, like, dan komentar yang kamu buat akan dihapus, lalu data awal dipulihkan. Kamu akan keluar dari akun."
        actionText="Reset"
        destructive
        onCancel={() => setConfirmReset(false)}
        onAction={() => {
          resetDB();
          changeToken();
          window.location.assign("/login");
        }}
      />
    </Layout>
  );
}
