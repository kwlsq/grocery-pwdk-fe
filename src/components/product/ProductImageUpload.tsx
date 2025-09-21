'use client';

import { Label } from "@/components/ui/label";
import Image from 'next/image';
import { cn } from '@/lib/utils';

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

  return null;
};

interface ProductImageUploadProps {
  thumbnail: File | null;
  setThumbnail: (file: File | null) => void;
  thumbnailPreview: string;
  setThumbnailPreview: (preview: string) => void;
  files: File[] | null;
  setFiles: (files: File[] | null) => void;
  mediaPreviews: string[];
  setMediaPreviews: (previews: string[]) => void;
  imageErrors: {
    thumbnail?: string;
    media?: string;
  };
  setImageErrors: (errors: { thumbnail?: string; media?: string }) => void;
}

export default function ProductImageUpload({
  thumbnail,
  setThumbnail,
  thumbnailPreview,
  setThumbnailPreview,
  files,
  setFiles,
  mediaPreviews,
  setMediaPreviews,
  imageErrors,
  setImageErrors,
}: ProductImageUploadProps) {
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
  };

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
  };

  return (
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
  );
}
