import { create } from "zustand";
import axios from "axios";
import { ImageState } from "../types/image";
import { API_CONFIG, buildApiUrl } from "@/config/api";
import type { ProductImage } from "@/types/product";
import { StoreApiResponse } from "@/types/store";

const getAuthToken = (): string => {
  const token =
    (typeof window !== "undefined" && localStorage.getItem("accessToken")) ||
    (typeof window !== "undefined" && sessionStorage.getItem("accessToken")) ||
    "";

  return token;
};

export const useImageStore = create<ImageState>((set) => ({
  images: [],
  isUploading: false,
  error: null,

  uploadSingleImage: async (file, productID, isPrimary) => {
    set({ isUploading: true, error: null });
    try {

      const token = getAuthToken();

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE}/upload-single`,
        formData,
        {
          params: { productID, isPrimary },
          headers: { "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
           },
           withCredentials: true
        }
      );

      const uploaded: ProductImage = response.data?.data as ProductImage;
      set((state) => ({
        images: [...state.images, uploaded],
        isUploading: false,
      }));
    } catch (err: unknown) {
      console.log("Error: ", err);
    }
  },

  uploadMultiImage: async (files, productID, isPrimary) => {
    set({ isUploading: true, error: null });
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("file", file));

      const token = getAuthToken();

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE}/upload-multi`,
        formData,
        {
          params: { productID, isPrimary },
          headers: { "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
           },
           withCredentials: true
        }
      );

      const uploadedImages: ProductImage[] = (response.data?.data || []) as ProductImage[];
      set((state) => ({
        images: [...state.images, ...uploadedImages],
        isUploading: false,
      }));
    } catch (err: unknown) {
      console.log("Error: ", err);
    }
  },

  deleteImage: async (imageId) => {
    set({ isUploading: true, error: null });
    try {

      const token = getAuthToken();

      await axios.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE}/${imageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        }
      );

      set((state) => ({
        images: state.images.filter((img) => img.id !== imageId),
        isUploading: false,
      }));
    } catch (err: unknown) {
      console.log("Error: ", err);
    }
  },
}));
