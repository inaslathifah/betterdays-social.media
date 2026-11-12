/**
 * Halaman Detail Postingan & Diskusi Komentar:
 * Menampilkan satu postingan secara mendalam dengan seluruh daftar komentarnya (showAllComments: true),
 * formulir penambahan komentar, serta tombol aksi like, edit, dan hapus.
 */

import Layout from "@/components/layout";
import PostCard from "@/components/post-card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { deletePost, getPostWithID, toggleLike, updatePost } from "@/utils/apis/post/api";
import { IComments, IPostWithComments, updatePostType } from "@/utils/apis/post/type";
import { createComment, deleteComment, updateComment } from "@/utils/apis/comment/api";
import { CommentUpdateBody } from "@/components/comment-item";
import { CommentType } from "@/utils/apis/comment/type";
import { useToken } from "@/utils/contexts/token";
import { FeedSkeleton } from "@/components/feed-state";

import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function PostWithComment() {
  // State data postingan spesifik beserta relasi komentarnya
  const [post, setPost] = useState<IPostWithComments<IComments[]>>();
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useToken();

  const postID = params.postID;

  const fetchPost = useCallback(async () => {
    try {
      const result = await getPostWithID(postID!);
      setPost(result.data);
    } catch (error) {
      toast.error((error as Error).message.toString());
    } finally {
      setLoading(false);
    }
  }, [postID]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  /**
   * Mengirim komentar baru ke postingan ini
   */
  async function addComment(data: CommentType) {
    try {
      const result = await createComment(data);
      toast.success(result.message);
      await fetchPost();
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  }

  /**
   * Mengedit teks komentar
   */
  async function editComment(commentID: number, body: CommentUpdateBody) {
    try {
      const result = await updateComment(commentID, body);
      toast.success(result.message);
      await fetchPost();
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  }

  /**
   * Menghapus komentar
   */
  async function removeComment(commentID: number) {
    try {
      const result = await deleteComment(commentID);
      toast.success(result.message);
      await fetchPost();
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  }

  /**
   * Menangani aksi suka / batal suka dengan optimistik respons
   */
  async function handleLike(postID: number) {
    setPost((p) =>
      p && {
        ...p,
        liked: !p.liked,
        likes_count: p.likes_count + (p.liked ? -1 : 1),
      }
    );
    try {
      const result = await toggleLike(postID);
      setPost((p) => p && { ...p, ...result.data });
    } catch (error) {
      toast.error((error as Error).message);
      fetchPost();
    }
  }

  /**
   * Menghapus postingan ini dan mengalihkan user kembali ke Beranda
   */
  async function handleDelete(postID: number) {
    try {
      const result = await deletePost(postID);
      toast.success(result.message);
      navigate("/", { replace: true });
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  }

  /**
   * Memperbarui caption atau gambar postingan ini
   */
  async function handleUpdate(body: updatePostType, postID: number) {
    try {
      const result = await updatePost(body, postID);
      toast.success(result.message);
      await fetchPost();
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  }

  return (
    <Layout withUser navBlue centerX>
      {/* Tautan Navigasi Kembali ke Beranda */}
      <Link
        to="/"
        className="mb-5 inline-flex items-center gap-1.5 self-start text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke beranda
      </Link>

      {/* Loading Skeleton */}
      {loading && <FeedSkeleton />}

      {/* Tampilan jika postingan tidak ditemukan */}
      {!loading && !post && (
        <p className="py-16 text-center text-muted-foreground">
          Postingan tidak ditemukan atau sudah dihapus.
        </p>
      )}

      {/* Kartu Postingan Utama dan Seluruh Komentarnya */}
      {post && (
        <PostCard
          postID={post.id}
          name={post.name}
          avatar={post.avatar}
          caption={post.caption}
          time={post.created_at}
          updatedAt={post.updated_at}
          imgUrl={post.image}
          likes={post.likes_count}
          liked={post.liked}
          comments={post.comments}
          withOption={post.user_id === user?.id}
          withInputComment
          showAllComments // Buka seluruh komentar secara penuh di halaman ini
          onLike={handleLike}
          onComment={addComment}
          onCommentUpdate={editComment}
          onCommentDelete={removeComment}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      )}
    </Layout>
  );
}
