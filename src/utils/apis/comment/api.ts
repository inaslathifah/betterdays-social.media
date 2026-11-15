import { CommentType, IReply } from "./type";
import { getErrorMessage } from "@/utils/apis/get-error-message";
import { Response, ResponseData } from "@/utils/types/api";
import axiosWithConfig from "../axios-with-config";
import { checkProperty, valueFormatData } from "@/utils/formatter";

export async function createComment(data: CommentType) {
  try {
    const formData = new FormData();
    let key: keyof typeof data;
    for (key in data) {
      if (checkProperty(data[key])) {
        formData.append(key, valueFormatData(data[key]));
      }
    }

    const result = await axiosWithConfig.post("/comments", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return result.data as Response;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
}

export async function deleteComment(commentID: number | string) {
  try {
    const response = await axiosWithConfig.delete(`/comments/${commentID}`);

    return response.data as Response;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
}

export async function updateComment(
  commentID: number,
  body: { comment: string; remove_image?: boolean }
) {
  try {
    const response = await axiosWithConfig.put(`/comments/${commentID}`, body);

    return response.data as Response;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
}

/**
 * Menambahkan balasan ke suatu komentar, atau ke balasan lain bila parentReplyID diisi
 */
export async function createReply(
  commentID: number,
  reply: string,
  parentReplyID?: number | null
) {
  try {
    const response = await axiosWithConfig.post(`/comments/${commentID}/replies`, {
      reply,
      parent_reply_id: parentReplyID ?? null,
    });
    return response.data as ResponseData<IReply>;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
}

/**
 * Menghapus balasan
 */
export async function deleteReply(replyID: number) {
  try {
    const response = await axiosWithConfig.delete(`/replies/${replyID}`);
    return response.data as Response;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
}

/**
 * Toggle like pada balasan komentar
 */
export async function toggleReplyLike(replyID: number) {
  try {
    const response = await axiosWithConfig.post(`/replies/${replyID}/like`);
    return response.data as ResponseData<{ liked: boolean; likes_count: number }>;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
}
