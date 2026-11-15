/**
 * Layanan API Pengguna (User API):
 * Mengelola komunikasi HTTP untuk mengambil data profil pribadi, memperbarui profil,
 * mengganti password, menghapus akun, mencari pengguna, dan mengambil profil publik user lain.
 */

import { ResponseData, Response } from "@/utils/types/api";
import { getErrorMessage } from "@/utils/apis/get-error-message";
import axiosWithConfig from "../axios-with-config";
import { ChangePasswordType, IFollowUser, IProfile, UpdateProfileType } from "./type";
import { checkProperty, valueFormatData } from "@/utils/formatter";

/**
 * Mengambil data profil lengkap milik pengguna yang sedang login
 */
export async function getProfile() {
  try {
    const response = await axiosWithConfig.get("/users");

    return response.data as ResponseData<IProfile>;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
}

/**
 * Mengambil profil publik pengguna lain berdasarkan ID
 */
export async function getPublicProfile(userId: number | string) {
  try {
    const response = await axiosWithConfig.get(`/users/${userId}`);
    return response.data as ResponseData<IProfile>;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
}

/**
 * Mencari pengguna berdasarkan nama atau email
 */
export async function searchUsers(query: string) {
  try {
    const response = await axiosWithConfig.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data as ResponseData<IProfile[]>;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
}

/**
 * Memperbarui data profil pengguna (nama, bio, foto avatar)
 */
export async function updateProfile(body: UpdateProfileType) {
  try {
    const formData = new FormData();
    let key: keyof typeof body;
    for (key in body) {
      if (key === "remove_avatar") {
        body[key] && formData.append(key, "true");
      } else if (checkProperty(body[key]) || key === "bio") {
        formData.append(key, valueFormatData(body[key]));
      }
    }

    const response = await axiosWithConfig.put("/users", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data as ResponseData<IProfile>;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
}

/**
 * Mengganti kata sandi pengguna dengan memverifikasi password lama terlebih dahulu
 */
export async function changePassword(body: ChangePasswordType) {
  try {
    const response = await axiosWithConfig.put("/users/password", body);

    return response.data as Response;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
}

/**
 * Menghapus akun pengguna secara permanen dari sistem
 */
export async function deleteUser(idUser: string) {
  try {
    const response = await axiosWithConfig.delete(`/users/${idUser}`);

    return response.data as ResponseData;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
}

/**
 * Mengikuti atau berhenti mengikuti pengguna (toggle follow)
 */
export async function toggleFollowUser(userId: number | string) {
  try {
    const response = await axiosWithConfig.post(`/users/${userId}/follow`);
    return response.data as ResponseData<{ following: boolean; followers_count: number }>;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
}

/**
 * Mengambil daftar pengikut (followers) dari pengguna
 */
export async function getUserFollowers(userId: number | string) {
  try {
    const response = await axiosWithConfig.get(`/users/${userId}/followers`);
    return response.data as ResponseData<IFollowUser[]>;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
}

/**
 * Mengambil daftar pengguna yang diikuti (following) oleh pengguna
 */
export async function getUserFollowing(userId: number | string) {
  try {
    const response = await axiosWithConfig.get(`/users/${userId}/following`);
    return response.data as ResponseData<IFollowUser[]>;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
}