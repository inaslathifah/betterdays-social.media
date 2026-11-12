/**
 * Fungsi Layanan API Autentikasi (Auth):
 * Menangani request HTTP terkait login, register, dan logout pengguna.
 */

import axiosWithConfig from "@/utils/apis/axios-with-config";
import { getErrorMessage } from "@/utils/apis/get-error-message";
import { Response, ResponseData } from "@/utils/types/api";
import { LoginType, RegisterType } from "./type";

// Struktur data payload yang dikembalikan server saat login / register berhasil
export interface LoginPayload {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  created_at: string;
  token: string;
}

/**
 * Melakukan autentikasi login pengguna dengan email dan password
 */
export const userLogin = async (body: LoginType) => {
  try {
    const response = await axiosWithConfig.post("/login", body);

    return response.data as ResponseData<LoginPayload>;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
};

/**
 * Mendaftarkan akun pengguna baru ke sistem (otomatis auto-login dan mengembalikan token)
 */
export const userRegister = async (body: RegisterType) => {
  try {
    const response = await axiosWithConfig.post("/users", body);
    return response.data as ResponseData<LoginPayload>;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
};

/**
 * Mengirim permintaan logout ke server untuk menghapus token sesi aktif
 */
export const userLogout = async () => {
  try {
    const response = await axiosWithConfig.post("/logout");
    return response.data as Response;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
};
