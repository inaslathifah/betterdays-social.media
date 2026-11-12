/**
 * Halaman Pendaftaran (Register):
 * Memfasilitasi pendaftaran akun baru di Betterdays.
 * Memvalidasi input (nama, email, password, konfirmasi password) menggunakan Zod schema.
 * Begitu pendaftaran berhasil, token langsung disimpan (auto-login) dan pengguna diarahkan ke Beranda.
 */

import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RegisterType, registerSchema } from "@/utils/apis/auth/type";
import { CustomFormField } from "@/components/custom-formfield";
import { userRegister } from "@/utils/apis/auth/api";
import { useToken } from "@/utils/contexts/token";
import { toast } from "sonner";
import Logo from "@/components/logo";

export default function Register() {
  const navigate = useNavigate();
  const { changeToken } = useToken();
  // State untuk melihat/sembunyikan karakter sandi
  const [showPassword, setShowPassword] = useState(false);

  // Inisialisasi React Hook Form dengan validasi registerSchema (Zod)
  const form = useForm<RegisterType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullname: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  // Handler submit registrasi akun baru
  async function handleRegister(data: RegisterType) {
    try {
      const result = await userRegister(data);
      toast.success(result.message);
      // Auto-login: langsung menyimpan token dan masuk ke Beranda
      changeToken(result.data.token);
      navigate("/", { replace: true });
    } catch (error) {
      const message = (error as Error).message.toString();
      // Tandai pesan error khusus pada field email jika email sudah terpakai
      if (message.toLowerCase().includes("email")) {
        form.setError("email", { message });
      }
      toast.error(message);
    }
  }

  const busy = form.formState.isSubmitting;

  return (
    <Layout navBlue centerX centerY containerTranparant>
      <div className="w-full max-w-md">
        {/* Header Logo dan Judul Halaman */}
        <div className="mb-8 text-center">
          <Logo className="mx-auto mb-4 h-9 w-9" />
          <h2 className="font-serif text-[38px] font-normal leading-tight tracking-tight">
            Buat akun Betterdays
          </h2>
        </div>

        {/* Kartu Form Register */}
        <Card>
          <CardHeader className="pb-2 text-center">
            <CardTitle className="sr-only">Register</CardTitle>
            <CardDescription>
              Sudah punya akun?
              <Link
                to="/login"
                className="font-medium text-brand underline-offset-4 hover:underline"
              >
                {" "}
                Masuk di sini
              </Link>
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRegister)} noValidate>
              <CardContent className="mt-3">
                <div className="grid w-full items-center gap-4">
                  {/* Field Nama Lengkap */}
                  <div className="flex flex-col space-y-2">
                    <CustomFormField
                      control={form.control}
                      name="fullname"
                      label="Nama Lengkap"
                    >
                      {(field) => (
                        <Input
                          {...field}
                          autoComplete="name"
                          placeholder="Nama lengkap"
                          maxLength={100}
                          disabled={busy}
                          aria-disabled={busy}
                          value={field.value as string}
                        />
                      )}
                    </CustomFormField>
                  </div>

                  {/* Field Alamat Email */}
                  <div className="flex flex-col space-y-2">
                    <CustomFormField
                      control={form.control}
                      name="email"
                      label="Email"
                    >
                      {(field) => (
                        <Input
                          {...field}
                          type="email"
                          autoComplete="email"
                          placeholder="nama@email.com"
                          disabled={busy}
                          aria-disabled={busy}
                          value={field.value as string}
                        />
                      )}
                    </CustomFormField>
                  </div>

                  {/* Field Password */}
                  <div className="flex flex-col space-y-2">
                    <CustomFormField
                      control={form.control}
                      name="password"
                      label="Password"
                      description="Minimal 6 karakter."
                    >
                      {(field) => (
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Password"
                          disabled={busy}
                          aria-disabled={busy}
                          value={field.value as string}
                        />
                      )}
                    </CustomFormField>
                  </div>

                  {/* Field Konfirmasi Password */}
                  <div className="flex flex-col space-y-2">
                    <CustomFormField
                      control={form.control}
                      name="confirm_password"
                      label="Konfirmasi Password"
                    >
                      {(field) => (
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Ulangi Password"
                          disabled={busy}
                          aria-disabled={busy}
                          value={field.value as string}
                        />
                      )}
                    </CustomFormField>
                  </div>

                  {/* Checkbox Tampilkan Password */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-password"
                      checked={showPassword}
                      onCheckedChange={(checked: boolean) =>
                        setShowPassword(checked)
                      }
                    />
                    <label
                      htmlFor="show-password"
                      className="text-sm font-medium leading-none"
                    >
                      Tampilkan Password
                    </label>
                  </div>
                </div>
              </CardContent>

              {/* Tombol Submit Pendaftaran */}
              <CardFooter className="flex">
                <Button type="submit" size="lg" className="w-full" disabled={busy}>
                  {busy ? "Memproses…" : "Daftar"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </Layout>
  );
}
