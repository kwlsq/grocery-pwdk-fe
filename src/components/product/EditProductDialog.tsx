'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import axios, { AxiosError } from 'axios';
import { useProductStore } from '../../store/productStore';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectValue } from '../ui/select';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Product, UpdateProductDTO, ProductImage } from '@/types/product';
import { useImageStore } from '@/store/imageStore';
import { useDiscountStore } from '@/store/discountStore';

const productSchema = z.object({
  name: z.string().min(1, 'Name cannot be blank').max(255, 'Name is too long'),
  description: z.string().min(1, 'Description cannot be blank').max(2000, 'Description is too long'),
  price: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Price must be a positive number')
    .refine((val) => Number(val) <= 999999999, 'Price is too high'),
  weight: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Weight must be a positive number')
    .refine((val) => Number(val) <= 999999, 'Weight is too high'),
  categoryID: z.string().min(1, 'Category is required')
});

type ProductFormValues = z.infer<typeof productSchema>;

interface MediaState {
  files: File[];
  thumbnail: File | null;
  thumbnailPreview: string;
  mediaPreviews: string[];
  deletedThumbnail: boolean;
  deletedMedia: string[];
}

const initialMediaState: MediaState = {
  files: [],
  thumbnail: null,
  thumbnailPreview: "",
  mediaPreviews: [],
  deletedThumbnail: false,
  deletedMedia: []
};

