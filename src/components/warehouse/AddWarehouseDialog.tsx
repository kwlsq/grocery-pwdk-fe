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

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  latitude: z.string().min(1, "Latitude is required"),
  longitude: z.string().min(1, "Longitude is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddWarehouseDialog() {
  const [open, setOpen] = React.useState(false);

  const params = useParams();
  const storeId = params.id as string;

  const {stores} = useStoreStore();
  const currentStore = stores.find(store => store.id === storeId);


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      latitude: "",
      longitude: "",
    },
    mode: "onBlur"
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await fetch("/api/warehouses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add warehouse");
      }

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
      if(!isOpen) {
        reset();
      }
    }}>
      <DialogTrigger asChild>
        <Button>Add Warehouse</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Warehouse</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Store ID */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="store_id">Store Name</Label>
            <Input id="store_id" placeholder="Enter store ID" value={currentStore?.name} disabled/>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Warehouse name" {...register("name")} />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          {/* Address */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" placeholder="Warehouse address" {...register("address")} />
            {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
          </div>

          {/* Latitude */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input id="latitude" type="number" step="any" placeholder="e.g. -6.200000" {...register("latitude")} />
            {errors.latitude && <p className="text-red-500 text-sm">{errors.latitude.message}</p>}
          </div>

          {/* Longitude */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input id="longitude" type="number" step="any" placeholder="e.g. 106.816666" {...register("longitude")} />
            {errors.longitude && <p className="text-red-500 text-sm">{errors.longitude.message}</p>}
          </div>

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
