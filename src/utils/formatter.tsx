/**
 * Utilitas Pemeriksa & Pemformat Nilai FormData:
 * Digunakan saat mengonversi objek JavaScript menjadi objek FormData
 * untuk pengiriman file (multipart/form-data) ke API backend.
 */

/**
 * Mengecek apakah suatu properti memiliki isi yang valid untuk dimasukkan ke FormData:
 * - File: harus memiliki ukuran > 0 byte.
 * - String: tidak boleh string kosong ("").
 * - Boolean / Number: selalu valid jika ada nilainya.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const checkProperty = (property: any) => {
  if (property instanceof File) {
    if (property.size !== 0) return true;
  }

  if (typeof property === "string") {
    if (property !== "") return true;
  }

  if (typeof property === "boolean") {
    return true;
  }

  if (typeof property === "number") {
    return true;
  }

  return false;
};

/**
 * Mengonversi nilai ke tipe yang sesuai untuk FormData append:
 * Jika File dikembalikan sebagai Blob/File, selain itu dikonversi ke String.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const valueFormatData = (value: any) => {
  if (value instanceof File) {
    return value as Blob;
  }

  return String(value);
};
