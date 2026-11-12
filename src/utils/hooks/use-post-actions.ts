/**
 * Custom Hook: usePostActions
 * Mengelompokkan seluruh logika interaksi postingan dan komentar:
 * - Menambah postingan (addPost)
 * - Menghapus postingan (handleDelete)
 * - Memperbarui postingan (handleUpdate)
 * - Menyukai / Batal menyukai (handleLike dengan Optimistic UI Update)
 * - Menambah, mengedit, dan menghapus komentar
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
  deleteComment,
  updateComment,
} from "@/utils/apis/comment/api";
import { CommentType } from "@/utils/apis/comment/type";

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
      // 2. Kirim request ke backend/mock API
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
    handleDelete,
    handleUpdate,
    handleLike,
  };
}
