// =====================================================================
// Mock In-Browser Database (LocalStorage) - Betterdays
// Mengemulasikan basis data relasional (RDBMS) di dalam browser pengguna.
// Semua perubahan data disimpan ke localStorage sehingga data tetap ada
// saat halaman di-refresh.
// =====================================================================

// Struktur baris data untuk tabel Users
export interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string; // Berisi string hash bcrypt
  avatar: string | null;
  bio: string | null;
  created_at: string;
}

// Struktur baris data untuk tabel Posts
export interface PostRow {
  id: number;
  user_id: number;
  content: string | null;
  image: string | null;
  created_at: string;
  updated_at: string | null;
}

// Struktur baris data untuk tabel Likes
export interface LikeRow {
  id: number;
  user_id: number;
  post_id: number;
  created_at: string;
}

// Struktur baris data untuk tabel Comments
export interface CommentRow {
  id: number;
  post_id: number;
  user_id: number;
  comment: string | null;
  image: string | null;
  created_at: string;
}

// Struktur baris data untuk tabel Sessions (Token login aktif)
export interface SessionRow {
  token: string;
  user_id: number;
  created_at: string;
}

// Keseluruhan struktur basis data lokal
export interface DB {
  counters: { users: number; posts: number; likes: number; comments: number };
  users: UserRow[];
  posts: PostRow[];
  likes: LikeRow[];
  comments: CommentRow[];
  sessions: SessionRow[];
}

// Kunci penyimpanan utama di localStorage
const STORAGE_KEY = "betterdays_db_v1";
// Kunci penyimpanan lama (untuk kompatibilitas migrasi otomatis jika ada)
const LEGACY_STORAGE_KEY = "connectspace_db_v1";

// Hash bcrypt ("password123", salt rounds: 10) — password standar akun seed/demo
const SEED_HASH =
  "$2b$10$rh/gML4z7hDckIk88InJO.qJZxSNOQ5oyq20EhoRM7ZYDr6c7LHlK";

// Kredensial akun demo bawaan untuk kemudahan testing / login cepat
export const DEMO_PASSWORD = "password123";
export const DEMO_EMAIL = "inas@betterdays.id";

// Fungsi pembantu untuk membuat timestamp relatif mundur beberapa menit
const ago = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

// URL generator avatar inisial otomatis dari DiceBear
const avatar = (seed: string) =>
  `https://api.dicebear.com/10.x/initials/svg?seed=${seed}&backgroundColor=f1e4d8,e3ddd0,d9e4dc,e1dff0`;

// URL generator foto sample dari Picsum
const photo = (seed: string, w = 960, h = 640) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

/**
 * Membuat data awal (seeding) jika aplikasi baru dibuka pertama kali
 * atau saat tombol reset data demo ditekan.
 */
function seed(): DB {
  const users: UserRow[] = [
    {
      id: 1,
      name: "Inas Lathifah",
      email: "inas@betterdays.id",
      password: SEED_HASH,
      avatar: avatar("Inas"),
      bio: "Front-End Engineer | Web Developer | IT Enthusiast",
      created_at: ago(60 * 24 * 40),
    },
    {
      id: 2,
      name: "Rakha Shafly Meiabyan",
      email: "rakha@betterdays.id",
      password: SEED_HASH,
      avatar: avatar("Rakha"),
      bio: "Backend engineer yang diam-diam senang CSS.",
      created_at: ago(60 * 24 * 35),
    },
    {
      id: 3,
      name: "Daffa Salsabila",
      email: "dapos@betterdays.id",
      password: SEED_HASH,
      avatar: avatar("Dapos"),
      bio: "Design Grafis Expert",
      created_at: ago(60 * 24 * 20),
    },
    {
      id: 4,
      name: "Aira Wibi",
      email: "Aira@betterdays.id",
      password: SEED_HASH,
      avatar: null,
      bio: null,
      created_at: ago(60 * 24 * 7),
    },
  ];

  const posts: PostRow[] = [
    {
      id: 1,
      user_id: 3,
      content:
        "Matahari terbit di Bromo pagi ini. Dingin sekali, tapi semuanya terbayar begitu kabut mulai turun.",
      image: photo("bromo-sunrise", 960, 720),
      created_at: ago(35),
      updated_at: null,
    },
    {
      id: 2,
      user_id: 2,
      content:
        "Hari ini akhirnya selesai migrasi database tanpa downtime. Pelajaran terbesarnya: tulis rollback dulu, baru tulis migrasinya.",
      image: null,
      created_at: ago(95),
      updated_at: null,
    },
    {
      id: 3,
      user_id: 1,
      content: "Meja kerja minggu ini. Sederhana, tapi cukup.",
      image: photo("desk-setup", 960, 640),
      created_at: ago(60 * 5),
      updated_at: ago(60 * 4),
    },
    {
      id: 4,
      user_id: 4,
      content:
        "Ada rekomendasi buku non-fiksi yang ringan dibaca untuk teman di perjalanan? Perjalanan kereta saya dua jam setiap hari. Hadeuh melelahkan. Tapi, I need Moneyy.",
      image: null,
      created_at: ago(60 * 22),
      updated_at: null,
    },
    {
      id: 5,
      user_id: 3,
      content: null,
      image: photo("rice-terrace", 960, 640),
      created_at: ago(60 * 30),
      updated_at: null,
    },
    {
      id: 6,
      user_id: 1,
      content:
        "Prototipe pertama Betterdays sudah bisa dicoba. Masukan apa pun sangat dihargai.",
      image: null,
      created_at: ago(60 * 52),
      updated_at: null,
    },
  ];

  const likes: LikeRow[] = [
    { id: 1, user_id: 1, post_id: 1, created_at: ago(30) },
    { id: 2, user_id: 2, post_id: 1, created_at: ago(28) },
    { id: 3, user_id: 4, post_id: 1, created_at: ago(20) },
    { id: 4, user_id: 1, post_id: 2, created_at: ago(80) },
    { id: 5, user_id: 3, post_id: 3, created_at: ago(60 * 4) },
    { id: 6, user_id: 2, post_id: 3, created_at: ago(60 * 3) },
    { id: 7, user_id: 3, post_id: 6, created_at: ago(60 * 40) },
  ];

  const comments: CommentRow[] = [
    {
      id: 1,
      post_id: 1,
      user_id: 1,
      comment: "Cantik banget. Jam berapa berangkat dari rumah?",
      image: null,
      created_at: ago(25),
    },
    {
      id: 2,
      post_id: 1,
      user_id: 3,
      comment: "Sekitar jam 3 pagi. Worth it gasiii",
      image: null,
      created_at: ago(18),
    },
    {
      id: 3,
      post_id: 4,
      user_id: 1,
      comment: "Coba 'Atomic Habits' atau 'Sapiens'. Dua-duanya enak dibaca sepotong-sepotong.",
      image: null,
      created_at: ago(60 * 20),
    },
    {
      id: 4,
      post_id: 3,
      user_id: 2,
      comment: "Setup yang bersih. Ini lampunya yang mana?",
      image: photo("desk-lamp", 480, 320),
      created_at: ago(60 * 3),
    },
  ];

  return {
    counters: { users: 4, posts: 6, likes: 7, comments: 4 },
    users,
    posts,
    likes,
    comments,
    sessions: [],
  };
}

