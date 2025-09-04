import type { ProductImage } from "@/types/product";

export interface ImageState {
  images: ProductImage[];
  isUploading: boolean;
  error: string | null;
  uploadSingleImage: (file: File, productID: string, isPrimary: boolean) => Promise<void>;
  uploadMultiImage: (files: File[], productID: string, isPrimary: boolean) => Promise<void>;
  updatePrimary: (imageId: string, isPrimary: boolean) => Promise<void>;
  deleteImage: (imageId: string) => Promise<void>;
}