'use client';

import { useEffect, useState } from 'react';
import { useProductStore } from '../../store/productStore';
import { useWarehouseStore } from '@/store/warehouseStore';
import { z } from 'zod';
import { Controller, useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectValue } from '../ui/select';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import { CreateProductDTO } from '@/types/product';
import { useImageStore } from '@/store/imageStore';
import { useDiscountStore } from '@/store/discountStore';
import { useAuthStore } from '@/store/authStore';
import WarehouseStockSelector from './WarehouseStockSelector';
import ProductImageUpload from './ProductImageUpload';
import PromotionSelector from './PromotionSelector';

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
  const { categories, fetchCategories, createProduct, error } = useProductStore();
  const { uniqueWarehouses, fetchUniqueWarehouse } = useWarehouseStore();
  const { discounts, fetchDiscount } = useDiscountStore();
  const [open, setOpen] = useState(false);
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);
  const [files, setFiles] = useState<File[] | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [imageErrors, setImageErrors] = useState<{
    thumbnail?: string;
    media?: string;
  }>({});
  const { uploadMultiImage, uploadSingleImage, isUploading } = useImageStore();
  const [isMounted, setMounted] = useState(false);
  const { user } = useAuthStore();

  const methods = useForm<ProductFormValues>({
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

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = methods;

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return;

    fetchCategories();
    fetchDiscount();
  }, [fetchCategories, fetchDiscount, isMounted]);

  useEffect(() => {
    if (storeID === null) return;
    fetchUniqueWarehouse(storeID)
  }, [fetchUniqueWarehouse, storeID])


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

      // Only proceed with image uploads and dialog closing if product creation was successful
      if (thumbnail) {
        uploadSingleImage(thumbnail, String(productID), true);
      }

      if (files) {
        uploadMultiImage(files, String(productID), false);
      }

      reset();
      setSelectedPromotions([]);
      setThumbnail(null);
      setThumbnailPreview("");
      setFiles(null);
      setMediaPreviews([]);
      setImageErrors({});
      setOpen(false); // Only close if everything succeeded

    } catch (err) {
      // Error is already set in the store, just display it under the name field
      const message = err instanceof Error ? err.message : "Failed to create product";
      setError("name", { message });
      // Dialog stays open so user can see the error and try again
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
        <Button className={cn(user?.role !== 'ADMIN' && "hidden")}>
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

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Name */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-2">
              <Label className="block text-sm font-medium text-gray-700">Name</Label>
              <Input type="text" {...register('name')} placeholder='Input your product name' />
            </div>
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            {!errors.name && error && <p className="mt-1 text-xs text-red-600">{error}</p>}
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
                <Label className="block text-sm font-medium text-gray-700">Weight (gram)</Label>
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
          <WarehouseStockSelector warehouses={uniqueWarehouses} control={control} />

          {/* Upload Image */}
          <ProductImageUpload
            thumbnail={thumbnail}
            setThumbnail={setThumbnail}
            thumbnailPreview={thumbnailPreview}
            setThumbnailPreview={setThumbnailPreview}
            files={files}
            setFiles={setFiles}
            mediaPreviews={mediaPreviews}
            setMediaPreviews={setMediaPreviews}
            imageErrors={imageErrors}
            setImageErrors={setImageErrors}
          />

          {/* Promotions (optional, multi-select) */}
            
          <PromotionSelector
            discounts={discounts}
            selectedPromotions={selectedPromotions}
            setSelectedPromotions={setSelectedPromotions}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !!imageErrors.thumbnail || !!imageErrors.media}>
              {isSubmitting && isUploading ? "Creating new product..." : "Create Product"}
            </Button>
          </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}