// Simpan objek database di memori agar performa baca cepat
let cache: DB | null = null;

/**
 * Memuat database dari memori / localStorage.
 * Bila belum ada data atau data corrupt, akan dilakukan seed awal.
 */
export function loadDB(): DB {
  if (cache) return cache;
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    // Migrasi data lama dari Connect Space jika belum ada Betterdays di browser user
    if (!raw) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }

    if (raw) {
      cache = JSON.parse(raw) as DB;
      return cache;
    }
  } catch {
    // Data rusak / JSON tidak valid -> buat ulang dari seed
  }
  cache = seed();
  persist(cache);
  return cache;
}

/**
 * Menyimpan seluruh state database ke localStorage browser.
 */
export function persist(db: DB) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    throw new StorageFullError();
  }
}

/**
 * Error khusus bila kuota penyimpanan localStorage browser telah habis.
 */
export class StorageFullError extends Error {
  constructor() {
    super(
      "Penyimpanan browser penuh. Hapus beberapa postingan bergambar atau reset data demo."
    );
  }
}

/**
 * Mereset database demo ke kondisi awal dan menghapus token login aktif.
 */
export function resetDB() {
  cache = null;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  localStorage.removeItem("token");
}

/**
 * Error validasi constraint (misal email duplikat atau foreign key tidak ada).
 */
export class ConstraintError extends Error {}

/**
 * Mendapatkan auto-increment ID berikutnya untuk tabel tertentu.
 */
export function nextId(db: DB, table: keyof DB["counters"]) {
  db.counters[table] += 1;
  return db.counters[table];
}

/**
 * Mencari user berdasarkan alamat email secara case-insensitive.
 */
export function findUserByEmail(db: DB, email: string) {
  const e = email.trim().toLowerCase();
  return db.users.find((u) => u.email.toLowerCase() === e);
}

/**
 * Menambahkan data user baru ke tabel users.
 */
export function insertUser(
  db: DB,
  data: Pick<UserRow, "name" | "email" | "password">
) {
  if (findUserByEmail(db, data.email)) {
    throw new ConstraintError("Email sudah terdaftar");
  }
  const row: UserRow = {
    id: nextId(db, "users"),
    name: data.name,
    email: data.email.trim().toLowerCase(),
    password: data.password,
    avatar: null,
    bio: null,
    created_at: new Date().toISOString(),
  };
  db.users.push(row);
  return row;
}

/**
 * Menambahkan data suka (like). Menjaga integritas UNIQUE KEY (user_id, post_id).
 */
export function insertLike(db: DB, user_id: number, post_id: number) {
  if (!db.posts.some((p) => p.id === post_id)) {
    throw new ConstraintError("Foreign key post_id tidak valid");
  }
  if (db.likes.some((l) => l.user_id === user_id && l.post_id === post_id)) {
    throw new ConstraintError("Duplicate entry (user_id, post_id)");
  }
  const row: LikeRow = {
    id: nextId(db, "likes"),
    user_id,
    post_id,
    created_at: new Date().toISOString(),
  };
  db.likes.push(row);
  return row;
}

/**
 * Menghapus post sekaligus data likes dan komentar terkait (ON DELETE CASCADE).
 */
export function deletePostRow(db: DB, post_id: number) {
  db.posts = db.posts.filter((p) => p.id !== post_id);
  db.likes = db.likes.filter((l) => l.post_id !== post_id);
  db.comments = db.comments.filter((c) => c.post_id !== post_id);
}

/**
 * Menghapus user sekaligus semua post, like, comment, dan session miliknya (ON DELETE CASCADE).
 */
export function deleteUserRow(db: DB, user_id: number) {
  const postIds = db.posts.filter((p) => p.user_id === user_id).map((p) => p.id);
  postIds.forEach((id) => deletePostRow(db, id));
  db.likes = db.likes.filter((l) => l.user_id !== user_id);
  db.comments = db.comments.filter((c) => c.user_id !== user_id);
  db.sessions = db.sessions.filter((s) => s.user_id !== user_id);
  db.users = db.users.filter((u) => u.id !== user_id);
}
