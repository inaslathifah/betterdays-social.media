/**
 * Tipe Data Respon & Permintaan API Standar:
 * Menyeragamkan format balasan JSON dari API backend.
 */

/**
 * Format standar respon API yang membawa payload data:
 * - code: status HTTP code (misal 200, 201)
 * - data: payload data dengan tipe generik T
 * - message: pesan keberhasilan atau deskripsi hasil dari server
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResponseData<T = any> = {
  code: number;
  data: T;
  message: string;
};

/**
 * Format respon API sederhana (tanpa payload data, hanya kode status dan pesan)
 */
export type Response = {
  code: number;
  message: string;
};

/**
 * Parameter query string umum untuk request API:
 * - user_id: filter berdasarkan ID user
 * - page: nomor halaman pagination data
 */
export interface Request {
  user_id?: number;
  page?: string | number;
}
