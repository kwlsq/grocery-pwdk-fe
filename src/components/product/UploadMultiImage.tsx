"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadIcon } from "lucide-react";
import Image from "next/image";

export default function UploadMultiImage() {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Uploading files:", files);
    // Add your upload logic here
  };

  return (
    <div>
      <div className="mb-4">
        <p className="text-gray-500 text-sm">
          Select multiple images or drag and drop.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadIcon className="w-10 h-10 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG or GIF (MAX. 800x400px)
              </p>
            </div>
            <input
              id="dropzone-file"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Image Previews */}
        {files.length > 0 && (
          <div className="flex gap-2">
            {files.map((file, index) => (
              <div key={index} className="relative aspect-square w-20 overflow-hidden rounded-lg">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {files.length > 0 && (
          <div className="flex justify-end">
            <Button type="submit">Upload {files.length} Images</Button>
          </div>
        )}
      </form>
    </div>
  );
}
