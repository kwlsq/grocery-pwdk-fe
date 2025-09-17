'use client';

import { useEffect, useState } from 'react';
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
import { useDiscountStore } from '@/store/discountStore';

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

// File validation function
const validateImageFile = (file: File): string | null => {
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
  const maxSizeInBytes = 1 * 1024 * 1024; // 1MB in bytes

  // Get file extension
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  // Check if extension is allowed
  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    return `File format not supported. Only .jpg, .jpeg, .png, and .gif files are allowed.`;
  }

  // Check file size
  if (file.size > maxSizeInBytes) {
    return `File size too large. Maximum file size is 1MB.`;
  }

  return null; // No error
};

export default function CreateProduct({ storeID }: { storeID: string }) {
  const { categories, fetchCategories, createProduct, error } = useProductStore();
  const { uniqueWarehouses, fetchUniqueWarehouse } = useWarehouseStore();
  const { discounts, fetchDiscount } = useDiscountStore();
  const [open, setOpen] = useState(false);
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);
  const [files, setFiles] = useState<File[] | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [mediaPreviews, setMediaPreviews] = useState<string[]>();
  const [imageErrors, setImageErrors] = useState<{
    thumbnail?: string;
    media?: string;
  }>({});
  const { uploadMultiImage, uploadSingleImage, isUploading } = useImageStore();
  const [isMounted, setMounted] = useState(false);

  const now = new Date();

  const filteredDiscount = discounts.filter((discount) => {
    const end = new Date(discount.endAt);
    return end >= now;
  });

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
      stocks: [],
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return;

    fetchCategories();
    fetchDiscount();
    fetchUniqueWarehouse(storeID)
  }, [fetchCategories, fetchUniqueWarehouse, fetchDiscount, storeID]);


  // Update stocks when warehouses are loaded
  useEffect(() => {
    if (uniqueWarehouses.length > 0) {
      const stocksData = uniqueWarehouses.map((w) => ({
        warehouseId: w.id,
        selected: false,
        quantity: '',
      }));
      setValue('stocks', stocksData);
    }
  }, [uniqueWarehouses, setValue]);

  const { fields } = useFieldArray({
    control,
    name: 'stocks',
  });

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles);

      // Clear previous media error
      setImageErrors(prev => ({ ...prev, media: undefined }));

      // Validate each file
      const validFiles: File[] = [];
      let hasError = false;

      for (const file of fileArray) {
        const validationError = validateImageFile(file);
        if (validationError) {
          setImageErrors(prev => ({
            ...prev,
            media: validationError
          }));
          hasError = true;
          break;
        }
        validFiles.push(file);
      }

      if (!hasError) {
        setFiles(validFiles);
        const mediaUrls = validFiles.map((file) => URL.createObjectURL(file));
        setMediaPreviews(mediaUrls);
      }
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const file = selectedFiles[0];

      // Clear previous thumbnail error
      setImageErrors(prev => ({ ...prev, thumbnail: undefined }));

      // Validate thumbnail file
      const validationError = validateImageFile(file);
      if (validationError) {
        setImageErrors(prev => ({
          ...prev,
          thumbnail: validationError
        }));
        return;
      }

      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  }

  const onSubmit = async (data: ProductFormValues) => {
    try {
      // Check for image validation errors before submitting
      if (imageErrors.thumbnail || imageErrors.media) {
        return;
      }

      const inventories = data.stocks
        .filter((stock) => stock.quantity !== undefined && stock.quantity !== "")
        .map((stock) => ({
          warehouseID: stock.warehouseId,
          stock: stock.selected ? Number(stock.quantity) : 0,
        }));

      const selectedPromotionIds = selectedPromotions.map((id) => ({ promotionID: id }));

      const newProduct: CreateProductDTO = {
        name: data.name.trim(),
        description: data.description.trim(),
        price: Number(data.price),
        weight: Number(data.weight),
        categoryID: data.categoryID,
        storeID: storeID,
        inventories: inventories,
        ...(selectedPromotionIds.length > 0 ? { promotions: selectedPromotionIds } : {})
      };

      const productID = await createProduct(newProduct);

      if (thumbnail) {
        uploadSingleImage(thumbnail, String(productID), true);
      }

      if (files) {
        uploadMultiImage(files, String(productID), false);
      }

      reset();
      setOpen(false); // only close if no error thrown

    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create product";
      setError("name", { message }); // show under the Name field
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
          setImageErrors({});
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
            {error !== null && <p className="mt-1 text-xs text-red-600">{error}</p>}
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
                    <p className="w-full">{uniqueWarehouses[index].name}</p>
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
              <p className="text-xs text-gray-500">Allowed formats: .jpg, .jpeg, .png, .gif | Max size: 1MB per file</p>

              {/* Upload event image */}
              <div className="flex flex-col gap-4 p-6 border border-neutral-300 rounded-xl">
                <div className="flex flex-col gap-2">
                  <Label>Thumbnail</Label>
                  {thumbnail && thumbnailPreview && (
                    <div className={cn("relative w-32 aspect-square border-[1px] border-gray-100 rounded-2xl", !thumbnail && "hidden")}>
                      <Image
                        src={thumbnailPreview}
                        fill
                        alt="image of event"
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      name="thumbnailFile"
                      accept=".jpg,.jpeg,.png,.gif"
                      onChange={handleThumbnailChange}
                      className={cn("p-4 border-neutral-200 border-dashed border-[1px] rounded-md w-full hover:bg-neutral-100", thumbnail && "hidden")}
                    />
                  </div>
                  {imageErrors.thumbnail && (
                    <p className="text-xs text-red-600">{imageErrors.thumbnail}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Product carousel</Label>
                  {mediaPreviews && mediaPreviews.length > 0 && (
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
                  )}
                  <div>
                    <input
                      type="file"
                      name="multipartFiles"
                      accept=".jpg,.jpeg,.png,.gif"
                      multiple
                      onChange={handleMediaChange}
                      className={cn("p-4 border-neutral-200 border-dashed border-[1px] rounded-md w-full hover:bg-neutral-100", files?.length === 5 && "hidden")}
                    />
                  </div>
                  {imageErrors.media && (
                    <p className="text-xs text-red-600">{imageErrors.media}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Promotions (optional, multi-select) */}
          <div className={cn("flex flex-col gap-2", filteredDiscount.length <= 0 && "hidden")}>
            <Label className="block text-sm font-medium text-gray-700">Promotions</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredDiscount.map((discount) => {
                const isSelected = selectedPromotions.includes(discount.id);
                return (
                  <button
                    type="button"
                    key={discount.id}
                    onClick={() => {
                      setSelectedPromotions((prev) =>
                        prev.includes(discount.id)
                          ? prev.filter((id) => id !== discount.id)
                          : [...prev, discount.id]
                      );
                    }}
                    className={cn(
                      "text-left p-4 border rounded-xl transition-colors",
                      isSelected ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{discount.name}</span>
                      <span className="text-xs text-gray-500">min Rp {discount.minPurchase.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{discount.description}</p>
                    <span className="text-sm font-semibold text-green-700">
                      {discount.unit === 'percentage'
                        ? `${discount.value}%`
                        : (discount.unit === 'currency' ? `Rp ${discount.value.toLocaleString()}` : `B1G1`)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !!imageErrors.thumbnail || !!imageErrors.media}>
              {isSubmitting && isUploading ? "Creating new product..." : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}