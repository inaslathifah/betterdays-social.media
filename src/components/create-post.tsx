/**
 * Komponen Pembuat Postingan (CreatePost):
 * Formulir interaktif untuk membuat status baru di linimasa:
 * - Textarea fleksibel (auto-grow saat teks bertambah panjang)
 * - Pintasan keyboard: Ctrl+Enter (atau Cmd+Enter di Mac) untuk submit cepat
 * - Lampiran gambar: Mendukung unggah berkas lokal atau tautan URL eksternal
 * - Tombol kirim otomatis aktif hanya jika ada konten (teks atau gambar)
 */

import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPostSchema, createPostType } from "@/utils/apis/post/type";
import { CustomFormField } from "./custom-formfield";
import { Textarea } from "./ui/textarea";
import { ImageMenu, ImagePreview, UrlInput } from "./image-attach";

interface Props {
  onsubmit: (data: createPostType) => void | Promise<void>;
  placeholder?: string;
}

// Nilai default form kosong
const emptyValues = (): createPostType => ({
  image: new File([], ""),
  image_url: "",
  caption: "",
});

export default function CreatePost(props: Props) {
  const { onsubmit, placeholder = "Apa yang ingin kamu ceritakan?" } = props;
  const [urlOpen, setUrlOpen] = useState(false);

  // Inisialisasi react-hook-form dengan Zod schema
  const form = useForm<createPostType>({
    resolver: zodResolver(createPostSchema),
    defaultValues: emptyValues(),
  });

  // Pantau state form secara real-time
  const file = form.watch("image");
  const url = form.watch("image_url");
  const caption = form.watch("caption");
  const urlError = form.formState.errors.image_url?.message;
  // Validasi apakah pengguna sudah mengetik sesuatu atau memilih gambar
  const hasContent = caption.trim() !== "" || file.name !== "" || url.trim() !== "";
  const busy = form.formState.isSubmitting;

  /**
   * Handler submit postingan baru
   */
  async function submit(data: createPostType) {
    try {
      await onsubmit(data);
      form.reset(emptyValues());
      setUrlOpen(false);
    } catch {
      // Jika terjadi error, data form dipertahankan agar ketikan pengguna tidak hilang
    }
  }

  return (
    <div className="mb-8 w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)}>
          <div className="rounded-[28px] border border-input bg-card p-3 shadow-[0_1px_2px_hsl(var(--foreground)/0.04),0_12px_32px_-16px_hsl(var(--foreground)/0.12)] transition-shadow focus-within:border-ring/60 focus-within:ring-2 focus-within:ring-ring/20">
            {/* Area Input Teks Status (Textarea) */}
            <CustomFormField control={form.control} name="caption" label="">
              {(field) => (
                <Textarea
                  {...field}
                  rows={2}
                  maxLength={2000}
                  className="max-h-60 min-h-[56px] resize-none border-0 bg-transparent px-3 py-2 text-[17px] leading-7 shadow-none focus-visible:ring-0"
                  placeholder={placeholder}
                  aria-label="Tulis status"
                  disabled={busy}
                  aria-disabled={busy}
                  value={field.value as string}
                  // Penyesuaian tinggi otomatis (auto-expand)
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
                  }}
                  // Pintasan keyboard: Ctrl+Enter untuk kirim
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                      e.preventDefault();
                      form.handleSubmit(submit)();
                    }
                  }}
                />
              )}
            </CustomFormField>

            {/* Pratinjau Gambar yang Dipilih */}
            {(file.name !== "" || (url && !urlError)) && (
              <div className="px-3 pb-2 pt-1">
                <ImagePreview
                  file={file}
                  url={url}
                  onRemove={() => {
                    form.setValue("image", new File([], ""));
                    form.setValue("image_url", "");
                    setUrlOpen(false);
                  }}
                />
              </div>
            )}

            {/* Input URL Gambar jika mode tautan dipilih */}
            {urlOpen && (
              <UrlInput
                className="px-3 pb-2 pt-1"
                value={url}
                error={urlError}
                onChange={(v) =>
                  form.setValue("image_url", v, { shouldValidate: true })
                }
                onClose={() => {
                  form.setValue("image_url", "");
                  setUrlOpen(false);
                }}
              />
            )}

            {/* Bar Aksi Bawah: Pilihan Lampiran Gambar & Tombol Kirim Posting */}
            <div className="mt-1 flex items-center justify-between">
              <ImageMenu
                disabled={busy}
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
              <Button
                type="submit"
                variant="brand"
                disabled={busy || !hasContent}
                className="h-9 gap-1.5 rounded-full pl-4 pr-3"
                aria-label="Kirim postingan"
              >
                {busy ? "Mengirim…" : "Posting"}
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
