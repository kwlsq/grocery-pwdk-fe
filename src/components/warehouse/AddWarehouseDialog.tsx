"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useStoreStore } from "@/store/storeStore";
import { useParams } from "next/navigation";
import { useWarehouseStore } from "@/store/warehouseStore";
import { CreateWarehouseDTO } from "@/types/warehouse";
import { useUsersStore } from "@/store/userStore";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { WarehouseLocationInput } from './WarehouseLocation';

const warehouseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  latitude: z.number(),
  longitude: z.number()
});

type WarehouseFormValues = z.infer<typeof warehouseSchema>;

export default function AddWarehouseDialog() {
  const [open, setOpen] = React.useState(false);
  const params = useParams();
  const storeId = params.id as string;
  const { stores } = useStoreStore();
  const currentStore = stores.find(store => store.id === storeId);
  const { createWarehouse } = useWarehouseStore();
  const { fetchUsers } = useUsersStore();
  const { user } = useAuthStore();


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: "",
      address: "",
      latitude: 0,
      longitude: 0,
    },
    mode: "onBlur"
  });

  React.useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    fetchUsers({ role: "MANAGER" })
  }, [fetchUsers, user]);

  const onSubmit = async (data: WarehouseFormValues) => {
    try {
      const newWarehouse: CreateWarehouseDTO = {
        name: data.name,
        storeID: storeId,
        address: data.address,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        isActive: true
      }

      await createWarehouse(newWarehouse);

      toast.success("Warehouse added successfully!");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error((error as Error).message);
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
        <Button className={cn(user?.role !== 'ADMIN' && "hidden")}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Warehouse
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Warehouse</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Store ID */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="store_id">Store Name</Label>
            <Input id="store_id" placeholder="Enter store ID" value={currentStore?.name} disabled />
          </div>

          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Warehouse name" {...register("name")} />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <WarehouseLocationInput
            onLocationSelect={(address, lat, lng) => {
              setValue('address', address);
              setValue('latitude', lat);
              setValue('longitude', lng);
            }}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Warehouse"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
