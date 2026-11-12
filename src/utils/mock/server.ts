/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Mock Server HTTP Handler - Betterdays:
 * Mengemulasikan seluruh backend REST API di dalam browser:
 * - Autentikasi: POST /login, POST /users (register + auto login), POST /logout
 * - Profil: GET /users, PUT /users (edit profil & avatar), PUT /users/password, DELETE /users/:id
 * - Postingan: GET /posts, POST /posts, GET /posts/:id, PUT /posts/:id, DELETE /posts/:id, POST /posts/:id/like
 * - Komentar: POST /comments, PUT /comments/:id, DELETE /comments/:id
 * 
 * Menggunakan enkripsi kata sandi asli (bcrypt), validasi field, pembatasan otorisasi (ownership),
 * dan penyimpanan persisten ke database mock localStorage.
 */

import bcrypt from "bcryptjs";
import {
  ConstraintError,
  DB,
  PostRow,
  StorageFullError,
  UserRow,
  deletePostRow,
  deleteUserRow,
  findUserByEmail,
  insertLike,
  insertUser,
  loadDB,
  persist,
} from "./db";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_SIZE,
  fileToDataURL,
  isSafeImageUrl,
} from "../image";

/**
 * Kelas error HTTP kustom yang membawa status code (401, 403, 404, 422, dll)
 */
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Struktur data request yang diterima server mock
interface Req {
  method: string;
  path: string;
  query: URLSearchParams;
  body: Record<string, any>;
  token: string | null;
}

type Result = { status: number; data: any };

// Helper pembuat format response standar
const ok = (message: string, data?: any, status = 200): Result => ({
  status,
  data: { code: status, message, data },
});

/* ------------------------------ Helper Internal ------------------------------ */

/**
 * Memvalidasi token sesi dan mengembalikan baris UserRow yang sedang login.
 * Melempar error HTTP 401 jika token tidak ada atau tidak valid.
 */
function authUser(db: DB, token: string | null): UserRow {
  const session = token ? db.sessions.find((s) => s.token === token) : null;
  const user = session && db.users.find((u) => u.id === session.user_id);
  if (!user) throw new HttpError(401, "Sesi tidak valid, silakan login kembali");
  return user;
}

/**
 * Menghasilkan token acak yang aman (kriptografis) dengan awalan "bd_" (Betterdays)
 */
function newToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return (
    "bd_" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
  );
}

/**
 * Membuat sesi login baru untuk user_id dan menyimpan tokennya ke tabel sessions
 */
function createSession(db: DB, userId: number) {
  const token = newToken();
  db.sessions.push({
    token,
    user_id: userId,
    created_at: new Date().toISOString(),
  });
  return token;
}

/**
 * Memfilter kolom sensitif (seperti password hash) agar tidak terkirim ke klien
 */
const publicUser = (u: UserRow) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  avatar: u.avatar,
  bio: u.bio,
  created_at: u.created_at,
});

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/**
 * Memproses gambar: baik dari unggahan berkas (File) maupun URL teks.
 * Gambar berkas dikonversi ke Base64 terkompresi.
 */
async function resolveImage(
  body: Record<string, any>,
  fileKey: string,
  urlKey: string,
  maxDim: number
): Promise<string | null> {
  const file = body[fileKey];
  if (file instanceof Blob && file.size > 0) {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      throw new HttpError(422, "Hanya format JPG, PNG, atau WEBP yang didukung");
    }
    if (file.size > MAX_UPLOAD_SIZE) {
      throw new HttpError(422, "Ukuran gambar maksimal 2MB");
    }
    try {
      return await fileToDataURL(file as File, maxDim);
    } catch (e) {
      throw new HttpError(422, (e as Error).message);
    }
  }
  const url = str(body[urlKey]);
  if (url) {
    if (!isSafeImageUrl(url)) {
      throw new HttpError(422, "URL gambar tidak valid (harus http/https)");
    }
    return url;
  }
  return null;
}

/**
 * Mengonversi baris CommentRow menjadi objek komentar lengkap beserta data penulisnya
 */
