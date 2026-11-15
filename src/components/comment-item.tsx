/**
 * Komponen Baris Komentar (CommentItem):
 * Menampilkan komentar pengguna pada sebuah postingan:
 * - Avatar & nama penulis komentar (klik nama/avatar → profil user lain)
 * - Timestamp relatif (timeAgo)
 * - Teks komentar dan/atau gambar yang dilampirkan
 * - Menu opsi (Edit & Hapus) jika user yang login adalah pemilik komentar
 * - Mode inline-editing (Textarea langsung di tempat) dengan tombol Simpan & Batal
 * - Dialog konfirmasi sebelum menghapus komentar (Alert)
 * - Tombol Reply untuk membalas komentar
 * - Daftar reply BERCABANG (rekursif): setiap reply bisa dibalas lagi, lengkap dengan Like & Hapus
 * - Indentasi dibatasi (MAX_INDENT) agar tetap rapi di layar mobile
 */

import { useState } from "react";
import { Ellipsis, Heart, Pencil, Reply, Trash2, MapPin } from "lucide-react";
import { IComments, IReply } from "@/utils/apis/comment/type";
import { fullDate, timeAgo } from "@/utils/date";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import UserAvatar from "./user-avatar";
import Alert from "./alert";
import { ImagePreview } from "./image-attach";
import { useToken } from "@/utils/contexts/token";

export interface CommentUpdateBody {
  comment: string;
  remove_image?: boolean;
}

interface Props {
  comment: IComments;
  isOwner?: boolean; // Bernilai true jika komentar ini ditulis oleh pengguna yang sedang aktif
  onUpdate?: (commentID: number, body: CommentUpdateBody) => void | Promise<void>;
  onDelete?: (commentID: number) => void | Promise<void>;
  onReply?: (
    commentID: number,
    replyText: string,
    parentReplyID?: number | null
  ) => Promise<IReply | void>;
  onReplyLike?: (replyID: number) => Promise<void>;
  onReplyDelete?: (replyID: number) => Promise<void>;
}

