/**
 * Komponen Footer:
 * Menampilkan bagian kaki halaman dengan nama aplikasi (Betterdays), tahun hak cipta,
 * dan identitas pembuat/program pelatihan.
 */
export default function Footer() {
  return (
    <footer className="mt-10 w-full">
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground [&>*]:text-xs">
        <p>Betterdays <strong> &copy; <span>2026</span></strong>. All Rights Reserved</p>
        <p>Web Programming | PPKD Jakarta Pusat</p>
      </div>
    </footer>
  );
}