function toComment(db: DB, c: DB["comments"][number]) {
  const u = db.users.find((x) => x.id === c.user_id);
  return {
    id: c.id,
    post_id: c.post_id,
    user_id: c.user_id,
    name: u?.name ?? "Pengguna",
    avatar: u?.avatar ?? null,
    comment: c.comment ?? "",
    image: c.image,
    created_at: c.created_at,
  };
}

/**
 * Mengonversi baris PostRow menjadi objek postingan lengkap (penulis, hitung like, komentar, status like)
 */
function toPost(db: DB, p: PostRow, me: UserRow) {
  const author = db.users.find((u) => u.id === p.user_id);
  const comments = db.comments
    .filter((c) => c.post_id === p.id)
    .sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id - b.id)
    .map((c) => toComment(db, c));
  return {
    id: p.id,
    user_id: p.user_id,
    name: author?.name ?? "Pengguna",
    avatar: author?.avatar ?? null,
    caption: p.content ?? "",
    image: p.image,
    created_at: p.created_at,
    updated_at: p.updated_at,
    likes_count: db.likes.filter((l) => l.post_id === p.id).length,
    liked: db.likes.some((l) => l.post_id === p.id && l.user_id === me.id),
    comments,
  };
}

// Pengurutan postingan berdasarkan waktu terbaru
const byNewest = (a: PostRow, b: PostRow) =>
  b.created_at.localeCompare(a.created_at) || b.id - a.id;

/* ------------------------------ Routing Handler Server ------------------------------ */

