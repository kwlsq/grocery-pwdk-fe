'use client';

import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useProductStore } from '../../store/productStore';
import { useWarehouseStore } from '@/store/warehouseStore';
import { file, z } from 'zod';
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
import { Toaster, ToastT, toast } from 'sonner';

const productSchema = z.object({
  name: z.string().min(1, 'Name cannot be blank'),
  description: z.string().min(1, 'Description cannot be blank'),
  price: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Price must be a positive number'),
  weight: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Weight must be a positive number'),
  categoryID: z.string().min(1, 'Category is required'),
  stocks: z.array(
    z.object({
      warehouseId: z.string(),
      selected: z.boolean(),
      quantity: z
        .string()
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, 'Quantity must be a positive number')
        .optional(),
    })
  ),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function CreateProduct({ storeID }: { storeID: string }) {
  const { categories, fetchCategories, createProduct } = useProductStore();
  const { warehouses } = useWarehouseStore();
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[] | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [mediaPreviews, setMediaPreviews] = useState<string[]>();
  const { uploadMultiImage, uploadSingleImage, isUploading } = useImageStore();


  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      weight: '',
      categoryID: '',
      stocks: warehouses.map((w) => ({
        warehouseId: w.id,
        selected: false,
        quantity: '',
      })),
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const { fields } = useFieldArray({
    control,
    name: 'stocks',
  });

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles);
      setFiles(fileArray);

      const mediaUrls = fileArray.map((file) => URL.createObjectURL(file));
      setMediaPreviews(mediaUrls);
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      setThumbnail(selectedFiles[0]);
      setThumbnailPreview(URL.createObjectURL(selectedFiles[0]));
    }
  }

  const onSubmit = async (data: ProductFormValues) => {
    try {

      const inventories = data.stocks
        .filter((stock) => stock.quantity !== undefined && stock.quantity !== "")
        .map((stock) => ({
          warehouseID: stock.warehouseId,
          stock: stock.selected ? Number(stock.quantity) : 0,
        }));

      const newProduct: CreateProductDTO = {
        name: data.name.trim(),
        description: data.description.trim(),
        price: Number(data.price),
        weight: Number(data.weight),
        categoryID: data.categoryID,
        storeID: storeID,
        inventories: inventories
      };

      const productID = await createProduct(newProduct);


      if (thumbnail) {
        uploadSingleImage(thumbnail, String(productID), true);
      }

      if (files) {
        uploadMultiImage(files, String(productID), false);
      }

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
      setError('name', { message });
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
          setFiles([]);
          setMediaPreviews([]);
        }
      }}>
      <DialogTrigger asChild>
        <Button>Create Product</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Name */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-2">
              <Label className="block text-sm font-medium text-gray-700">Name</Label>
              <Input type="text" {...register('name')} placeholder='Input your product name' />
            </div>
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-2">
              <Label className="block text-sm font-medium text-gray-700">Description</Label>
              <Textarea
                {...register('description')}
                placeholder="Your product's description"
              />
            </div>
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          </div>

          {/* Price & Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <div className='flex flex-col gap-2'>
                <Label className="block text-sm font-medium text-gray-700">Price</Label>
                <Input type="number" step="0.01" {...register('price')} placeholder="Product prices" />
              </div>
              {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
            </div>

            <div className="flex flex-col">
              <div className='flex flex-col gap-2'>
                <Label className="block text-sm font-medium text-gray-700">Weight</Label>
                <Input type="number" step="0.01" {...register('weight')} />
              </div>
              {errors.weight && <p className="mt-1 text-xs text-red-600">{errors.weight.message}</p>}
            </div>
          </div>

          <div className="flex flex-col">
            <div className='flex flex-col gap-2'>
              <Label>Category</Label>
              <Controller
                name="categoryID"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Category</SelectLabel>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {errors.categoryID && <p className="mt-1 text-xs text-red-600">{errors.categoryID.message}</p>}
          </div>

          {/* Stock per warehouse */}
          <div className="flex flex-col gap-2">
            <Label className="block text-sm font-medium text-gray-700">Stock in warehouse</Label>
            {fields.map((field, index) => {
              const isChecked = watch(`stocks.${index}.selected`);

              return (
                <div key={field.id} className="flex items-center">
                  <div className='w-2/3 flex items-center gap-2'>
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        setValue(`stocks.${index}.selected`, !!checked, {
                          shouldValidate: true,
                        })
                      }
                    />

                    {/* Warehouse name */}
                    <p className="w-full">{warehouses[index].name}</p>
                  </div>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`stocks.${index}.quantity` as const)}
                    disabled={!isChecked}
                    className='w-1/3'
                  />

                  {/* Error message */}
                  {errors.stocks?.[index]?.quantity && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.stocks[index]?.quantity?.message}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Upload Image */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-2">
              <Label className="block text-sm font-medium text-gray-700">Product Image</Label>

              {/* Upload event image */}
              <div className="flex flex-col gap-4 p-6 border border-neutral-300 rounded-xl">
                <div className="flex flex-col gap-2">
                  <Label>Thumbnail</Label>
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
                      onChange={handleThumbnailChange}
                      className={cn("p-4 border-neutral-200 border-dashed border-[1px] rounded-md w-full hover:bg-neutral-100", thumbnail && "hidden")}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Product carousel</Label>
                  <div className="flex gap-2 w-full flex-wrap">
                    {mediaPreviews?.map((media, index) => (
                      <div key={index} className="relative w-32 aspect-square border-[1px] border-gray-100 rounded-2xl">
                        <Image
                          src={media}
                          fill
                          alt="image of event"
                          className="object-contain"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <input
                      type="file"
                      name="multipartFiles"
                      accept="image/*"
                      multiple
                      onChange={handleMediaChange}
                      className={cn("p-4 border-neutral-200 border-dashed border-[1px] rounded-md w-full hover:bg-neutral-100", files?.length === 5 && "hidden")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating new product..." : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
