import { isAxiosError } from "axios";

export function getErrorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan, silakan coba lagi...";
}