export async function handle(req: Req): Promise<Result> {
  const db = loadDB();
  const { method, path, query, body } = req;
  let m: RegExpMatchArray | null;

  /* ---- Rute Autentikasi ---- */

  // POST /login: Verifikasi kredensial dan kembalikan token sesi
  if (method === "post" && path === "/login") {
    const email = str(body.email);
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) {
      throw new HttpError(422, "Email dan password wajib diisi");
    }
    const user = findUserByEmail(db, email);
    // Selalu bandingkan hash dummy jika email tidak ditemukan untuk mencegah timing attack
    const hash = user?.password ?? "$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin";
    const valid = await bcrypt.compare(password, hash);
    if (!user || !valid) throw new HttpError(401, "Email atau password salah");

    const token = createSession(db, user.id);
    persist(db);
    return ok("Login berhasil", { ...publicUser(user), token });
  }

  // POST /users: Mendaftarkan user baru dan langsung membuat sesi login (auto-login)
  if (method === "post" && path === "/users") {
    const name = str(body.fullname);
    const email = str(body.email).toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";
    const confirm =
      typeof body.confirm_password === "string" ? body.confirm_password : "";

    if (!name) throw new HttpError(422, "Nama lengkap wajib diisi");
    if (name.length > 100) throw new HttpError(422, "Nama maksimal 100 karakter");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 150) {
      throw new HttpError(422, "Format email tidak valid");
    }
    if (password.length < 6) {
      throw new HttpError(422, "Password minimal 6 karakter");
    }
    if (password !== confirm) {
      throw new HttpError(422, "Konfirmasi password tidak cocok");
    }
    if (findUserByEmail(db, email)) {
      throw new HttpError(409, "Email sudah terdaftar");
    }

    const hash = await bcrypt.hash(password, 10);
    const user = insertUser(db, { name, email, password: hash });
    const token = createSession(db, user.id);
    persist(db);
    return ok("Registrasi berhasil, selamat datang!", {
      ...publicUser(user),
      token,
    }, 201);
  }

  // POST /logout: Menghapus token sesi dari basis data
  if (method === "post" && path === "/logout") {
    if (req.token) {
      db.sessions = db.sessions.filter((s) => s.token !== req.token);
      persist(db);
    }
    return ok("Logout berhasil");
  }

  // Seluruh rute di bawah ini memerlukan otorisasi (wajib login)
  const me = authUser(db, req.token);

  /* ---- Rute Profil Pengguna ---- */

  // GET /users: Mengambil data profil pengguna yang login
  if (method === "get" && path === "/users") {
    return ok("Success", publicUser(me));
  }

  // PUT /users: Memperbarui nama, bio, atau avatar foto profil
  if (method === "put" && path === "/users") {
    const name = str(body.name);
    if (!name) throw new HttpError(422, "Nama wajib diisi");
    if (name.length > 100) throw new HttpError(422, "Nama maksimal 100 karakter");
    const bio = str(body.bio);
    if (bio.length > 300) throw new HttpError(422, "Bio maksimal 300 karakter");

    const newAvatar = await resolveImage(body, "avatar", "avatar_url", 320);
    me.name = name;
    me.bio = bio || null;
    if (newAvatar) me.avatar = newAvatar;
    else if (body.remove_avatar === "true") me.avatar = null;
    persist(db);
    return ok("Profil berhasil diperbarui", publicUser(me));
  }

  // PUT /users/password: Mengubah kata sandi akun
  if (method === "put" && path === "/users/password") {
    const oldPw = typeof body.old_password === "string" ? body.old_password : "";
    const newPw = typeof body.new_password === "string" ? body.new_password : "";
    const confirm =
      typeof body.confirm_password === "string" ? body.confirm_password : "";

    if (!(await bcrypt.compare(oldPw, me.password))) {
      throw new HttpError(422, "Password lama salah");
    }
    if (newPw.length < 6) throw new HttpError(422, "Password baru minimal 6 karakter");
    if (newPw !== confirm) throw new HttpError(422, "Konfirmasi password baru tidak cocok");
    if (newPw === oldPw) {
      throw new HttpError(422, "Password baru harus berbeda dari password lama");
    }
    me.password = await bcrypt.hash(newPw, 10);
    persist(db);
    return ok("Password berhasil diubah");
  }

  // DELETE /users/:id: Menghapus akun pengguna (hanya bisa menghapus akun sendiri)
  if (method === "delete" && (m = path.match(/^\/users\/(\d+)$/))) {
    if (Number(m[1]) !== me.id) throw new HttpError(403, "Tidak diizinkan");
    deleteUserRow(db, me.id);
    persist(db);
    return ok("Akun berhasil dihapus");
  }

  /* ---- Rute Postingan (Posts) ---- */

  // GET /posts: Mengambil feed postingan (opsional filter ?user_id=...)
  if (method === "get" && path === "/posts") {
    const uid = query.get("user_id");
    let rows = [...db.posts];
    if (uid) rows = rows.filter((p) => p.user_id === Number(uid));
    rows.sort(byNewest);
    return ok("Success", rows.map((p) => toPost(db, p, me)));
  }

  // POST /posts: Membuat postingan baru
  if (method === "post" && path === "/posts") {
    const content = str(body.caption);
    const image = await resolveImage(body, "image", "image_url", 1280);
    if (!content && !image) {
      throw new HttpError(422, "Tulis sesuatu atau lampirkan gambar");
    }
    if (content.length > 2000) throw new HttpError(422, "Maksimal 2000 karakter");

    db.counters.posts += 1;
    db.posts.push({
      id: db.counters.posts,
      user_id: me.id,
      content: content || null,
      image,
      created_at: new Date().toISOString(),
      updated_at: null,
    });
    persist(db);
    return ok("Postingan berhasil dibuat", undefined, 201);
  }

  // Endpoint dengan ID postingan (/posts/:id)
  if ((m = path.match(/^\/posts\/(\d+)$/))) {
    const post = db.posts.find((p) => p.id === Number(m![1]));
    if (!post) throw new HttpError(404, "Postingan tidak ditemukan");

    // GET /posts/:id: Melihat detail postingan dan komentar
    if (method === "get") return ok("Success", toPost(db, post, me));

    // Otorisasi: hanya pemilik post yang boleh mengedit atau menghapus
    if (post.user_id !== me.id) {
      throw new HttpError(403, "Kamu hanya bisa mengubah atau menghapus postingan milikmu");
    }

    // DELETE /posts/:id: Menghapus postingan
    if (method === "delete") {
      deletePostRow(db, post.id);
      persist(db);
      return ok("Postingan berhasil dihapus");
    }

    // PUT /posts/:id: Mengubah teks atau gambar postingan
    if (method === "put") {
      const content = str(body.caption);
      const newImage = await resolveImage(body, "image", "image_url", 1280);
      const image = newImage ?? (body.remove_image === "true" ? null : post.image);
      if (!content && !image) {
        throw new HttpError(422, "Postingan tidak boleh kosong tanpa teks dan gambar");
      }
      post.content = content || null;
      post.image = image;
      post.updated_at = new Date().toISOString();
      persist(db);
      return ok("Postingan berhasil diperbarui");
    }
  }

  // POST /posts/:id/like: Menyukai / Membatalkan like pada postingan
  if (method === "post" && (m = path.match(/^\/posts\/(\d+)\/like$/))) {
    const postId = Number(m[1]);
    if (!db.posts.some((p) => p.id === postId)) {
      throw new HttpError(404, "Postingan tidak ditemukan");
    }
    const existing = db.likes.findIndex(
      (l) => l.post_id === postId && l.user_id === me.id
    );
    let liked: boolean;
    if (existing >= 0) {
      db.likes.splice(existing, 1); // Batalkan like
      liked = false;
    } else {
      insertLike(db, me.id, postId); // Berikan like
      liked = true;
    }
    persist(db);
    return ok(liked ? "Disukai" : "Batal suka", {
      liked,
      likes_count: db.likes.filter((l) => l.post_id === postId).length,
    });
  }

  /* ---- Rute Komentar (Comments) ---- */

  // POST /comments: Menambah komentar baru ke suatu postingan
  if (method === "post" && path === "/comments") {
    const postId = Number(body.post_id);
    if (!db.posts.some((p) => p.id === postId)) {
      throw new HttpError(404, "Postingan tidak ditemukan");
    }
    const text = str(body.comment);
    const image = await resolveImage(body, "image", "image_url", 960);
    if (!text && !image) {
      throw new HttpError(422, "Tulis komentar atau lampirkan gambar");
    }
    if (text.length > 1000) throw new HttpError(422, "Maksimal 1000 karakter");

    db.counters.comments += 1;
    db.comments.push({
      id: db.counters.comments,
      post_id: postId,
      user_id: me.id,
      comment: text || null,
      image,
      created_at: new Date().toISOString(),
    });
    persist(db);
    return ok("Komentar terkirim", undefined, 201);
  }

  // Endpoint dengan ID komentar (/comments/:id)
  if ((m = path.match(/^\/comments\/(\d+)$/))) {
    const c = db.comments.find((x) => x.id === Number(m![1]));
    if (!c) throw new HttpError(404, "Komentar tidak ditemukan");
    // Otorisasi: hanya penulis komentar yang boleh mengedit atau menghapus
    if (c.user_id !== me.id) {
      throw new HttpError(403, "Kamu hanya bisa mengubah atau menghapus komentar milikmu");
    }

    // DELETE /comments/:id: Menghapus komentar
    if (method === "delete") {
      db.comments = db.comments.filter((x) => x.id !== c.id);
      persist(db);
      return ok("Komentar berhasil dihapus");
    }

    // PUT /comments/:id: Mengedit isi komentar
    if (method === "put") {
      const text = str(body.comment);
      const image = body.remove_image === "true" || body.remove_image === true ? null : c.image;
      if (!text && !image) {
        throw new HttpError(422, "Komentar tidak boleh kosong tanpa teks dan gambar");
      }
      if (text.length > 1000) throw new HttpError(422, "Maksimal 1000 karakter");
      c.comment = text || null;
      c.image = image;
      persist(db);
      return ok("Komentar berhasil diperbarui");
    }
  }

  throw new HttpError(404, "Endpoint tidak ditemukan");
}

export { ConstraintError, StorageFullError };
