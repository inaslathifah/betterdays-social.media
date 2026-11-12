/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Mock Axios Adapter:
 * Mengalihkan panggilan HTTP Axios ke server tiruan (in-memory mock server) di browser
 * tanpa memerlukan jaringan internet atau backend yang sedang aktif.
 * Memberikan jeda waktu simulasi (latency) agar animasi loading terlihat alami seperti aslinya.
 */

import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { ConstraintError, StorageFullError } from "./db";
import { HttpError, handle } from "./server";

// Simulasi latensi jaringan (280ms standar, 120ms untuk like agar responsif)
const LATENCY_MS = 280;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Mengurai payload data permintaan dari FormData, JSON string, atau objek biasa
 */
function parseBody(data: unknown): Record<string, any> {
  if (!data) return {};
  if (typeof FormData !== "undefined" && data instanceof FormData) {
    const out: Record<string, any> = {};
    data.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  return data as Record<string, any>;
}

/**
 * Mengekstrak token dari header Authorization: Bearer <token>
 */
function bearer(config: InternalAxiosRequestConfig) {
  const raw = config.headers?.get?.("Authorization") ?? null;
  return typeof raw === "string" && raw.startsWith("Bearer ")
    ? raw.slice(7)
    : null;
}

/**
 * Fungsi custom adapter utama untuk Axios:
 * Menerima request config Axios, mengeksekusi routing di mock server,
 * dan mengembalikan AxiosResponse yang valid atau melempar AxiosError.
 */
export async function mockAdapter(
  config: InternalAxiosRequestConfig
): Promise<AxiosResponse> {
  const url = new URL(config.url ?? "/", "http://dummy.local");
  const isLike = url.pathname.endsWith("/like");
  // Berikan sedikit delay buatan meniru respon jaringan asli
  await sleep(isLike ? 120 : LATENCY_MS);

  const base = { statusText: "", headers: {}, config, request: {} };

  try {
    const result = await handle({
      method: (config.method ?? "get").toLowerCase(),
      path: url.pathname,
      query: url.searchParams,
      body: parseBody(config.data),
      token: bearer(config),
    });
    return { ...base, status: result.status, data: result.data };
  } catch (err) {
    let status = 500;
    let message = "Terjadi kesalahan pada server";

    if (err instanceof HttpError) {
      status = err.status;
      message = err.message;
    } else if (err instanceof ConstraintError) {
      status = 409;
      message = err.message;
    } else if (err instanceof StorageFullError) {
      status = 507;
      message = err.message;
    } else {
      console.error(err);
    }

    const response: AxiosResponse = {
      ...base,
      status,
      data: { code: status, message },
    };

    throw new AxiosError(
      message,
      status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
      config,
      {},
      response
    );
  }
}
