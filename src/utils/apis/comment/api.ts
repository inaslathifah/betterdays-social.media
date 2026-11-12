import { CommentType } from "./type";
import { getErrorMessage } from "@/utils/apis/get-error-message";
import { Response } from "@/utils/types/api";
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
