/**
 * Komponen Kartu Postingan (PostCard):
 * Merupakan elemen inti antarmuka linimasa:
 * 1. Header: Avatar penulis, nama, waktu publikasi relatif (dan penanda diedit), menu titik tiga (edit/hapus).
 * 2. Konten: Teks status (caption) bergaya font serif yang nyaman dibaca dan gambar lampiran (jika ada).
 * 3. Bar Aksi: Tombol suka (LikeButton) dan jumlah komentar yang dapat diklik untuk ke halaman detail.
 * 4. Daftar Komentar: Menampilkan 2 komentar terbaru (preview) atau seluruh komentar, beserta form tambah komentar.
 * 5. Dialog: Modal Edit Postingan (EditPost) dan dialog konfirmasi hapus postingan (Alert).
 */

import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageCircle, Ellipsis, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { EditPost } from "./edit-post";
import Alert from "./alert";
import { useState } from "react";
import { CommentType, IComments } from "@/utils/apis/comment/type";
import { updatePostType } from "@/utils/apis/post/type";
import { fullDate, timeAgo } from "@/utils/date";
import UserAvatar from "./user-avatar";
import LikeButton from "./like-button";
import CommentItem, { CommentUpdateBody } from "./comment-item";
import { useToken } from "@/utils/contexts/token";
import CommentForm from "./comment-form";

interface Types {
  postID: number;
  name: string;
  avatar?: string | null;
  caption: string;
  time: string;
  updatedAt?: string | null;
  imgUrl?: string | null;
  withOption?: boolean; // True jika user saat ini adalah pemilik post (menampilkan opsi edit/hapus)
  withInputComment?: boolean; // Menampilkan form input komentar di bawah postingan
  showAllComments?: boolean; // Menampilkan seluruh komentar (true di detail post) atau dipangkas 2 saja (false di timeline)
  likes: number;
  liked: boolean;
  comments: IComments[];
  onLike: (postID: number) => void;
  onComment: (data: CommentType) => void | Promise<void>;
  onCommentUpdate?: (commentID: number, body: CommentUpdateBody) => void | Promise<void>;
  onCommentDelete?: (commentID: number) => void | Promise<void>;
  onDelete: (postID: number) => Promise<void>;
  onUpdate?: (body: updatePostType, postID: number) => void | Promise<void>;
}

// Batas maksimal komentar yang ditampilkan pada mode preview di timeline beranda
const PREVIEW_COMMENTS = 2;

export default function PostCard(props: Types) {
  const {
    name,
    avatar,
    caption,
    time,
    updatedAt,
    withOption,
    imgUrl,
    withInputComment,
    showAllComments,
    postID,
    likes,
    liked,
    comments,
    onLike,
    onComment,
    onCommentUpdate,
    onCommentDelete,
    onDelete,
    onUpdate,
  } = props;
  const { user } = useToken();

  // State visibilitas modal konfirmasi hapus dan modal edit post
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Filter komentar yang ditampilkan (seluruhnya di halaman detail, atau 2 komentar terbaru di timeline)
  const shown = showAllComments ? comments : comments.slice(-PREVIEW_COMMENTS);
  const hidden = comments.length - shown.length; // Jumlah komentar yang disembunyikan

  return (
    <Card className="mb-4 w-full overflow-hidden">
      <CardContent className="p-5">
        {/* Header Postingan: Avatar, Nama Penulis, dan Tanggal Publikasi */}
        <header className="flex items-start gap-3">
          <UserAvatar name={name} src={avatar} className="h-10 w-10" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[15px] font-medium">{name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {/* Waktu relatif dan tooltip tanggal lengkap */}
              <time dateTime={time} title={fullDate(time)}>
                {timeAgo(time)}
              </time>
              {updatedAt && (
                <span title={`Diedit ${fullDate(updatedAt)}`}> · diedit</span>
              )}
            </p>
          </div>

          {/* Menu Opsi Titik Tiga (Hanya untuk pemilik postingan) */}
          {withOption && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="-mr-1.5 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                aria-label="Opsi postingan"
              >
                <Ellipsis className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 p-1.5">
                <DropdownMenuItem
                  className="gap-2.5 py-2 cursor-pointer"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2.5 py-2 text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>

        {/* Teks Isi Postingan (Caption) */}
        {caption && (
          <p className="mt-3 whitespace-pre-wrap break-words font-serif text-[18px] leading-[1.65]">
            {caption}
          </p>
        )}

        {/* Gambar Lampiran Postingan (Jika Ada) */}
        {imgUrl && (
          <img
            src={imgUrl}
            alt={caption ? `Gambar postingan: ${caption.slice(0, 60)}` : `Gambar postingan ${name}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="mt-3.5 max-h-[520px] w-full rounded-xl border object-cover"
          />
        )}

        {/* Tombol Interaksi: Like dan Jumlah Komentar */}
        <div className="-ml-3 mt-3 flex items-center gap-1">
          <LikeButton liked={liked} count={likes} onToggle={() => onLike(postID)} />
          <Link
            to={`/post/${postID}`}
            aria-label={`Buka komentar (${comments.length})`}
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <MessageCircle className="h-[18px] w-[18px]" />
            <span className="tabular-nums">{comments.length}</span>
          </Link>
        </div>

        {/* Bagian Diskusi Komentar */}
        {(comments.length > 0 || withInputComment) && (
          <div className="mt-3 space-y-4 border-t pt-4">
            {/* Tautan untuk melihat sisa komentar yang belum dimuat */}
            {hidden > 0 && (
              <Link
                to={`/post/${postID}`}
                className="inline-block text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Lihat {hidden} komentar sebelumnya
              </Link>
            )}

            {/* Daftar Komentar */}
            {shown.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                isOwner={c.user_id === user?.id}
                onUpdate={onCommentUpdate}
                onDelete={onCommentDelete}
              />
            ))}

            {/* Input Form Kirim Komentar */}
            {withInputComment && (
              <CommentForm postID={postID} onComment={onComment} />
            )}
          </div>
        )}
      </CardContent>

      {/* Modal Dialog Edit Postingan */}
      <EditPost
        caption={caption}
        imgUrl={imgUrl}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSubmit={async (data) => {
          await onUpdate?.(data, postID);
          setShowEditDialog(false);
        }}
      />

      {/* Dialog Konfirmasi Hapus Postingan */}
      <Alert
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Hapus postingan ini?"
        description="Postingan beserta like dan komentarnya akan dihapus permanen dan tidak dapat dikembalikan."
        actionText="Hapus"
        destructive
        onAction={async () => {
          try {
            await onDelete(postID);
            setShowDeleteDialog(false);
          } catch (error) {
            // Error ditangani di hook
          }
        }}
        onCancel={() => {
          setShowDeleteDialog(false);
        }}
      />
    </Card>
  );
}
