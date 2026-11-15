import { Response, ResponseData } from "@/utils/types/api";
import { getErrorMessage } from "@/utils/apis/get-error-message";
import axiosWithConfig from "../axios-with-config";
import { INotification } from "./type";

/**
 * Mengambil daftar notifikasi untuk pengguna yang sedang login
 */
export async function getNotifications() {
  try {
    const response = await axiosWithConfig.get("/notifications");
    return response.data as ResponseData<INotification[]>;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
}

/**
 * Mengambil jumlah notifikasi yang belum dibaca
 */
export async function getUnreadNotificationCount() {
  try {
    const response = await axiosWithConfig.get("/notifications/unread-count");
    return response.data as ResponseData<{ unread_count: number }>;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
}

/**
 * Menandai semua notifikasi telah dibaca
 */
export async function markAllNotificationsRead() {
  try {
    const response = await axiosWithConfig.patch("/notifications/read-all");
    return response.data as Response;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
}

/**
 * Menandai satu notifikasi telah dibaca
 */
export async function markNotificationRead(id: number) {
  try {
    const response = await axiosWithConfig.patch(`/notifications/${id}/read`);
    return response.data as Response;
  } catch (error) {
    throw Error(getErrorMessage(error));
  }
}
