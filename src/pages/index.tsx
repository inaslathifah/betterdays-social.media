/**
 * Halaman Beranda (Home / Timeline Feed):
 * Menampilkan:
 * 1. Sapaan dinamis berdasarkan jam saat ini (Pagi, Siang, Sore, Malam) dan nama depan pengguna.
 * 2. Form pembuatan postingan baru (CreatePost).
 * 3. Indikator loading (Skeleton) saat data diambil dari server.
 * 4. Daftar linimasa postingan (PostCard) dengan fitur suka (like), komentar, edit, dan hapus.
 */

import { useEffect, useState } from "react";
import Layout from "@/components/layout";
import PostCard from "@/components/post-card";
import CreatePost from "@/components/create-post";
import { EmptyFeed, FeedSkeleton } from "@/components/feed-state";
import { toast } from "sonner";

import { getAllPosts } from "@/utils/apis/post/api";
import { IPost } from "@/utils/apis/post/type";
import { useToken } from "@/utils/contexts/token";
import { usePostActions } from "@/utils/hooks/use-post-actions";

/**
 * Menghitung ucapan salam bahasa Inggris yang sesuai dengan jam lokal pengguna saat ini
 */
function greeting() {
  const h = new Date().getHours();
  if (h >= 4 && h < 11) return "Good Morning";
  if (h >= 11 && h < 18) return "Good Afternoon";
  if (h >= 21 && h < 23) return "Good Night";
  return "Good Evening";
}

function Home() {
  // State daftar postingan di linimasa
  const [posts, setPosts] = useState<IPost[]>([]);
  // State indikator loading saat fetch data awal
  const [loading, setLoading] = useState(true);
  const { user } = useToken();

  // Muat data postingan pertama kali saat halaman dibuka
  useEffect(() => {
    fetchPost();
  }, []);

  /**
   * Mengambil seluruh data postingan dari API
   */
  async function fetchPost() {
    try {
      const result = await getAllPosts();
      setPosts(result.data);
    } catch (error) {
      toast.error((error as Error).message.toString());
    } finally {
      setLoading(false);
    }
  }

  // Gunakan kustom hook untuk menangani berbagai aksi postingan & komentar
  const {
    addPost,
    addComment,
    editComment,
    removeComment,
    handleDelete,
    handleUpdate,
    handleLike,
  } = usePostActions(setPosts, fetchPost);

  // Ambil nama depan pengguna untuk sapaan hangat
  const firstName = user?.name.split(" ")[0];

  return (
    <Layout withUser navBlue centerX>
      {/* Bagian Header Sapaan Pengguna */}
      <header className="mb-2 mt-2 flex items-center justify-center text-center">
        <h2 className="font-serif text-[34px] font-normal leading-tight tracking-tight sm:text-[40px]">
          {greeting()}
          {firstName ? `, ${firstName}` : ""}
        </h2>
      </header>

      {/* Komponen Form Pembuatan Postingan Baru */}
      <CreatePost onsubmit={(data) => addPost(data)} />

      {/* Kondisi Tampilan: Loading Skeleton / Data Kosong / Daftar Kartu Postingan */}
      {loading ? (
        <FeedSkeleton />
      ) : posts.length === 0 ? (
        <EmptyFeed>Belum ada postingan. Buatlah cerita pertamamu ~</EmptyFeed>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
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
            // Tombol edit/hapus hanya muncul jika postingan milik pengguna yang login
            withOption={post.user_id === user?.id}
            withInputComment
            onLike={handleLike}
            onComment={addComment}
            onCommentUpdate={editComment}
            onCommentDelete={removeComment}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))
      )}
    </Layout>
  );
}

export default Home;
