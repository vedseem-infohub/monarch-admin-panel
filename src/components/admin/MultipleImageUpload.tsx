'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Loader2, Trash2, Star, CheckCircle2, Plus } from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import { useToast } from '@/components/ui/Toast';

export interface MultipleImageUploadProps {
  values?: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  helperText?: string;
  maxImages?: number;
  className?: string;
}

export const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({
  values = [],
  onChange,
  label = 'Product Photography & Media',
  helperText = 'Select multiple high-resolution photos from your device (Max 25MB each). First image serves as the Main Cover.',
  maxImages = 8,
  className = '',
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState({ current: 0, total: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) {
      toast('Please select valid image files (JPG, PNG, WEBP, AVIF)', 'error');
      return;
    }

    const availableSlots = maxImages - values.length;
    if (availableSlots <= 0) {
      toast(`Maximum limit of ${maxImages} images already reached`, 'error');
      return;
    }

    const filesToUpload = files.slice(0, availableSlots);
    setIsUploading(true);
    setUploadCount({ current: 0, total: filesToUpload.length });

    const newUrls: string[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      setUploadCount({ current: i + 1, total: filesToUpload.length });
      try {
        const url = await apiClient.upload.uploadFromDevice(filesToUpload[i]);
        if (url) newUrls.push(url);
      } catch (err) {
        console.error('Failed to upload file to Cloudinary:', filesToUpload[i].name, err);
      }
    }

    setIsUploading(false);

    if (newUrls.length > 0) {
      onChange([...values, ...newUrls]);
      toast(
        `${newUrls.length} image(s) uploaded to Cloudinary successfully`,
        'success'
      );
    } else {
      toast('Could not upload selected images to Cloudinary', 'error');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (indexToRemove: number) => {
    const updated = values.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleSetCover = (indexToCover: number) => {
    if (indexToCover === 0) return;
    const selected = values[indexToCover];
    const filtered = values.filter((_, idx) => idx !== indexToCover);
    onChange([selected, ...filtered]);
    toast('Main cover image updated', 'info');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-3">
        <div>
          <h3 className="font-serif font-bold text-base text-[#24221E]">{label}</h3>
          <p className="text-xs text-[#77736C]">
            {values.length} of {maxImages} images uploaded
          </p>
        </div>

        <button
          type="button"
          disabled={isUploading || values.length >= maxImages}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#B39458] hover:bg-[#9B7940] disabled:opacity-50 text-white text-xs font-semibold rounded-sm transition-colors shadow-xs"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>
                Uploading ({uploadCount.current}/{uploadCount.total})...
              </span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Upload from Device</span>
            </>
          )}
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Drag & Drop Area */}
      {values.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed ${
            isDragging
              ? 'border-[#B39458] bg-[#FAF7EE]'
              : 'border-[#B39458]/40 hover:border-[#B39458] bg-[#FAF9F5]'
          } p-8 text-center rounded-sm cursor-pointer transition-all group`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2 text-[#9B7940]">
              <Loader2 className="w-8 h-8 animate-spin text-[#B39458]" />
              <p className="text-xs font-semibold text-[#24221E]">
                Uploading {uploadCount.current} of {uploadCount.total} images to Cloudinary...
              </p>
              <p className="text-[11px] text-[#77736C]">
                Processing high-resolution media directly to cloud storage
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <UploadCloud className="w-8 h-8 text-[#B39458] mx-auto group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-[#24221E]">
                Click to browse images from your device or drag & drop files here
              </p>
              <p className="text-[11px] text-[#77736C]">
                Direct Cloudinary upload · Supports WEBP, PNG, JPG (Max 25MB each)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Gallery of Uploaded Images */}
      {values.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          {values.map((img, i) => (
            <div
              key={i}
              className={`relative aspect-3/4 rounded-sm overflow-hidden border ${
                i === 0 ? 'border-[#B39458] ring-2 ring-[#B39458]/30' : 'border-[#E8E3D9]'
              } bg-[#F7F5F0] group shadow-xs`}
            >
              <img src={img} alt={`Asset ${i + 1}`} className="w-full h-full object-cover" />

              {/* Cover Badge */}
              {i === 0 ? (
                <span className="absolute top-2 left-2 text-[9px] font-bold uppercase bg-[#B39458] text-white px-2 py-0.5 rounded shadow-xs flex items-center space-x-1">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  <span>Main Cover</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSetCover(i)}
                  className="absolute top-2 left-2 text-[9px] font-semibold bg-black/75 hover:bg-[#B39458] text-white px-2 py-0.5 rounded shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Make this the main cover image"
                >
                  Set as Cover
                </button>
              )}

              {/* Cloudinary Badge */}
              <span className="absolute bottom-2 left-2 text-[8px] bg-black/60 text-white px-1.5 py-0.5 rounded backdrop-blur-xs font-mono">
                ☁ Cloudinary
              </span>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-[#A63A3A] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                title="Remove image"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {helperText && <p className="text-[11px] text-[#77736C]">{helperText}</p>}
    </div>
  );
};

