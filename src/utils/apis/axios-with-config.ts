/**
 * Konfigurasi Axios HTTP Client:
 * - Mengirim request ke backend REST API (lihat folder `server/`).
 * - Menyisipkan header Authorization: Bearer <token> secara otomatis lewat request interceptor.
 *
 * Alamat backend diatur lewat variabel `VITE_API_URL` (lihat `.env.example`).
 * Default "/api" -> diteruskan ke server backend oleh proxy Vite saat development.
 */

import axios from "axios";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";

const axiosWithConfig = axios.create({ baseURL: API_URL });

// Variabel penyimpan token JWT aktif dalam memori
let bearerToken = "";

/**
 * Memperbarui token autentikasi yang akan disisipkan ke header Authorization
 */
export const setAxiosConfig = (token: string) => {
  bearerToken = token;
};

// Request Interceptor: menambahkan header Bearer token di setiap request keluar
axiosWithConfig.interceptors.request.use((axiosConfig) => {
  if (bearerToken) {
    axiosConfig.headers.Authorization = `Bearer ${bearerToken}`;
  }
  return axiosConfig;
});

export default axiosWithConfig;
