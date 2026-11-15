/**
 * Halaman Profil Pengguna Lain (User Profile Page):
 * Diakses lewat /user/:userId (klik nama/avatar di postingan, komentar, atau balasan).
 * Menampilkan:
 * 1. Kartu bio publik user tersebut (tanpa tombol Edit profil & email).
 * 2. Daftar postingan milik user tersebut (tanpa form buat postingan).
 * Jika userId sama dengan user yang sedang login, otomatis diarahkan ke /profile.
 */

import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout";
import PostCard from "@/components/post-card";
import { BioProfile } from "@/components/bio-profile";
import FollowModal from "@/components/follow-modal";
import { EmptyFeed, FeedSkeleton } from "@/components/feed-state";
import { getAllPosts } from "@/utils/apis/post/api";
import { getPublicProfile, toggleFollowUser } from "@/utils/apis/user/api";
import { IPost } from "@/utils/apis/post/type";
import { IProfile } from "@/utils/apis/user/type";
import { useToken } from "@/utils/contexts/token";
import { usePostActions } from "@/utils/hooks/use-post-actions";

export default function UserProfilePage() {
  const { userId } = useParams();
  const { user } = useToken();

  const [profile, setProfile] = useState<IProfile>();
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followModalType, setFollowModalType] = useState<"followers" | "following" | null>(null);

  const id = Number(userId);

  /**
   * Mengambil profil publik + postingan milik user yang dituju
   */
  const fetchData = useCallback(async () => {
    try {
      const [profileRes, postsRes] = await Promise.all([
        getPublicProfile(id),
        getAllPosts({ user_id: id }),
      ]);
      setProfile(profileRes.data);
      setPosts(postsRes.data);
      setNotFound(false);
    } catch (error) {
      setNotFound(true);
      toast.error((error as Error).message.toString());
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!Number.isInteger(id) || id <= 0) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchData();
  }, [id, fetchData]);

  const handleToggleFollow = async () => {
    if (!profile) return;
    setFollowLoading(true);
    try {
      const res = await toggleFollowUser(profile.id);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              is_following: res.data.following,
              followers_count: res.data.followers_count,
            }
          : prev
      );
      toast.success(
        res.data.following
          ? `Mengikuti ${profile.name}`
          : `Berhenti mengikuti ${profile.name}`
      );
    } catch (err) {
      toast.error((err as Error).message || "Gagal mengubah status ikuti");
    } finally {
      setFollowLoading(false);
    }
  };

  // Hook interaksi (like, komentar, balasan bercabang). Hanya refetch postingan yang berubah.
  const {
    addComment,
    editComment,
    removeComment,
    addReply,
    handleReplyLike,
    removeReply,
    handleDelete,
    handleUpdate,
    handleLike,
  } = usePostActions(setPosts, fetchData);

  // Melihat profil sendiri -> arahkan ke halaman profil pribadi
  if (user && user.id === id) return <Navigate to="/profile" replace />;

  return (
    <Layout withUser navBlue centerX>
      <Link
        to="/"
        className="mb-5 inline-flex items-center gap-1.5 self-start text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke beranda
      </Link>

      {loading ? (
        <FeedSkeleton />
      ) : notFound || !profile ? (
        <p className="py-16 text-center text-muted-foreground">
          Pengguna tidak ditemukan.
        </p>
      ) : (
        <>
          <BioProfile
            userId={profile.id}
            name={profile.name}
            bio={profile.bio}
            avatar={profile.avatar}
            totalPost={posts.length}
            followersCount={profile.followers_count ?? 0}
            followingCount={profile.following_count ?? 0}
            isOwn={false}
            isFollowing={profile.is_following}
            followLoading={followLoading}
            onToggleFollow={handleToggleFollow}
            onFollowersClick={() => setFollowModalType("followers")}
            onFollowingClick={() => setFollowModalType("following")}
          />

          <FollowModal
            userId={profile.id}
            type={followModalType}
            open={!!followModalType}
            onOpenChange={(op) => !op && setFollowModalType(null)}
            onFollowChange={fetchData}
          />

          {posts.length === 0 ? (
            <EmptyFeed>{profile.name} belum memposting apapun.</EmptyFeed>
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
                withOption={false}
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
        </>
      )}
    </Layout>
  );
}
