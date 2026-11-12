/**
 * Komponen Modal Dialog Edit Postingan (EditPost):
 * Memungkinkan pengguna mengedit postingan miliknya:
 * - Mengubah teks caption
 * - Mengganti gambar dengan berkas baru atau URL baru
 * - Menghapus gambar lama (flag remove_image)
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "./ui/textarea";
import { useForm } from "react-hook-form";
import { createPostSchema, updatePostType } from "@/utils/apis/post/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "./ui/form";
import { CustomFormField } from "./custom-formfield";
import { ImageMenu, ImagePreview, UrlInput } from "./image-attach";

interface Props {
  caption: string;
  imgUrl?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: updatePostType) => void | Promise<void>;
}

// Helper membuat struktur data default
const blank = (caption: string): updatePostType => ({
  image: new File([], ""),
  image_url: "",
  caption,
});

export function EditPost(props: Props) {
  const { caption, imgUrl, open, onOpenChange, onSubmit } = props;
  const [urlOpen, setUrlOpen] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);

  // Inisialisasi form: bila gambar lama masih ada, caption diperbolehkan kosong
  const form = useForm<updatePostType>({
    resolver: async (values, ctx, opts) => {
      const hasOld = !!imgUrl && !removeImage;
      if (hasOld && values.caption.trim() === "") {
        return zodResolver(createPostSchema.innerType().partial({ caption: true }))(
          values as never,
          ctx,
          opts
        ) as never;
      }
      return zodResolver(createPostSchema)(values, ctx, opts) as never;
    },
    defaultValues: blank(caption),
  });

  // Sinkronisasi data saat modal dialog dibuka
  useEffect(() => {
    if (open) {
      form.reset(blank(caption));
      setRemoveImage(false);
      setUrlOpen(false);
    }
  }, [caption, form, open]);

  const file = form.watch("image");
  const url = form.watch("image_url");
  const urlError = form.formState.errors.image_url?.message;
  const replaced = file.name !== "" || (url !== "" && !urlError);
  const busy = form.formState.isSubmitting;

  /**
   * Handler submit pembaruan postingan
   */
  async function submit(data: updatePostType) {
    try {
      await onSubmit({ ...data, remove_image: removeImage && !replaced });
    } catch {
      // Error ditangani pemanggil
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="grid gap-4">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl font-medium">
                Edit postingan
              </DialogTitle>
              <DialogDescription>
                Ubah teks atau ganti gambar postinganmu.
              </DialogDescription>
            </DialogHeader>

            {/* Input Caption */}
            <CustomFormField control={form.control} name="caption" label="">
              {(field) => (
                <Textarea
                  {...field}
                  className="min-h-[120px] resize-none text-[15px] leading-6"
                  placeholder="Tulis sesuatu…"
                  maxLength={2000}
                  disabled={busy}
                  aria-label="Teks postingan"
                  value={field.value as string}
                />
              )}
            </CustomFormField>

            {/* Pratinjau & Kontrol Gambar */}
            <div className="space-y-2.5">
              {replaced ? (
                <ImagePreview
                  file={file}
                  url={url}
                  onRemove={() => {
                    form.setValue("image", new File([], ""));
                    form.setValue("image_url", "");
                  }}
                />
              ) : imgUrl && !removeImage ? (
                <ImagePreview
                  existingSrc={imgUrl}
                  onRemove={() => setRemoveImage(true)}
                />
              ) : null}

              {urlOpen && (
                <UrlInput
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
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <ImageMenu
                  align="start"
                  disabled={busy}
                  label="Ganti gambar"
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
                {imgUrl || replaced ? "Ganti gambar" : "Tambah gambar"}
              </div>
            </div>

            {/* Tombol Footer Batal & Simpan */}
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Menyimpan…" : "Simpan perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
