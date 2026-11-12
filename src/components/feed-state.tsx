/**
 * Komponen State Tampilan Linimasa (Feed States):
 * 1. FeedSkeleton: Menampilkan animasi kerangka placeholder (skeleton loading) saat data postingan sedang dimuat.
 * 2. EmptyFeed: Menampilkan kotak bergaris putus-putus dengan pesan ramah saat belum ada postingan.
 */

import { ReactNode } from "react";

/**
 * Animasi Placeholder Loading Kartu Postingan
 */
export function FeedSkeleton() {
  return (
    <div className="w-full space-y-4" aria-hidden="true">
      {[0, 1].map((i) => (
        <div key={i} className="w-full animate-pulse rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-secondary" />
            <div className="space-y-2">
              <div className="h-3 w-32 rounded bg-secondary" />
              <div className="h-2.5 w-20 rounded bg-secondary" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3.5 w-full rounded bg-secondary" />
            <div className="h-3.5 w-3/4 rounded bg-secondary" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Tampilan Saat Belum Ada Konten (Empty State)
 */
export function EmptyFeed({ children }: { children: ReactNode }) {
  return (
    <div className="w-full rounded-2xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