const MAX_MEDIA_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function EditProduct({ id, product }: { id: string, product: Product }) {
  const { categories, fetchCategories, updateProduct, deleteProduct } = useProductStore();
  const { isUploading, uploadMultiImage, uploadSingleImage, deleteImage } = useImageStore();
  const { discounts, fetchDiscount } = useDiscountStore();

  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [mediaState, setMediaState] = useState<MediaState>(initialMediaState);
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);
  const [updateError, setUpdateError] = useState<string>('');

  // Memoized current thumbnail
  const currentThumbnail = useMemo(() =>
    product.productImages?.find(img => img.primary),
    [product.productImages]
  );

  // Memoized current media (non-thumbnail images)
  const currentMedia = useMemo(() =>
    product.productImages?.filter((img: ProductImage) =>
      !img.primary && !mediaState.deletedMedia.includes(img.id)
    ) || [],
    [product.productImages, mediaState.deletedMedia]
  );

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
      categoryID: product.categoryID || ''
    },
    mode: 'onBlur',
  });

  // Initialize promotions on mount
  useEffect(() => {
    setSelectedPromotions((product.promotions || []).map(p => p.id));
  }, [product.promotions]);

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchDiscount();
    }
  }, [open, fetchCategories, fetchDiscount]);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File ${file.name} is too large. Maximum size is 10MB.`;
    }
    if (!file.type.startsWith('image/')) {
      return `File ${file.name} is not a valid image.`;
    }
    return null;
  };

  const handleMediaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);

    // Validate files
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        setUpdateError(error);
        return;
      }
    }

    // Check total media count
    const totalMedia = currentMedia.length + mediaState.mediaPreviews.length + fileArray.length;
    if (totalMedia > MAX_MEDIA_FILES) {
      setUpdateError(`Maximum ${MAX_MEDIA_FILES} media files allowed`);
      return;
    }

    setUpdateError('');
    const mediaUrls = fileArray.map((file) => URL.createObjectURL(file));

    setMediaState(prev => ({
      ...prev,
      files: [...prev.files, ...fileArray],
      mediaPreviews: [...prev.mediaPreviews, ...mediaUrls]
    }));
  }, [currentMedia.length, mediaState.mediaPreviews.length]);

  const handleThumbnailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const file = selectedFiles[0];
    const error = validateFile(file);
    if (error) {
      setUpdateError(error);
      return;
    }

    setUpdateError('');
    setMediaState(prev => ({
      ...prev,
      thumbnail: file,
      thumbnailPreview: URL.createObjectURL(file),
      // Preserve deletedThumbnail flag so we still delete existing primary before uploading new
      deletedThumbnail: prev.deletedThumbnail
    }));
  }, []);

  const handleDeleteThumbnail = useCallback(() => {
    setMediaState(prev => ({
      ...prev,
      thumbnail: null,
      thumbnailPreview: "",
      deletedThumbnail: true
    }));
  }, []);

  const handleDeleteMedia = useCallback((index: number) => {
    setMediaState(prev => {
      const newMediaPreviews = prev.mediaPreviews.filter((_, i) => i !== index);
      const newFiles = prev.files.filter((_, i) => i !== index);

      // Clean up URL
      if (prev.mediaPreviews[index]) {
        URL.revokeObjectURL(prev.mediaPreviews[index]);
      }

      return {
        ...prev,
        mediaPreviews: newMediaPreviews,
        files: newFiles
      };
    });
  }, []);

  const handleDeleteCurrentMedia = useCallback((mediaId: string) => {
    setMediaState(prev => ({
      ...prev,
      deletedMedia: [...prev.deletedMedia, mediaId]
    }));
  }, []);

  const resetForm = useCallback(() => {
    reset();
    setMediaState(initialMediaState);
    setSelectedPromotions((product.promotions || []).map(p => p.id));
    setUpdateError('');

    // Clean up object URLs
    mediaState.mediaPreviews.forEach(url => URL.revokeObjectURL(url));
    if (mediaState.thumbnailPreview) {
      URL.revokeObjectURL(mediaState.thumbnailPreview);
    }
  }, [reset, product.promotions, mediaState]);

  const handleImageOperations = async () => {
    // Ensure thumbnail deletion happens before uploading a new primary
    if (mediaState.deletedThumbnail && currentThumbnail) {
      await deleteImage(currentThumbnail.id);
    }

    // Delete marked gallery media before uploads
    if (mediaState.deletedMedia.length > 0) {
      for (const mediaId of mediaState.deletedMedia) {
        await deleteImage(mediaId);
      }
    }

    // Upload new thumbnail as primary
    if (mediaState.thumbnail) {
      await uploadSingleImage(mediaState.thumbnail, id, true);
    }

    // Upload new gallery images
    if (mediaState.files.length > 0) {
      await uploadMultiImage(mediaState.files, id, false);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setUpdateError('');

      // Build minimal payload: include only fields that changed
      const payload: UpdateProductDTO = {};

      const trimmedName = data.name.trim();
      if (trimmedName !== product.name) payload.name = trimmedName;

      const trimmedDescription = data.description.trim();
      if (trimmedDescription !== product.description) payload.description = trimmedDescription;

      const newPrice = Number(data.price);
      if (!Number.isNaN(newPrice) && newPrice !== product.productVersionResponse.price) {
        payload.price = newPrice;
      }

      const newWeight = Number(data.weight);
      if (!Number.isNaN(newWeight) && newWeight !== product.productVersionResponse.weight) {
        payload.weight = newWeight;
      }

      if (data.categoryID !== product.categoryID) payload.categoryID = data.categoryID;

      const originalPromotionIds = (product.promotions || []).map(p => p.id).sort();
      const newPromotionIds = [...selectedPromotions].sort();
      const promotionsChanged = originalPromotionIds.length !== newPromotionIds.length ||
        originalPromotionIds.some((id, i) => id !== newPromotionIds[i]);
      if (promotionsChanged) {
        payload.promotions = selectedPromotions.map((id) => ({ promotionID: id }));
      }

      // Optional change reason if anything changed
      const changedKeys: string[] = Object.keys(payload);
      if (changedKeys.length > 0) {
        payload.changeReason = `Updated: ${changedKeys.join(', ')}`;
      }

      // Update product data only if there are changes
      if (changedKeys.length > 0) {
        await updateProduct(id, payload);
      }

      // Handle image operations
      await handleImageOperations();

      resetForm();
      setOpen(false);

    } catch (error: unknown) {
      let message = 'Failed to update product';
      if (axios.isAxiosError(error)) {
        const axiosErr = error as AxiosError<{ message?: string }>;
        message = axiosErr.response?.data?.message || axiosErr.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setUpdateError(message);
      setError('name', { message });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteProduct(id);
      setConfirmOpen(false);
      setOpen(false);
    } catch {
      // Optionally surface error
      setUpdateError('Failed to delete product');
    }
  };

  const handlePromotionToggle = useCallback((promotionId: string) => {
    setSelectedPromotions((prev) =>
      prev.includes(promotionId)
        ? prev.filter((id) => id !== promotionId)
        : [...prev, promotionId]
    );
  }, []);

  const shouldShowThumbnailUpload = !mediaState.thumbnailPreview &&
    (!currentThumbnail || mediaState.deletedThumbnail);

  const canAddMoreMedia = (currentMedia.length + mediaState.mediaPreviews.length) < MAX_MEDIA_FILES;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          resetForm();
        }
      }}>
      <DialogTrigger asChild className='w-full'>
        <Button>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-edit">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
            <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
            <path d="M16 5l3 3" />
          </svg>
          Edit Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        {updateError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {updateError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Name */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-2">
              <Label className="block text-sm font-medium text-gray-700">Name</Label>
              <Input
                type="text"
                {...register('name')}
                placeholder='Input your product name'
                className={errors.name ? 'border-red-300' : ''}
              />
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
                className={errors.description ? 'border-red-300' : ''}
              />
            </div>
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          </div>

          {/* Price & Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <div className='flex flex-col gap-2'>
                <Label className="block text-sm font-medium text-gray-700">Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('price')}
                  placeholder="Product prices"
                  className={errors.price ? 'border-red-300' : ''}
                />
              </div>
              {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
            </div>

            <div className="flex flex-col">
              <div className='flex flex-col gap-2'>
                <Label className="block text-sm font-medium text-gray-700">Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('weight')}
                  className={errors.weight ? 'border-red-300' : ''}
                />
              </div>
              {errors.weight && <p className="mt-1 text-xs text-red-600">{errors.weight.message}</p>}
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col">
            <div className='flex flex-col gap-2'>
              <Label>Category</Label>
              <Controller
                name="categoryID"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={`w-full ${errors.categoryID ? 'border-red-300' : ''}`}>
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

          {/* Images */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-2">
              <Label className="block text-sm font-medium text-gray-700">Product Images</Label>

              <div className="flex flex-col gap-4 p-6 border border-neutral-300 rounded-xl">
                {/* Thumbnail Section */}
                <div className="flex flex-col gap-2">
                  <Label>Thumbnail</Label>

                  {/* Current thumbnail */}
                  {currentThumbnail && !mediaState.deletedThumbnail && !mediaState.thumbnailPreview && (
                    <div className="relative w-32 aspect-square border border-gray-200 rounded-2xl group">
                      <Image
                        src={currentThumbnail.url}
                        fill
                        alt="current thumbnail"
                        className="object-cover rounded-2xl"
                      />
                      <button
                        type="button"
                        onClick={handleDeleteThumbnail}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Delete thumbnail"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* New thumbnail preview */}
                  {mediaState.thumbnailPreview && (
                    <div className="relative w-32 aspect-square border border-gray-200 rounded-2xl group">
                      <Image
                        src={mediaState.thumbnailPreview}
                        fill
                        alt="new thumbnail preview"
                        className="object-cover rounded-2xl"
                      />
                      <button
                        type="button"
                        onClick={handleDeleteThumbnail}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Delete thumbnail"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* Thumbnail upload */}
                  {shouldShowThumbnailUpload && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="p-4 border-neutral-200 border-dashed border rounded-md w-full hover:bg-neutral-100"
                    />
                  )}
                </div>

                {/* Media Carousel Section */}
                <div className="flex flex-col gap-2">
                  <Label>Product Gallery ({currentMedia.length + mediaState.mediaPreviews.length}/{MAX_MEDIA_FILES})</Label>

                  <div className="flex gap-2 w-full flex-wrap">
                    {/* Current media */}
                    {currentMedia.map((media: ProductImage) => (
                      <div key={media.id} className="relative w-32 aspect-square border border-gray-200 rounded-2xl group">
                        <Image
                          src={media.url}
                          fill
                          alt="product image"
                          className="object-cover rounded-2xl"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteCurrentMedia(media.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          aria-label="Delete image"
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    {/* New media previews */}
                    {mediaState.mediaPreviews.map((media, index) => (
                      <div key={`new-${index}`} className="relative w-32 aspect-square border border-gray-200 rounded-2xl group">
                        <Image
                          src={media}
                          fill
                          alt="new image preview"
                          className="object-cover rounded-2xl"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          aria-label="Delete image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Media upload */}
                  {canAddMoreMedia && (
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMediaChange}
                      className="p-4 border-neutral-200 border-dashed border rounded-md w-full hover:bg-neutral-100"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Promotions */}
          <div className="flex flex-col">
            <Label>Promotions</Label>
            {selectedPromotions.length > 0 && (
              <div className='flex flex-wrap gap-2 mb-2'>
                {discounts
                  .filter((d) => selectedPromotions.includes(d.id))
                  .map((d) => (
                    <span key={d.id} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      {d.name}
                    </span>
                  ))}
              </div>
            )}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2'>
              {discounts.map((discount) => {
                const isSelected = selectedPromotions.includes(discount.id);
                return (
                  <button
                    type="button"
                    key={discount.id}
                    onClick={() => handlePromotionToggle(discount.id)}
                    className={cn(
                      "text-left p-2 border rounded-xl transition-colors w-full",
                      isSelected ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1 text-sm">{discount.name}</h3>
                    <p className="text-gray-600 text-xs mb-3 line-clamp-1">{discount.description}</p>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-green-600">
                          {discount.unit === 'PERCENTAGE' ? `${discount.value}%` :
                            discount.unit === 'currency' ? `Rp ${discount.value.toLocaleString()}` :
                              'B1G1'}
                        </span>
                        <span className="text-xs text-gray-500">min Rp {discount.minPurchase.toLocaleString()}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-between items-center'>
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
                  <div>Are you sure you want to delete product <span className='font-bold'>{product.name}</span>?</div>
                  <div className='flex justify-end gap-2'>
                    <Button type='button' variant={"secondary"} onClick={() => setConfirmOpen(false)}>
                      Cancel
                    </Button>
                    <Button type='button' variant={"destructive"} onClick={handleConfirmDelete}>
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
              <Button type="submit" disabled={isSubmitting || isUploading}>
                {isSubmitting || isUploading ? "Updating product..." : "Update Product"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}