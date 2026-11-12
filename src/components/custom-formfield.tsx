/**
 * Komponen Pembungkus Form Field (CustomFormField):
 * Mempermudah integrasi antara React Hook Form dan komponen UI shadcn:
 * - Menangani otomatis render label (<FormLabel>)
 * - Input kontrol fleksibel melalui render-props `children(field)`
 * - Menampilkan deskripsi bantuan (<FormDescription>) jika ada
 * - Menampilkan pesan error validasi (<FormMessage>) secara otomatis dari schema Zod
 */

import {
  Control,
  ControllerRenderProps,
  FieldValues,
  FieldPath,
  Path,
} from "react-hook-form";
import { ReactNode } from "react";

import {
  FormField,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface Props<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  options?: {
    label: string;
    value: string | number;
  }[];
  description?: string;
  control: Control<T>;
  "data-testid"?: string;
  disabled?: boolean;
}

interface ChildrenProps<T extends FieldValues> extends Props<T> {
  // Render-prop pattern yang memberikan prop kontrol ke input asli
  children: (field: ControllerRenderProps<T, Path<T>>) => ReactNode;
}

export function CustomFormField<T extends FieldValues>(
  props: Readonly<ChildrenProps<T>>
) {
  const { name, label, description, control, children } = props;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>{children(field)}</FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
