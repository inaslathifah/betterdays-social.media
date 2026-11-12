/**
 * Utility Penggabungan Class Tailwind:
 * Mengkombinasikan `clsx` (untuk kondisional nama class) dan
 * `tailwind-merge` (untuk menyelesaikan konflik class Tailwind secara otomatis).
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fungsi pembantu `cn`:
 * Contoh penggunaan: cn("px-4 py-2", isPrimary && "bg-blue-500", className)
 * Jika ada konflik class (misal 'p-4' dan 'p-2'), twMerge akan memenangkan yang terakhir.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
