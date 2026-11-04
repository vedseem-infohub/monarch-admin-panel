'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Loader2, Trash2, RefreshCw, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import { useToast } from '@/components/ui/Toast';

export interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  aspectRatio?: 'video' | 'portrait' | 'square' | 'wide' | 'auto';
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = 'Showcase Image',
  helperText = 'Upload high-resolution WEBP, PNG, or JPG from your device (Max 25MB)',
  aspectRatio = 'portrait',
  className = '',
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const aspectClass = {
    video: 'aspect-16/9',
    portrait: 'aspect-3/4',
    square: 'aspect-1/1',
    wide: 'aspect-21/9',
    auto: 'min-h-[160px]',
  }[aspectRatio];

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast('Please select an image file (JPG, PNG, WEBP, AVIF)', 'error');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast('Image exceeds the 25MB maximum limit', 'error');
      return;
    }

    setIsUploading(true);

    try {
      const secureUrl = await apiClient.upload.uploadFromDevice(file);

      if (!secureUrl) {
        throw new Error('Upload endpoint returned an invalid response');
      }

      onChange(secureUrl);
      toast('Image uploaded to Cloudinary successfully', 'success');
    } catch (err: any) {
      console.error('Device image upload error:', err);
      toast('Cloudinary upload failed. Please try again.', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-[#24221E]">{label}</label>
          {value && value.includes('cloudinary') && (
            <span className="text-[10px] text-[#3E7B54] font-medium flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-[#3E7B54]" />
              <span>Hosted on Cloudinary</span>
            </span>
          )}
        </div>
      )}

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {value ? (
        /* Image Preview Box with Controls */
        <div className={`relative ${aspectClass} rounded-sm overflow-hidden border border-[#E8E3D9] bg-[#F7F5F0] group shadow-xs`}>
          <img
            src={value}
            alt="Uploaded asset"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
          />

          {/* Cloudinary Pill Badge */}
          <div className="absolute top-2 left-2 z-10 flex items-center space-x-1 px-2 py-0.5 rounded-full bg-black/70 text-[9px] uppercase tracking-wider text-white backdrop-blur-xs font-semibold">
            <span>☁ Cloudinary</span>
          </div>

          {/* Action Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 p-3">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-white text-[#24221E] text-xs font-semibold hover:bg-[#F7F5F0] transition-colors shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#B39458]" />
              <span>Change Image</span>
            </button>
            <button
              type="button"
              disabled={isUploading}
              onClick={() => onChange('')}
              className="p-1.5 rounded bg-[#A63A3A] text-white hover:bg-red-700 transition-colors shadow-md"
              title="Remove Image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Uploading Spinner Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white space-y-2 z-20">
              <Loader2 className="w-6 h-6 animate-spin text-[#B39458]" />
              <span className="text-xs font-semibold">Uploading to Cloudinary...</span>
            </div>
          )}
        </div>
      ) : (
        /* Empty Dropzone for Device Upload */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed ${
            isDragging
              ? 'border-[#B39458] bg-[#FAF7EE]'
              : 'border-[#B39458]/40 hover:border-[#B39458] bg-[#FAF9F5]'
          } ${aspectClass} p-6 flex flex-col items-center justify-center text-center rounded-sm cursor-pointer transition-all group`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2 text-[#9B7940]">
              <Loader2 className="w-8 h-8 animate-spin text-[#B39458]" />
              <span className="text-xs font-semibold text-[#24221E]">
                Uploading to Cloudinary...
              </span>
              <span className="text-[10px] text-[#77736C]">
                Processing high-res image
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F0] border border-[#B39458]/30 flex items-center justify-center mx-auto text-[#B39458] group-hover:scale-110 group-hover:bg-[#B39458] group-hover:text-white transition-all shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#24221E]">
                  Upload Image from Device
                </p>
                <p className="text-[11px] text-[#77736C] mt-0.5">
                  Click to browse from your device or drag & drop here
                </p>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white border border-[#E8E3D9] text-[10px] font-semibold text-[#9B7940] shadow-2xs">
                Direct Cloudinary Storage
              </span>
            </div>
          )}
        </div>
      )}

      {helperText && !value && (
        <p className="text-[11px] text-[#77736C]">{helperText}</p>
      )}
    </div>
  );
};

