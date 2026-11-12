/**
 * Komponen Dialog Peringatan & Konfirmasi (Alert):
 * Membungkus AlertDialog shadcn/radix untuk dialog konfirmasi tindakan penting:
 * - Judul dan pesan deskripsi konfirmasi
 * - Tombol Batal (cancelText, default: "Batal")
 * - Tombol Konfirmasi (actionText, default: "Ya")
 * - Dukungan tema `destructive` (warna merah) untuk aksi berisiko seperti hapus data atau reset.
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  title: string;
  description: string;
  cancelText?: string;
  actionText?: string;
  destructive?: boolean; // Jika true, tombol aksi diberi warna merah tegas (danger/destructive)
  onOpenChange?: (open: boolean) => void;
  onCancel?: () => void;
  onAction?: () => void;
}

const Alert = (props: Props) => {
  const {
    open,
    description,
    onOpenChange,
    onAction,
    onCancel,
    title,
    cancelText = "Batal",
    actionText = "Ya",
    destructive,
  } = props;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-xl font-medium">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Tombol Pembatalan */}
          <AlertDialogCancel data-testid="alert-cancel" onClick={onCancel}>
            {cancelText}
          </AlertDialogCancel>
          {/* Tombol Konfirmasi Aksi */}
          <AlertDialogAction
            data-testid="alert-yes"
            onClick={onAction}
            className={cn(
              destructive &&
                "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            )}
          >
            {actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Alert;
