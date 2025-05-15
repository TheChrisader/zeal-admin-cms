import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud, XCircle, Image as ImageIcon } from "lucide-react";

interface ImageUploadPreviewProps {
  currentImageUrl?: string | null;
  onFileSelect: (file: File | null) => void;
  onReset: () => void;
  label?: string;
}

const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({
  currentImageUrl,
  onFileSelect,
  onReset,
  label = "Thumbnail Image",
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setPreviewUrl(currentImageUrl || null);
  }, [currentImageUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      onFileSelect(file);
    }
  };

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
        onFileSelect(file);
      } else {
        // Handle invalid file type, maybe show a toast
        console.warn("Invalid file type dropped.");
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
    },
    []
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
    },
    []
  );

  const handleResetClick = () => {
    setPreviewUrl(currentImageUrl || null); // Reset preview to original or nothing
    onFileSelect(null); // Clear any selected file
    onReset(); // Propagate reset to parent
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onFileSelect(null);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div
        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer
          ${
            isDragging
              ? "border-primary bg-primary/10"
              : "border-gray-300 hover:border-gray-400"
          }
          transition-colors duration-200 ease-in-out`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById("file-upload-input")?.click()}
      >
        <input
          id="file-upload-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {previewUrl ? (
          <div className="relative group w-full h-48 flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-md"
            />
            <div
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center 
                         opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                className="text-white hover:text-red-400"
              >
                <XCircle className="h-5 w-5 mr-1" /> Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
            <UploadCloud className="h-12 w-12" />
            <p className="text-sm">
              Drag & drop an image here, or click to select a file.
            </p>
          </div>
        )}
      </div>
      {(previewUrl !== currentImageUrl || (currentImageUrl && !previewUrl)) && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetClick}
          className="mt-2"
        >
          Reset to Original
        </Button>
      )}
    </div>
  );
};

export default ImageUploadPreview;
