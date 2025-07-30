import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  PhotoIcon,
  CloudArrowUpIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const ImageUpload = ({ 
  onImageChange, 
  preview, 
  className = "w-full h-48",
  acceptedTypes = "image/*",
  maxSize = 2 * 1024 * 1024, // 2MB
  multiple = false 
}) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Silakan pilih file gambar yang valid');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      toast.error(`Ukuran file terlalu besar. Maksimal ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    onImageChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      if (!file.type.startsWith('image/')) {
        toast.error('Silakan pilih file gambar yang valid');
        return;
      }

      if (file.size > maxSize) {
        toast.error(`Ukuran file terlalu besar. Maksimal ${Math.round(maxSize / 1024 / 1024)}MB`);
        return;
      }

      onImageChange(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemoveImage = () => {
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        multiple={multiple}
        className="hidden"
      />

      {preview ? (
        <div className="relative w-full h-full group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={handleClick}
              className="p-2 bg-white text-secondary-900 rounded-full hover:bg-secondary-100 transition-colors"
            >
              <PhotoIcon className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={handleRemoveImage}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      ) : (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="w-full h-full border-2 border-dashed border-secondary-300 rounded-lg hover:border-primary-400 transition-colors cursor-pointer bg-secondary-50 hover:bg-secondary-100"
        >
          <div className="flex flex-col items-center justify-center h-full text-secondary-500 p-6">
            <CloudArrowUpIcon className="w-12 h-12 mb-4" />
            <p className="text-center font-medium mb-2">
              Klik untuk upload atau drag & drop
            </p>
            <p className="text-sm text-center">
              PNG, JPG, GIF hingga {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ImageUpload;