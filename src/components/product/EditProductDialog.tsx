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
import { CreateProductDTO, Product, UpdateProductDTO } from '@/types/product';
import { useImageStore } from '@/store/imageStore';

const productSchema = z.object({
  name: z.string().min(1, 'Name cannot be blank'),
  description: z.string().min(1, 'Description cannot be blank'),
  price: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Price must be a positive number'),
  weight: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Weight must be a positive number'),
  categoryID: z.string().min(1, 'Category is required')
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function EditProduct({ id, product }: { id: string, product: Product }) {
  const { categories, fetchCategories, updateProduct } = useProductStore();
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
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      description: product.description,
      price: String(product.productVersionResponse.price),
      weight: String(product.productVersionResponse.weight),
      categoryID: ''
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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

      const product: UpdateProductDTO = {
        name: data.name.trim(),
        description: data.description.trim(),
        price: Number(data.price),
        weight: Number(data.weight),
        categoryID: data.categoryID,
        changeReason: ""
      };

      await updateProduct(id, product);

      reset();
      setOpen(false);

    } catch (error: unknown) {
      let message = 'Failed to update product';
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
        <Button>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Product</DialogTitle>
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
              {isSubmitting && isUploading ? "Creating new product..." : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
