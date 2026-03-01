"use client";

import React, { useState, useCallback, useRef } from 'react';
import { ImagePlus, X, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function ImageUpload({ 
  images, 
  onChange, 
  maxImages = 10, 
  maxSizeMB = 5 
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Validate type
      if (!ALLOWED_TYPES.includes(file.type)) {
        reject(new Error(`Format non supporté: ${file.type}. Utilisez JPG, PNG ou WEBP.`));
        return;
      }

      // Validate size
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        reject(new Error(`Image trop grande: ${sizeMB.toFixed(1)}Mo. Max ${maxSizeMB}Mo.`));
        return;
      }

      // Read and resize image
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Resize if too large (max 1200px width/height)
          const MAX_SIZE = 1200;
          let { width, height } = img;
          
          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = (height / width) * MAX_SIZE;
              width = MAX_SIZE;
            } else {
              width = (width / height) * MAX_SIZE;
              height = MAX_SIZE;
            }
          }

          // Create canvas and draw resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context error'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression
          const quality = 0.8;
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
        };
        img.onerror = () => reject(new Error('Erreur de chargement de l\'image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
      reader.readAsDataURL(file);
    });
  }, [maxSizeMB]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remaining = maxImages - images.length;
    
    if (remaining <= 0) {
      setError(`Maximum ${maxImages} images atteint.`);
      return;
    }

    const toProcess = fileArray.slice(0, remaining);
    setIsLoading(true);
    setError(null);

    const newImages: string[] = [];
    const errors: string[] = [];

    for (const file of toProcess) {
      try {
        const base64 = await processFile(file);
        newImages.push(base64);
      } catch (err) {
        errors.push(err instanceof Error ? err.message : 'Erreur inconnue');
      }
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
    }

    if (errors.length > 0) {
      setError(errors.join(' • '));
    }

    setIsLoading(false);
  }, [images, maxImages, onChange, processFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    setError(null);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <img
                src={image}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Badge for first image */}
              {index === 0 && (
                <span className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-2 py-0.5 rounded">
                  Principale
                </span>
              )}
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index - 1)}
                    className="p-1.5 bg-white/90 rounded-full text-gray-700 hover:bg-white"
                    title="Déplacer à gauche"
                  >
                    ←
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600"
                  title="Supprimer"
                >
                  <X className="h-4 w-4" />
                </button>
                {index < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index + 1)}
                    className="p-1.5 bg-white/90 rounded-full text-gray-700 hover:bg-white"
                    title="Déplacer à droite"
                  >
                    →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      {images.length < maxImages && (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-orange-400 bg-orange-50 dark:bg-orange-950/20"
              : "border-gray-300 dark:border-gray-600 hover:border-orange-400"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleInputChange}
            className="hidden"
          />
          {isLoading ? (
            <>
              <Loader2 className="mx-auto h-10 w-10 text-orange-500 mb-3 animate-spin" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Traitement en cours...
              </p>
            </>
          ) : (
            <>
              <ImagePlus className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isDragging ? 'Déposez vos photos ici' : 'Glissez vos photos ici ou cliquez pour parcourir'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG ou WEBP • Max {maxImages} photos • Max {maxSizeMB} Mo par photo
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {images.length}/{maxImages} photos ajoutées
              </p>
            </>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
