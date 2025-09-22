'use client';

import { FC, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User } from '@/types/user';
import { useUsersStore } from '@/store/userStore';

const schema = z.object({
  name: z.string().min(1, 'Name cannot be blank'),
});

type FormValues = z.infer<typeof schema>;

interface UserProps {
  user: User;
}

const EditUserDialog: FC<UserProps> = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { updateStoreAdmin, deleteUser, loading } = useUsersStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: user.fullName },
    mode: 'onBlur',
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await updateStoreAdmin(user.id, { name: data.name });
      setOpen(false);
      reset({ name: data.name });
    } catch (error: unknown) {
      let message = 'Failed to update user';
      if (axios.isAxiosError(error)) {
        const axiosErr = error as AxiosError<{ message?: string }>;
        message = axiosErr.response?.data?.message || axiosErr.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      console.error(message);
    }
  };

  const handleDelete = async (userID: string) => {
    try {
      await deleteUser(userID);
      setConfirmOpen(false);
      setOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) reset({ name: user.fullName });
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit store admin</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Email (read-only) */}
          <div className="flex flex-col gap-2">
            <Label>Email</Label>
            <Input value={user.email} disabled />
          </div>

          {/* Name (editable) */}
          <div className="flex flex-col gap-2">
            <Label>Name</Label>
            <Input type="text" {...register('name')} />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="flex justify-between">
            {/* Delete */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="link" className="text-red-500">
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Are you sure you want to delete{" "}
                    <span className="font-bold">{user.fullName}</span>?
                  </DialogTitle>
                </DialogHeader>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setConfirmOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete User
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Save / Cancel */}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || loading}>
                {isSubmitting || loading ? "Updating..." : "Update User"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
