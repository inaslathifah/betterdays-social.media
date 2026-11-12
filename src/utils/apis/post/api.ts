/**
 * Layanan API Postingan (Post API):
 * Mengelola interaksi HTTP untuk mengambil daftar post, melihat detail postingan,
 * membuat post baru, mengedit, menghapus, serta memberi/membatalkan like.
 */

import { ResponseData, Response, Request } from "@/utils/types/api";
import { getErrorMessage } from "@/utils/apis/get-error-message";
import axiosWithConfig from "../axios-with-config";
import {
  IComments,
  ILikeResult,
  IPost,
  IPostWithComments,
  createPostType,
  updatePostType,
} from "./type";
import { checkProperty, valueFormatData } from "@/utils/formatter";

/**
 * Mengambil daftar semua postingan (timeline feed).
 * Mendukung filter parameter opsional seperti user_id atau page.
 */
export async function getAllPosts(params?: Request) {
  try {
    let query = "";

    if (params) {
      const queryParams: string[] = [];

      let key: keyof typeof params;
      for (key in params) {
        queryParams.push(`${key}=${params[key]}`);
      }

      query = queryParams.join("&");
    }

    const url = query ? `/posts?${query}` : "/posts";
    const response = await axiosWithConfig.get(url);

    return response.data as ResponseData<IPost[]>;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
}

/**
 * Mengambil satu postingan spesifik berdasarkan ID beserta seluruh komentarnya
 */
export async function getPostWithID(postID: string) {
  try {
    const response = await axiosWithConfig.get(`/posts/${postID}`);

    return response.data as ResponseData<IPostWithComments<IComments[]>>;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
}

/**
 * Membuat postingan baru dengan teks caption dan/atau berkas gambar (multipart/form-data)
 */
export const createPost = async (body: createPostType) => {
  try {
    const formData = new FormData();
    let key: keyof typeof body;
    for (key in body) {
      if (checkProperty(body[key])) {
        formData.append(key, valueFormatData(body[key]));
      }
    }

    const response = await axiosWithConfig.post("/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data as Response;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
};

/**
 * Memperbarui data postingan tertentu (caption dan/atau pergantian gambar)
 */
export async function updatePost(body: updatePostType, postID: number) {
  try {
    const formData = new FormData();

    let key: keyof typeof body;
    for (key in body) {
      if (checkProperty(body[key])) {
        formData.append(key, valueFormatData(body[key]));
      }
    }
    // caption boleh dikosongkan saat edit (selama masih ada gambar)
    if (!formData.has("caption")) formData.append("caption", "");

    const response = await axiosWithConfig.put(`/posts/${postID}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data as Response;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
}

/**
 * Menghapus sebuah postingan berdasarkan ID
 */
export async function deletePost(postID: number) {
  try {
    const response = await axiosWithConfig.delete(`/posts/${postID}`);

    return response.data as Response;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
}

/**
 * Toggle Suka (Like/Unlike):
 * Mengirim request untuk menyukai postingan. Jika sebelumnya sudah disukai,
 * sistem akan membatalkannya (unlike).
 */
export async function toggleLike(postID: number) {
  try {
    const response = await axiosWithConfig.post(`/posts/${postID}/like`);

    return response.data as ResponseData<ILikeResult>;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
}
