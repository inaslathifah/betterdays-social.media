/**
 * Custom Hook: usePostActions
 * Mengelompokkan seluruh logika interaksi postingan dan komentar:
 * - Menambah postingan (addPost)
 * - Menghapus postingan (handleDelete)
 * - Memperbarui postingan (handleUpdate)
 * - Menyukai / Batal menyukai (handleLike dengan Optimistic UI Update)
 * - Menambah, mengedit, dan menghapus komentar
 * - Menambah, like, dan menghapus reply komentar
 */

import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import {
  createPost,
  deletePost,
  toggleLike,
  updatePost,
} from "@/utils/apis/post/api";
import { IPost, createPostType, updatePostType } from "@/utils/apis/post/type";
import {
  createComment,
  createReply,
  deleteComment,
  deleteReply,
  toggleReplyLike,
  updateComment,
} from "@/utils/apis/comment/api";
import { CommentType, IReply } from "@/utils/apis/comment/type";

/**
 * Memperbarui satu balasan (di level mana pun) secara rekursif di dalam pohon balasan.
 */
function patchReplyTree(
  replies: IReply[] | undefined,
  replyID: number,
  patch: (r: IReply) => IReply
): IReply[] {
  return (replies ?? []).map((r) =>
    r.id === replyID
      ? patch(r)
      : { ...r, replies: patchReplyTree(r.replies, replyID, patch) }
  );
}

export function usePostActions(
  setPosts: Dispatch<SetStateAction<IPost[]>>,
  refetch: () => Promise<void>
) {
  /**
   * Membuat postingan baru
   */
  async function addPost(data: createPostType) {
    try {
      const result = await createPost(data);
      toast.success(result.message);
      await refetch();
    } catch (error) {
      toast.error((error as Error).message);
      throw error; // Lempar error kembali agar form tidak di-reset saat gagal
    }
  }

  /**
   * Mengirim komentar baru pada postingan
   */
  async function addComment(data: CommentType) {
    try {
      const result = await createComment(data);
      toast.success(result.message);
      await refetch();
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  }

  /**
   * Mengedit teks komentar atau menghapus gambarnya
   */
  async function editComment(
    commentID: number,
    body: { comment: string; remove_image?: boolean }
  ) {
    try {
      const result = await updateComment(commentID, body);
      toast.success(result.message);
      await refetch();
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  }

  /**
   * Menghapus sebuah komentar
   */
  async function removeComment(commentID: number) {
    try {
      const result = await deleteComment(commentID);
      toast.success(result.message);
      await refetch();
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  }

  /**
   * Menambahkan balasan ke komentar, atau ke balasan lain (bercabang) bila parentReplyID diisi
   */
  async function addReply(
    commentID: number,
    replyText: string,
    parentReplyID?: number | null
  ): Promise<IReply | void> {
    try {
      const result = await createReply(commentID, replyText, parentReplyID);
      toast.success(result.message);
      await refetch();
      return result.data;
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  }

  /**
   * Toggle like pada reply komentar (Optimistic Update)
   */
  async function handleReplyLike(replyID: number) {
    // Optimistic update: balik status liked di lokal (termasuk balasan bercabang)
    setPosts((prev) =>
      prev.map((post) => ({
        ...post,
        comments: post.comments.map((c) => ({
          ...c,
          replies: patchReplyTree(c.replies, replyID, (r) => ({
            ...r,
            liked: !r.liked,
            likes_count: r.likes_count + (r.liked ? -1 : 1),
          })),
        })),
      }))
    );
    try {
      const result = await toggleReplyLike(replyID);
      // Sinkronkan dengan data server
      setPosts((prev) =>
        prev.map((post) => ({
          ...post,
          comments: post.comments.map((c) => ({
            ...c,
            replies: patchReplyTree(c.replies, replyID, (r) => ({
              ...r,
              liked: result.data.liked,
              likes_count: result.data.likes_count,
            })),
          })),
        }))
      );
    } catch (error) {
      toast.error((error as Error).message);
      await refetch();
    }
  }

  /**
   * Menghapus sebuah reply
   */
  async function removeReply(replyID: number) {
    try {
      const result = await deleteReply(replyID);
      toast.success(result.message);
      await refetch();
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  }

  /**
   * Menghapus postingan berdasarkan ID
   */
  async function handleDelete(postID: number) {
    try {
      const result = await deletePost(postID);
      toast.success(result.message);
      // Hapus langsung dari state lokal agar UI segera terupdate
      setPosts((prev) => prev.filter((p) => p.id !== postID));
    } catch (error) {
      toast.error((error as Error).message.toString());
      throw error;
    }
  }

  /**
   * Memperbarui isi teks/gambar postingan
   */
  async function handleUpdate(body: updatePostType, postID: number) {
    try {
      const result = await updatePost(body, postID);
      toast.success(result.message);
      await refetch();
    } catch (error) {
      toast.error((error as Error).message.toString());
      throw error;
    }
  }

  /**
   * Mengubah status suka (Like/Unlike) pada postingan.
   * Menerapkan Optimistic Update: UI diubah secara instan sebelum respons server selesai.
   * Bila request gagal, data postingan akan di-refetch ulang untuk mengembalikan status asli.
   */
  async function handleLike(postID: number) {
    // 1. Optimistic update langsung di state lokal (respon terasa instan tanpa jeda jaringan)
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postID
          ? {
              ...p,
              liked: !p.liked,
              likes_count: p.likes_count + (p.liked ? -1 : 1),
            }
          : p
      )
    );
    try {
      // 2. Kirim request ke backend
      const result = await toggleLike(postID);
      // 3. Sinkronkan dengan hasil pasti dari server
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postID
            ? { ...p, liked: result.data.liked, likes_count: result.data.likes_count }
            : p
        )
      );
    } catch (error) {
      // 4. Jika gagal, tampilkan toast dan refresh data untuk membatalkan perubahan tampilan
      toast.error((error as Error).message);
      await refetch();
    }
  }

  return {
    addPost,
    addComment,
    editComment,
    removeComment,
    addReply,
    handleReplyLike,
    removeReply,
    handleDelete,
    handleUpdate,
    handleLike,
  };
}
