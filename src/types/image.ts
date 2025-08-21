export interface ImageState {
  images: string[];
  isUploading: boolean;
  error: string | null;
  uploadSingleImage: (file: File, productID: string, isPrimary: boolean) => Promise<void>;
  uploadMultiImage: (files: File[], productID: string, isPrimary: boolean) => Promise<void>;
}