export default function CommentItem({
  comment,
  isOwner,
  onUpdate,
  onDelete,
  onReply,
  onReplyLike,
  onReplyDelete,
}: Props) {
  const { user } = useToken();

  // State untuk mode edit komentar
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.comment);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  // State dialog konfirmasi hapus komentar
  const [showDelete, setShowDelete] = useState(false);

  // State untuk reply
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);

  // State konfirmasi hapus reply
  const [deleteReplyId, setDeleteReplyId] = useState<number | null>(null);

  const hasImage = !!comment.image && !removeImage;
  const empty = text.trim() === "" && !hasImage;

  const replies = comment.replies ?? [];
  const visibleReplies = showAllReplies ? replies : replies.slice(0, 2);
  const hiddenReplies = replies.length - visibleReplies.length;

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

  // Kirim reply
  async function submitReply() {
    if (!replyText.trim() || sendingReply) return;
    setSendingReply(true);
    try {
      await onReply?.(comment.id, replyText.trim());
      setReplyText("");
      setShowReplyInput(false);
      setShowAllReplies(true);
    } catch {
      // Tangani di luar
    } finally {
      setSendingReply(false);
    }
  }

  return (
    <div className="flex gap-3">
      {/* Avatar Penulis Komentar (klik → profil user lain) */}
      <Link to={`/user/${comment.user_id}`} className="mt-0.5 shrink-0">
        <UserAvatar
          name={comment.name}
          src={comment.avatar}
          className="h-8 w-8 text-xs transition-opacity hover:opacity-80"
        />
      </Link>
      <div className="min-w-0 flex-1">
        {/* Header Komentar: Nama Penulis, Waktu Komentar, dan Menu Opsi */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-2">
            <Link
              to={`/user/${comment.user_id}`}
              className="text-[13px] font-medium hover:underline"
            >
              {comment.name}
            </Link>
            <time
              className="text-xs text-muted-foreground"
              dateTime={comment.created_at}
              title={fullDate(comment.created_at)}
            >
              {timeAgo(comment.created_at)}
            </time>
            {comment.location && (
              <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground/90 font-normal">
                <span>·</span>
                <MapPin className="h-3 w-3 text-primary inline shrink-0" />
                <span className="truncate max-w-[140px]">{comment.location}</span>
              </span>
            )}
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
                Tulis komentarmu atau upload gambar meme kamu
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

            {/* Tombol Reply */}
            {onReply && (
              <button
                type="button"
                onClick={() => setShowReplyInput((v) => !v)}
                className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Reply className="h-3.5 w-3.5" />
                Balas
              </button>
            )}
          </>
        )}

        {/* Input Balas Komentar */}
        {showReplyInput && (
          <div className="mt-2 flex items-center gap-2">
            <UserAvatar
              name={user?.name}
              src={user?.avatar}
              className="h-6 w-6 shrink-0 text-[10px]"
            />
            <div className="flex flex-1 items-center gap-1 rounded-full border border-input bg-card pl-3 pr-1 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25">
              <Input
                autoFocus
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Balas ${comment.name}…`}
                maxLength={500}
                disabled={sendingReply}
                className="h-8 border-0 bg-transparent px-0 text-[13px] shadow-none focus-visible:ring-0"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitReply();
                  }
                  if (e.key === "Escape") {
                    setShowReplyInput(false);
                    setReplyText("");
                  }
                }}
              />
              <Button
                type="button"
                size="icon"
                variant="brand"
                disabled={sendingReply || !replyText.trim()}
                onClick={submitReply}
                className="h-6 w-6 shrink-0 rounded-full"
                aria-label="Kirim balasan"
              >
                <Reply className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Daftar Replies (rekursif) */}
        {replies.length > 0 && (
          <div className="mt-2 space-y-2 border-l-2 border-muted pl-3">
            {visibleReplies.map((reply) => (
              <ReplyNode
                key={reply.id}
                reply={reply}
                depth={0}
                commentID={comment.id}
                currentUserId={user?.id}
                onReply={onReply}
                onLike={onReplyLike}
                onRequestDelete={setDeleteReplyId}
              />
            ))}
            {hiddenReplies > 0 && (
              <button
                type="button"
                onClick={() => setShowAllReplies(true)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Lihat {hiddenReplies} balasan lainnya
              </button>
            )}
            {showAllReplies && replies.length > 2 && (
              <button
                type="button"
                onClick={() => setShowAllReplies(false)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Sembunyikan balasan
              </button>
            )}
          </div>
        )}
      </div>

      {/* Dialog Konfirmasi Hapus Komentar */}
      <Alert
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Hapus komentar ini?"
        description="Komentar dan semua balasannya akan dihapus permanen dan tidak dapat dikembalikan."
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

      {/* Dialog Konfirmasi Hapus Reply */}
      <Alert
        open={deleteReplyId !== null}
        onOpenChange={(open) => !open && setDeleteReplyId(null)}
        title="Hapus balasan ini?"
        description="Balasan beserta seluruh balasan di bawahnya akan dihapus permanen dan tidak dapat dikembalikan."
        actionText="Hapus"
        destructive
        onCancel={() => setDeleteReplyId(null)}
        onAction={async () => {
          if (deleteReplyId !== null) {
            try {
              await onReplyDelete?.(deleteReplyId);
              setDeleteReplyId(null);
            } catch {
              // Ditangani pemanggil
            }
          }
        }}
      />
    </div>
  );
}

/* ---- Sub-komponen: Baris Reply (rekursif / bercabang) ---- */

// Level indentasi maksimum. Balasan yang lebih dalam tidak menjorok lagi
// supaya tampilan tetap muat di layar kecil, tapi tetap bisa dibalas.
const MAX_INDENT = 3;
// Pada level >= ini, cabang balasan dilipat secara default
const AUTO_COLLAPSE_DEPTH = 2;

interface ReplyNodeProps {
  reply: IReply;
  depth: number;
  commentID: number;
  currentUserId?: number;
  onReply?: Props["onReply"];
  onLike?: (replyID: number) => Promise<void>;
  onRequestDelete: (replyID: number) => void;
}

function ReplyNode({
  reply,
  depth,
  commentID,
  currentUserId,
  onReply,
  onLike,
  onRequestDelete,
}: ReplyNodeProps) {
  const { user } = useToken();
  const [liking, setLiking] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState(depth < AUTO_COLLAPSE_DEPTH);

  const children = reply.replies ?? [];
  const isOwner = reply.user_id === currentUserId;
  const nextDepth = depth + 1;
  // Hanya menjorok jika belum mencapai batas indentasi
  const indentChildren = nextDepth <= MAX_INDENT;

  async function handleLike() {
    if (liking) return;
    setLiking(true);
    try {
      await onLike?.(reply.id);
    } finally {
      setLiking(false);
    }
  }

  async function submit() {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await onReply?.(commentID, text.trim(), reply.id);
      setText("");
      setShowInput(false);
      setExpanded(true);
    } catch {
      // Error ditangani di hook; isi ketikan dipertahankan
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <Link to={`/user/${reply.user_id}`} className="mt-0.5 shrink-0">
          <UserAvatar
            name={reply.name}
            src={reply.avatar}
            className="h-6 w-6 text-[10px] transition-opacity hover:opacity-80"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <Link
              to={`/user/${reply.user_id}`}
              className="text-[12px] font-medium hover:underline"
            >
              {reply.name}
            </Link>
            <time
              className="text-[11px] text-muted-foreground"
              dateTime={reply.created_at}
              title={fullDate(reply.created_at)}
            >
              {timeAgo(reply.created_at)}
            </time>
          </div>
          <p className="mt-0.5 whitespace-pre-wrap break-words text-[13px] leading-5">
            {reply.reply}
          </p>

          {/* Aksi Reply: Like, Balas, Hapus */}
          <div className="-ml-1 mt-0.5 flex items-center gap-1">
            <button
              type="button"
              onClick={handleLike}
              disabled={liking}
              aria-pressed={reply.liked}
              aria-label={reply.liked ? "Batalkan suka balasan" : "Sukai balasan"}
              className={cn(
                "inline-flex h-7 items-center gap-1 rounded-full px-2 text-[11px] font-medium transition-colors",
                reply.liked
                  ? "text-brand"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Heart
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  liking && "animate-pulse",
                  reply.liked && "fill-current"
                )}
              />
              <span className="tabular-nums">{reply.likes_count}</span>
            </button>

            {/* Tombol Balas (membalas balasan ini -> cabang baru) */}
            {onReply && (
              <button
                type="button"
                onClick={() => setShowInput((v) => !v)}
                className="inline-flex h-7 items-center gap-1 rounded-full px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Reply className="h-3 w-3" />
                Balas
              </button>
            )}

            {isOwner && (
              <button
                type="button"
                onClick={() => onRequestDelete(reply.id)}
                className="inline-flex h-7 items-center gap-1 rounded-full px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                aria-label="Hapus balasan"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Input Balas ke Balasan Ini */}
          {showInput && (
            <div className="mt-1.5 flex items-center gap-2">
              <UserAvatar
                name={user?.name}
                src={user?.avatar}
                className="h-5 w-5 shrink-0 text-[9px]"
              />
              <div className="flex flex-1 items-center gap-1 rounded-full border border-input bg-card pl-3 pr-1 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25">
                <Input
                  autoFocus
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`Balas ${reply.name}…`}
                  maxLength={500}
                  disabled={sending}
                  className="h-7 border-0 bg-transparent px-0 text-[12px] shadow-none focus-visible:ring-0"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submit();
                    }
                    if (e.key === "Escape") {
                      setShowInput(false);
                      setText("");
                    }
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="brand"
                  disabled={sending || !text.trim()}
                  onClick={submit}
                  className="h-5 w-5 shrink-0 rounded-full"
                  aria-label="Kirim balasan"
                >
                  <Reply className="h-2.5 w-2.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cabang: balasan-balasan untuk balasan ini */}
      {children.length > 0 && (
        <div
          className={cn(
            "mt-2 space-y-2",
            indentChildren ? "ml-3 border-l-2 border-muted pl-3" : "ml-0"
          )}
        >
          {!expanded ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Lihat {children.length} balasan
            </button>
          ) : (
            <>
              {children.map((child) => (
                <ReplyNode
                  key={child.id}
                  reply={child}
                  depth={nextDepth}
                  commentID={commentID}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  onLike={onLike}
                  onRequestDelete={onRequestDelete}
                />
              ))}
              {depth >= AUTO_COLLAPSE_DEPTH && (
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Sembunyikan balasan
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
