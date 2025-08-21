import { create } from "zustand";
import axios from "axios";
import { ImageState } from "../types/image";
import { API_CONFIG } from "@/config/api";

export const useImageStore = create<ImageState>((set) => ({
  images: [],
  isUploading: false,
  error: null,

  uploadSingleImage: async (file, productID, isPrimary) => {
    set({ isUploading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE}/upload-single`,
        formData,
        {
          params: { productID, isPrimary },
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const imageUrl = response.data?.data;
      set((state) => ({
        images: [...state.images, imageUrl],
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

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE}/upload-multi`,
        formData,
        {
          params: { productID, isPrimary },
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const uploadedImages = response.data?.data || [];
      set((state) => ({
        images: [...state.images, ...uploadedImages],
        isUploading: false,
      }));
    } catch (err: unknown) {
      console.log("Error: ", err);
    }
  },
}));
