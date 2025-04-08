import React, { useState, useEffect, useRef } from 'react';
import { useController } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FaCloudUploadAlt, FaTrash, FaSpinner } from 'react-icons/fa';

export default function MediaUploader({ 
  name, 
  label, 
  type = 'image', 
  maxFiles = 6,
  accept = 'image/*'
}) {
  const { field, fieldState } = useController({ name });
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState([]);
  const initialized = useRef(false);

  // Initialize files and previews from field value on mount only
  useEffect(() => {
    if (!initialized.current && field.value && Array.isArray(field.value)) {
      initialized.current = true;
      setFiles(field.value);
      setPreview(field.value.map(url => ({ url, isUploaded: true })));
    }
  }, [field.value]);

  // Update field value when files change, but only if we have actual changes
  useEffect(() => {
    // Only update the field if files array isn't empty and is different from current field value
    if (files.length > 0 && JSON.stringify(files) !== JSON.stringify(field.value)) {
      field.onChange(files);
    }
  }, [files]);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (files.length + selectedFiles.length > maxFiles) {
      toast.error(`Máximo ${maxFiles} archivos permitidos`);
      return;
    }

    // Validate file types
    const validFiles = selectedFiles.filter(file => {
      if (type === 'image' && !file.type.startsWith('image/')) {
        toast.error(`${file.name} no es una imagen válida`);
        return false;
      }
      if (type === 'video' && !file.type.startsWith('video/')) {
        toast.error(`${file.name} no es un video válido`);
        return false;
      }
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} es demasiado grande (máximo 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Create previews and prepare for upload
    const newPreviews = [...preview];
    
    validFiles.forEach(file => {
      const fileURL = URL.createObjectURL(file);
      newPreviews.push({
        url: fileURL,
        file: file,
        isUploaded: false
      });
    });
    
    setPreview(newPreviews);
    
    // Upload files to server
    setIsUploading(true);
    
    try {
      // In a real app, this would be an API call to upload files
      // For now, we'll simulate a successful upload with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // After successful "upload", get the new URLs
      const uploadedUrls = [...files]; // Start with existing files
      
      // Add the new URLs from our mocked upload
      validFiles.forEach(file => {
        // In a real app, this would be the URL returned from your server
        // For now, we'll use the object URL as a placeholder
        const uploadedUrl = URL.createObjectURL(file);
        uploadedUrls.push(uploadedUrl);
      });
      
      // Update file list with all URLs
      setFiles(uploadedUrls);
      
      // Update previews to mark all as uploaded
      setPreview(newPreviews.map(item => ({...item, isUploaded: true})));
      
      toast.success(`${validFiles.length} archivo${validFiles.length > 1 ? 's' : ''} subido${validFiles.length > 1 ? 's' : ''} correctamente`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error al subir archivos');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (index) => {
    // Remove from previews
    const newPreviews = [...preview];
    newPreviews.splice(index, 1);
    setPreview(newPreviews);
    
    // Remove from files array
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      {/* File input */}
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-600">
            <label htmlFor={`file-upload-${name}`} className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
              <span>Subir {type === 'image' ? 'imágenes' : 'videos'}</span>
              <input
                id={`file-upload-${name}`}
                name={`file-upload-${name}`}
                type="file"
                className="sr-only"
                multiple
                accept={accept}
                onChange={handleFileChange}
                disabled={isUploading || files.length >= maxFiles}
              />
            </label>
            <p className="pl-1">o arrastra y suelta</p>
          </div>
          <p className="text-xs text-gray-500">
            {type === 'image' ? 'PNG, JPG, GIF hasta 10MB' : 'MP4, MOV hasta 10MB'}
          </p>
          {fieldState.error && (
            <p className="text-xs text-red-500">{fieldState.error.message}</p>
          )}
          {isUploading && (
            <div className="flex justify-center items-center mt-2">
              <FaSpinner className="animate-spin mr-2" />
              <span>Subiendo...</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Preview section */}
      {preview.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {preview.map((item, index) => (
            <div key={index} className="relative">
              {type === 'image' ? (
                <img
                  src={item.url}
                  alt={`Preview ${index}`}
                  className="h-24 w-full object-cover rounded-md"
                />
              ) : (
                <video
                  src={item.url}
                  className="h-24 w-full object-cover rounded-md"
                  controls
                />
              )}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                <FaTrash size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <p className="text-sm text-gray-500">
        {files.length} de {maxFiles} {type === 'image' ? 'imágenes' : 'videos'}
      </p>
    </div>
  );
}