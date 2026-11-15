export interface INotification {
  id: number;
  actor_id: number;
  actor_name: string;
  actor_avatar: string | null;
  type: "like" | "comment" | "follow";
  post_id: number | null;
  comment_id: number | null;
  post_content: string | null;
  post_image: string | null;
  is_read: boolean;
  created_at: string;
}
