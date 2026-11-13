/**
 * Halaman Login:
 * Memfasilitasi autentikasi pengguna masuk ke Betterdays menggunakan email dan password.
 * Terintegrasi dengan React Hook Form + validasi Zod schema, context token untuk sesi login,
 * serta tombol praktis pengisian otomatis kredensial akun demo.
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
import { Input } from "@/components/ui/input";

import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoginType, loginSchema } from "@/utils/apis/auth/type";
import { CustomFormField } from "@/components/custom-formfield";
import { userLogin } from "@/utils/apis/auth/api";
import { useToken } from "@/utils/contexts/token";
import { toast } from "sonner";
import Logo from "@/components/logo";
import { USE_DUMMY_API } from "@/utils/apis/axios-with-config";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/utils/mock/db";

export default function Login() {
  // State untuk toggle visibilitas karakter sandi (show/hide password)
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { changeToken } = useToken();

  // Konfigurasi form dengan validasi skema Zod
  const form = useForm<LoginType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handler pengiriman form login ke API
  async function handleLogin(data: LoginType) {
    try {
      const result = await userLogin(data);
      toast.success(result.message);
      // Simpan token ke context & localStorage
      changeToken(result.data.token);
      // Alihkan ke timeline beranda
      navigate("/");
    } catch (error) {
      toast.error((error as Error).message.toString());
    }
  }

  return (
    <Layout navBlue centerX centerY containerTranparant>
      <div className="w-full max-w-md">
        {/* Header Logo dan Nama Aplikasi */}
        <div className="mb-8 text-center">
          <Logo className="mx-auto mb-4 h-9 w-9" />
          <h2 className="font-serif text-[38px] font-normal leading-tight tracking-tight">
            Welcome to Betterdays
          </h2>
        </div>

        {/* Kartu Form Login */}
        <Card>
          <CardHeader className="pb-2 text-center">
            <CardTitle className="sr-only">Login</CardTitle>
            <CardDescription>
              Belum punya akun?
              <Link
                to="/register"
                className="font-medium text-brand underline-offset-4 hover:underline"
              >
                {" "}
                Daftar di sini
              </Link>
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} noValidate>
              <CardContent className="mt-3">
                <div className="grid w-full items-center gap-4">
                  {/* Field Input Email */}
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
                          disabled={form.formState.isSubmitting}
                          aria-disabled={form.formState.isSubmitting}
                          value={field.value as string}
                        />
                      )}
                    </CustomFormField>
                  </div>

                  {/* Field Input Password */}
                  <div className="flex flex-col space-y-2">
                    <CustomFormField
                      control={form.control}
                      name="password"
                      label="Password"
                    >
                      {(field) => (
                        <Input
                          {...field}
                          placeholder="Password (6 karakter)"
                          autoComplete="current-password"
                          type={showPassword ? "text" : "password"}
                          maxLength={6}
                          disabled={form.formState.isSubmitting}
                          aria-disabled={form.formState.isSubmitting}
                          value={field.value as string}
                        />
                      )}
                    </CustomFormField>
                  </div>

                  {/* Checkbox Tampilkan Password */}
                  <div className="flex flex-col space-y-2">
                    <div className="items-top flex space-x-2">
                      <Checkbox
                        id="show-password"
                        checked={showPassword}
                        onCheckedChange={(checked: boolean) =>
                          setShowPassword(checked)
                        }
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="show-password"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Tampilkan Password
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* Tombol Aksi Submit Form & Pengisian Cepat Akun Demo */}
              <CardFooter className="flex-col gap-3">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Memproses…" : "Masuk"}
                </Button>
                {USE_DUMMY_API && (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    onClick={() => {
                      form.setValue("email", DEMO_EMAIL, { shouldValidate: true });
                      form.setValue("password", DEMO_PASSWORD, {
                        shouldValidate: true,
                      });
                    }}
                  >
                    Isi dengan akun demo
                  </button>
                )}
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </Layout>
  );
}
