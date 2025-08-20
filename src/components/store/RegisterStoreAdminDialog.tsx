'use client';

import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useProductStore } from '../../store/productStore';
import { useWarehouseStore } from '@/store/warehouseStore';
import { z } from 'zod';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectValue } from '../ui/select';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { CreateProductDTO } from '@/types/product';
import { useImageStore } from '@/store/imageStore';

const productSchema = z.object({
  email: z.string().min(1, 'email cannot be blank'),
  phoneNumber: z.string().min(1, 'phone number cannot be blank'),
  fullName: z.string().min(1, 'full name cannot be blank'),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function RegisterStoreAdmin() {
  const [open, setOpen] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const { isUploading } = useImageStore();


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      email: '',
      phoneNumber: '',
      fullName: ''
    },
    mode: 'onBlur',
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      setThumbnail(selectedFiles[0]);
      setThumbnailPreview(URL.createObjectURL(selectedFiles[0]));
    }
  }

  const onSubmit = async (data: ProductFormValues) => {
    try {
      reset();
      setOpen(false);

    } catch (error: unknown) {
      let message = 'Failed to create product';
      if (axios.isAxiosError(error)) {
        const axiosErr = error as AxiosError<{ message?: string }>;
        message = axiosErr.response?.data?.message || axiosErr.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          reset();
          setThumbnail(null);
          setThumbnailPreview("");
        }
      }}>
      <DialogTrigger asChild>
        <Button>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Register store admin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register new store admin</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Email */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-2">
              <Label className="block text-sm font-medium text-gray-700">Email</Label>
              <Input type="text" {...register('email')} placeholder='Input your product name' />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          {/* Full name */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-2">
              <Label className="block text-sm font-medium text-gray-700">Full name</Label>
              <Input type="text" {...register('fullName')} placeholder='Input your product name' />
            </div>
            {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
          </div>

          {/* phone number */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-2">
              <Label className="block text-sm font-medium text-gray-700">Phone number</Label>
              <Input type="text" {...register('fullName')} placeholder='Input your product name' />
            </div>
            {errors.phoneNumber && <p className="mt-1 text-xs text-red-600">{errors.phoneNumber.message}</p>}
          </div>

          {/* Upload Image */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-2">
              <Label className="block text-sm font-medium text-gray-700">Profile photo</Label>

              {/* Upload event image */}
              <div className="flex flex-col gap-4 p-6 border border-neutral-300 rounded-xl">
                <div className={cn("relative w-32 aspect-square border-[1px] border-gray-100 rounded-2xl", !thumbnail && "hidden")}>
                  <Image
                    src={thumbnailPreview}
                    fill
                    alt="image of event"
                    className="object-contain"
                  />
                </div>
                <div>
                  <input
                    type="file"
                    name="multipartFiles"
                    accept="image/*"
                    multiple
                    onChange={handleProfileChange}
                    className={cn("p-4 border-neutral-200 border-dashed border-[1px] rounded-md w-full hover:bg-neutral-100", thumbnail && "hidden")}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && isUploading ? "Creating new product..." : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
