'use client';

import { FC, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useImageStore } from '@/store/imageStore';
import { User } from '@/types/user';
import { useUsersStore } from '@/store/userStore';

const productSchema = z.object({
  email: z.string().min(1, 'email cannot be blank'),
  fullName: z.string().min(1, 'full name cannot be blank'),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface UserProps {
  user: User
}

const EditUserDialog: FC<UserProps> = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const { isUploading } = useImageStore();
  const { deleteUser } = useUsersStore();
  const [confirmOpen, setConfirmOpen] = useState(false);


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      email: user.email,
      fullName: user.fullName
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


  const handleDeleteStoreAdmin = async (userID: string) => {
    try {
      await deleteUser(userID );
    } catch (e) {
      console.error(e);
    }
  }

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
        <div className='text-gray-300 cursor-pointer hover:text-gray-400'>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-edit">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" /><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" /><path d="M16 5l3 3" />
          </svg>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit store admin</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Email */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-2">
              <Label className="block text-sm font-medium text-gray-700">Email</Label>
              <Input type="text" {...register('email')} placeholder='Input your product name' disabled />
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

          <div className='flex justify-between'>
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant={"link"}
                  className='text-red-500 h-full'
                >Delete</Button>
              </DialogTrigger>
              <DialogContent>
                <div className='space-y-4'>
                  <div>Are you sure you want to delete product <span className='font-bold'>{user.fullName}</span>?</div>
                  <div className='flex justify-end gap-2'>
                    <Button type='button' variant={"secondary"} onClick={() => setConfirmOpen(false)}>
                      Cancel
                    </Button>
                    <Button type='button' variant={"destructive"} onClick={() => handleDeleteStoreAdmin(user.id)}>
                      Delete Product
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && isUploading ? "Creating new product..." : "Create Product"}
              </Button>
            </div>
          </div>


        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditUserDialog;