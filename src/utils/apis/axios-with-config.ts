/**
 * Konfigurasi Axios HTTP Client:
 * - Mendukung switch mode antara Backend Sungguhan (REST API server) dan Mock Dummy API (localStorage).
 * - Menangani inject header Authorization: Bearer <token> secara otomatis lewat request interceptor.
 */

import axios from "axios";
import { mockAdapter } from "../mock/adapter";

/**
 * Toggle Mode API:
 * - true  : Berjalan dalam mode dummy tanpa backend server (menggunakan adapter localStorage).
 * - false : Mengirim HTTP request sungguhan ke server backend (baseURL).
 */
export const USE_DUMMY_API = true;

// Inisialisasi instance axios
const axiosWithConfig = axios.create(
  USE_DUMMY_API ? { adapter: mockAdapter } : {}
);

// Variabel penyimpan token JWT aktif dalam memori
let bearerToken = "";

/**
 * Memperbarui token autentikasi yang akan disisipkan ke header Authorization
 */
export const setAxiosConfig = (token: string) => {
  bearerToken = token;
};

// Request Interceptor: menambahkan baseURL dan header Bearer token di setiap request keluar
axiosWithConfig.interceptors.request.use((axiosConfig) => {
  axiosConfig.baseURL = "http://54.169.185.156:8000";

  if (bearerToken) {
    axiosConfig.headers.Authorization = `Bearer ${bearerToken}`;
  }

  return axiosConfig;
});

export default axiosWithConfig;
