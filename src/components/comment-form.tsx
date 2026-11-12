/**
 * Komponen Form Tambah Komentar (CommentForm):
 * Ditempatkan di bawah setiap postingan:
 * - Menampilkan avatar pengguna yang sedang login
 * - Input teks komentar dalam baris rounded pill
 * - Opsi lampiran gambar (unggah berkas atau link URL)
 * - Tombol kirim komentar dengan ikon panah atas (ArrowUp)
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUp } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CommentType, commentSchema } from "@/utils/apis/comment/type";
import { CustomFormField } from "./custom-formfield";
import { ImageMenu, ImagePreview, UrlInput } from "./image-attach";
import UserAvatar from "./user-avatar";
import { useToken } from "@/utils/contexts/token";

interface Props {
  postID: number;
  onComment: (data: CommentType) => void | Promise<void>;
}

export default function CommentForm({ postID, onComment }: Props) {
  const { user } = useToken();
  const [urlOpen, setUrlOpen] = useState(false);

  // Inisialisasi formulir komentar
  const form = useForm<CommentType>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      post_id: postID,
      comment: "",
      image: new File([], ""),
      image_url: "",
    },
  });

  const file = form.watch("image");
  const url = form.watch("image_url");
  const hasContent = form.watch("comment").trim() !== "" || file.name !== "" || url.trim() !== "";
  const urlError = form.formState.errors.image_url?.message;
  const fieldError =
    form.formState.errors.comment?.message ?? form.formState.errors.image?.message;

  /**
   * Mengirim komentar dan mereset field input jika sukses
   */
  async function submit(data: CommentType) {
    try {
      await onComment({ ...data, post_id: postID });
      form.reset({
        post_id: postID,
        comment: "",
        image: new File([], ""),
        image_url: "",
      });
      setUrlOpen(false);
    } catch {
      // Notifikasi error ditangani di luar; isi form dipertahankan agar tidak hilang
    }
  }

  const busy = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="flex gap-3">
        {/* Avatar User yang Login */}
        <UserAvatar
          name={user?.name}
          src={user?.avatar}
          className="mt-0.5 h-8 w-8 text-xs"
        />
        <div className="min-w-0 flex-1">
          {/* Wadah Input Komentar Bulat (Pill Bar) */}
          <div className="flex items-center rounded-full border border-input bg-card pl-1 pr-1.5 transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25">
            {/* Tombol Menu Lampiran Gambar */}
            <ImageMenu
              disabled={busy}
              label="Lampirkan gambar ke komentar"
              className="h-8 w-8"
              onPickFile={(f) => {
                form.setValue("image", f, { shouldValidate: true });
                form.setValue("image_url", "");
                setUrlOpen(false);
              }}
              onPickUrl={() => {
                form.setValue("image", new File([], ""));
                setUrlOpen(true);
              }}
            />

            {/* Input Teks Komentar */}
            <CustomFormField control={form.control} name="comment" label="">
              {(field) => (
                <Input
                  {...field}
                  className="h-10 border-0 bg-transparent px-1 text-[14px] shadow-none focus-visible:ring-0"
                  placeholder="Tulis komentar…"
                  maxLength={1000}
                  autoComplete="off"
                  disabled={busy}
                  aria-label="Tulis komentar"
                  value={field.value as string}
                />
              )}
            </CustomFormField>

            {/* Tombol Kirim Komentar */}
            <Button
              type="submit"
              size="icon"
              variant="brand"
              disabled={busy || !hasContent}
              aria-label="Kirim komentar"
              className="h-8 w-8 shrink-0 rounded-full"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>

          {/* Input URL jika user memilih tempel link gambar */}
          {urlOpen && (
            <UrlInput
              className="mt-2"
              value={url}
              error={urlError}
              onChange={(v) => form.setValue("image_url", v, { shouldValidate: true })}
              onClose={() => {
                form.setValue("image_url", "");
                setUrlOpen(false);
              }}
            />
          )}

          {/* Pratinjau Gambar Terlampir */}
          {(file.name !== "" || (url && !urlError)) && (
            <ImagePreview
              className="mt-2.5"
              size="sm"
              file={file}
              url={url}
              onRemove={() => {
                form.setValue("image", new File([], ""));
                form.setValue("image_url", "");
                setUrlOpen(false);
              }}
            />
          )}

          {/* Pesan Error Validasi */}
          {fieldError && !hasContent && (
            <p className="mt-1.5 pl-3 text-xs text-destructive">{fieldError}</p>
          )}
        </div>
      </form>
    </Form>
  );
}
