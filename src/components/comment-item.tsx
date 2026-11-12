/**
 * Komponen Baris Komentar (CommentItem):
 * Menampilkan komentar pengguna pada sebuah postingan:
 * - Avatar, nama penulis komentar, dan timestamp relatif (timeAgo)
 * - Teks komentar dan/atau gambar yang dilampirkan
 * - Menu opsi (Edit & Hapus) jika user yang login adalah pemilik komentar
 * - Mode inline-editing (Textarea langsung di tempat) dengan tombol Simpan & Batal
 * - Dialog konfirmasi sebelum menghapus komentar (Alert)
 */

import { useState } from "react";
import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { IComments } from "@/utils/apis/comment/type";
import { fullDate, timeAgo } from "@/utils/date";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvatar from "./user-avatar";
import Alert from "./alert";
import { ImagePreview } from "./image-attach";

export interface CommentUpdateBody {
  comment: string;
  remove_image?: boolean;
}

interface Props {
  comment: IComments;
  isOwner?: boolean; // Bernilai true jika komentar ini ditulis oleh pengguna yang sedang aktif
  onUpdate?: (commentID: number, body: CommentUpdateBody) => void | Promise<void>;
  onDelete?: (commentID: number) => void | Promise<void>;
}

export default function CommentItem({ comment, isOwner, onUpdate, onDelete }: Props) {
  // State untuk mode edit komentar
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.comment);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  // State dialog konfirmasi hapus komentar
  const [showDelete, setShowDelete] = useState(false);

  const hasImage = !!comment.image && !removeImage;
  const empty = text.trim() === "" && !hasImage;

  // Masuk ke mode edit
  function startEdit() {
    setText(comment.comment);
    setRemoveImage(false);
    setEditing(true);
  }

  // Simpan hasil editan komentar
  async function save() {
    if (empty || saving) return;
    setSaving(true);
    try {
      await onUpdate?.(comment.id, { comment: text.trim(), remove_image: removeImage });
      setEditing(false);
    } catch {
      // Jika gagal, tetap berada di mode edit agar teks ketikan tidak hilang
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex gap-3">
      {/* Avatar Penulis Komentar */}
      <UserAvatar
        name={comment.name}
        src={comment.avatar}
        className="mt-0.5 h-8 w-8 text-xs"
      />
      <div className="min-w-0 flex-1">
        {/* Header Komentar: Nama Penulis, Waktu Komentar, dan Menu Opsi */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-[13px] font-medium">{comment.name}</span>
            <time
              className="text-xs text-muted-foreground"
              dateTime={comment.created_at}
              title={fullDate(comment.created_at)}
            >
              {timeAgo(comment.created_at)}
            </time>
          </div>

          {/* Menu Opsi Titik Tiga (Hanya untuk pemilik komentar) */}
          {isOwner && !editing && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="-mr-1 -mt-1 rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                aria-label="Opsi komentar"
              >
                <Ellipsis className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 p-1.5">
                <DropdownMenuItem className="gap-2.5 py-2 cursor-pointer" onClick={startEdit}>
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2.5 py-2 text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => setShowDelete(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Kondisi Mode Edit vs Mode Tampilan Normal */}
        {editing ? (
          <div className="mt-1.5 space-y-2.5">
            <Textarea
              autoFocus
              value={text}
              rows={2}
              maxLength={1000}
              disabled={saving}
              aria-label="Edit komentar"
              className="min-h-[64px] resize-none text-[14px] leading-6"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setEditing(false);
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") save();
              }}
            />
            {hasImage && (
              <ImagePreview
                size="sm"
                existingSrc={comment.image}
                onRemove={() => setRemoveImage(true)}
              />
            )}
            {empty && (
              <p className="text-xs text-destructive">
                Tulis komentar atau pertahankan gambarnya.
              </p>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                disabled={empty || saving}
                onClick={save}
              >
                {saving ? "Menyimpan…" : "Simpan"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={saving}
                onClick={() => setEditing(false)}
              >
                Batal
              </Button>
            </div>
          </div>
        ) : (
          <>
            {comment.comment && (
              <p className="mt-0.5 whitespace-pre-wrap break-words text-[14px] leading-6">
                {comment.comment}
              </p>
            )}
            {comment.image && (
              <img
                src={comment.image}
                alt={`Lampiran komentar dari ${comment.name}`}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="mt-2 max-h-64 max-w-full rounded-xl border object-cover"
              />
            )}
          </>
        )}
      </div>

      {/* Dialog Konfirmasi Hapus Komentar */}
      <Alert
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Hapus komentar ini?"
        description="Komentar akan dihapus permanen dan tidak dapat dikembalikan."
        actionText="Hapus"
        destructive
        onCancel={() => setShowDelete(false)}
        onAction={async () => {
          try {
            await onDelete?.(comment.id);
            setShowDelete(false);
          } catch {
            // Ditangani pemanggil
          }
        }}
      />
    </div>
  );
}
