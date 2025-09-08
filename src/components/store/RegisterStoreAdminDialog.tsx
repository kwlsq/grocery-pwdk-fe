'use client';

import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useImageStore } from '@/store/imageStore';
import { useUsersStore } from '@/store/userStore';
import { RegisterUserDTO } from '@/types/user';

const storeAdmin = z.object({
  email: z.string().min(1, 'email cannot be blank'),
  fullName: z.string().min(1, 'full name cannot be blank'),
});

type StoreAdminValues = z.infer<typeof storeAdmin>;

export default function RegisterStoreAdmin() {
  const [open, setOpen] = useState(false);
  const { isUploading } = useImageStore();
  const { registerStoreAdmin } = useUsersStore();


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StoreAdminValues>({
    resolver: zodResolver(storeAdmin),
    defaultValues: {
      email: '',
      fullName: ''
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: StoreAdminValues) => {
    try {

      const newStoreAdmin: RegisterUserDTO = {
        email: data.email,
        fullName: data.fullName
      }

      console.log(newStoreAdmin);
      

      await registerStoreAdmin(newStoreAdmin)
      reset();
      setOpen(false);

    } catch (error: unknown) {

      let message = 'Failed to register new store admin';
      
      if (axios.isAxiosError(error)) {
        const axiosErr = error as AxiosError<{ message?: string }>;
        message = axiosErr.response?.data?.message || axiosErr.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      
      console.error(message);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          reset();
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
              <Input type="text" {...register('email')} placeholder='Email to receive account info' />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          {/* Full name */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-2">
              <Label className="block text-sm font-medium text-gray-700">Full name</Label>
              <Input type="text" {...register('fullName')} placeholder="Input user's full name" />
            </div>
            {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && isUploading ? "Registering new user..." : "Register"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
