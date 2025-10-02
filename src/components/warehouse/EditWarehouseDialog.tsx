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
import { CreateWarehouseDTO, Warehouse } from "@/types/warehouse";
import { useUsersStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";

const warehouseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  latitude: z.number(),
  longitude: z.number()
});

type WarehouseFormValues = z.infer<typeof warehouseSchema>;

export default function EditWarehouseDialog({ warehouse }: { id: string; warehouse: Warehouse }) {
  const [open, setOpen] = React.useState(false);
  const [selectedAdmin, setSelectedAdmin] = React.useState<string | null>(null);
  const params = useParams();
  const storeId = params.id as string;
  const { stores } = useStoreStore();
  const currentStore = stores.find((store) => store.id === storeId);
  const { createWarehouse } = useWarehouseStore();
  const { users, fetchUsers } = useUsersStore();
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: warehouse.name,
      address: warehouse.address,
      latitude: warehouse.latitude,
      longitude: warehouse.longitude,
    },
    mode: "onBlur",
  });

  // Set default admin
  React.useEffect(() => {

    if (user?.role !== 'ADMIN') return;

    if (warehouse?.warehouseAdmin?.userID) {
      setSelectedAdmin(warehouse.warehouseAdmin.userID);
    } else {
      setSelectedAdmin(null);
    }


    fetchUsers({role: "MANAGER"})

  }, [warehouse, user, fetchUsers]);

  const onSubmit = async (data: WarehouseFormValues) => {
    try {
      const updatedWarehouse: CreateWarehouseDTO = {
        name: data.name,
        storeID: storeId,
        address: data.address,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        isActive: true,
        storeAdminID: selectedAdmin ?? null,
      };

      await createWarehouse(updatedWarehouse);

      toast.success("Warehouse updated successfully!");
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
      }}
    >
      <DialogTrigger asChild className="w-full">
        <Button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="icon icon-tabler icons-tabler-outline icon-tabler-edit"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
            <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
            <path d="M16 5l3 3" />
          </svg>
          Edit Warehouse
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Warehouse</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Store ID */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="store_id">Store Name</Label>
            <Input id="store_id" value={currentStore?.name} disabled />
          </div>

          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          {/* Address */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} />
            {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
          </div>

          {/* Latitude */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input type="number" step="any" {...register("latitude", { valueAsNumber: true })} />
            {errors.latitude && <p className="text-red-500 text-sm">{errors.latitude.message}</p>}
          </div>

          {/* Longitude */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input type="number" step="any" {...register("longitude", { valueAsNumber: true })} />
            {errors.longitude && <p className="text-red-500 text-sm">{errors.longitude.message}</p>}
          </div>

          {/* Store Admins */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {users.map((user) => {
              const isCurrentAdmin = warehouse?.warehouseAdmin?.userID === user.id;
              const isSelected = selectedAdmin === user.id;

              return (
                <button
                  type="button"
                  key={user.id}
                  onClick={() => setSelectedAdmin(user.id)}
                  className={`rounded-lg shadow-sm border p-4 flex items-center gap-4 w-full text-left transition
                    ${isSelected
                      ? "border-green-600"
                      : isCurrentAdmin
                        ? "border-green-600"
                        : "border-gray-200"
                    }`}
                >
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-gray-500">
                    {user.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.photoUrl} alt={user.fullName ?? user.email} className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-semibold">{(user.fullName || user.email).charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <p className="text-sm text-gray-600 truncate">{user.fullName || user.email}</p>
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded bg-gray-100">{user.role}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Warehouse"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

