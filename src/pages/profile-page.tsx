/**
 * Halaman Profil Pribadi (Profile Page):
 * Menampilkan:
 * 1. Komponen kartu bio profil (foto, nama, email, bio, dan total postingan).
 * 2. Form pembuatan postingan langsung dari halaman profil.
 * 3. Daftar riwayat postingan yang khusus diunggah oleh pengguna yang sedang login.
 */

import Layout from "@/components/layout";
import PostCard from "@/components/post-card";
import CreatePost from "@/components/create-post";
import { BioProfile } from "@/components/bio-profile";
import FollowModal from "@/components/follow-modal";
import { EmptyFeed, FeedSkeleton } from "@/components/feed-state";
import { useCallback, useEffect, useState } from "react";
import { getAllPosts } from "@/utils/apis/post/api";
import { toast } from "sonner";
import { IPost } from "@/utils/apis/post/type";
import { useToken } from "@/utils/contexts/token";
import { usePostActions } from "@/utils/hooks/use-post-actions";

function ProfilePage() {
  // State daftar postingan milik user yang login
  const [posts, setPosts] = useState<IPost[]>([]);
  // Indikator loading data
  const [loading, setLoading] = useState(true);
  const [followModalType, setFollowModalType] = useState<"followers" | "following" | null>(null);
  const { user, refreshUser } = useToken();

  const userId = user?.id;

  /**
   * Mengambil postingan dari API dengan filter user_id dari user yang sedang aktif
   */
  const fetchPost = useCallback(async () => {
    try {
      const result = await getAllPosts({ user_id: userId });
      setPosts(result.data);
    } catch (error) {
      toast.error((error as Error).message.toString());
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // `user` ikut jadi dependensi agar daftar dimuat ulang setelah profil diubah
  useEffect(() => {
    if (user) {
      fetchPost();
      refreshUser();
    }
  }, [userId]);

  // Hook untuk mengelola interaksi postingan & komentar
  const {
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
  } = usePostActions(setPosts, fetchPost);

  return (
    <Layout withUser navBlue centerX>
      {/* Informasi Kartu Bio Profil Pengguna */}
      <BioProfile
        userId={user?.id}
        name={user?.name}
        email={user?.email}
        bio={user?.bio}
        avatar={user?.avatar}
        totalPost={posts.length}
        followersCount={user?.followers_count ?? 0}
        followingCount={user?.following_count ?? 0}
        onFollowersClick={() => setFollowModalType("followers")}
        onFollowingClick={() => setFollowModalType("following")}
      />

      {/* Modal Pengikut & Mengikuti */}
      {user && (
        <FollowModal
          userId={user.id}
          type={followModalType}
          open={!!followModalType}
          onOpenChange={(op) => !op && setFollowModalType(null)}
          onFollowChange={() => refreshUser()}
        />
      )}

      {/* Form Tambah Postingan Baru */}
      <CreatePost onsubmit={(data) => addPost(data)} />

      {/* Linimasa Postingan Khusus Milik Pengguna Ini */}
      {loading ? (
        <FeedSkeleton />
      ) : posts.length === 0 ? (
        <EmptyFeed>Kamu belum memposting apapun.</EmptyFeed>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            postID={post.id}
            userId={post.user_id}
            name={post.name}
            avatar={post.avatar}
            caption={post.caption}
            location={post.location}
            time={post.created_at}
            updatedAt={post.updated_at}
            imgUrl={post.image}
            likes={post.likes_count}
            liked={post.liked}
            comments={post.comments}
            withOption // Di halaman profil sendiri, opsi edit/hapus selalu aktif
            withInputComment
            onLike={handleLike}
            onComment={addComment}
            onCommentUpdate={editComment}
            onCommentDelete={removeComment}
            onReply={addReply}
            onReplyLike={handleReplyLike}
            onReplyDelete={removeReply}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))
      )}
    </Layout>
  );
}

export default ProfilePage;
