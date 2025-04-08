import React, { useState, useEffect, useRef } from 'react';
import { useController } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FaCloudUploadAlt, FaTrash, FaSpinner } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { app } from '../firebase';

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
  const [uploadProgress, setUploadProgress] = useState({});
  const initialized = useRef(false);
  const { currentUser } = useSelector((state) => state.user);

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
    if (files.length > 0 && JSON.stringify(files) !== JSON.stringify(field.value)) {
      field.onChange(files);
    } else if (files.length === 0 && field.value && field.value.length > 0) {
      field.onChange([]);
    }
  }, [files, field]);

  const uploadToFirebase = async (file) => {
    try {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + '_' + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Update progress
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setUploadProgress(prev => ({
              ...prev,
              [fileName]: progress
            }));
          },
          (error) => {
            console.error("Upload error:", error);
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref)
              .then(downloadURL => {
                resolve(downloadURL);
              })
              .catch(reject);
          }
        );
      });
    } catch (error) {
      console.error("Firebase error:", error);
      throw error;
    }
  };

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

    // Create temporary previews with blob URLs
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
    setIsUploading(true);
    
    try {
      // Upload files to Firebase one by one
      const uploadPromises = validFiles.map(async (file) => {
        const downloadURL = await uploadToFirebase(file);
        return downloadURL;
      });
      
      // Wait for all uploads to complete
      const uploadedUrls = await Promise.all(uploadPromises);
      
      if (!uploadedUrls || uploadedUrls.length === 0) {
        throw new Error('No se recibieron URLs de Firebase');
      }
      
      // Add new URLs to files array
      setFiles(prevFiles => [...prevFiles, ...uploadedUrls]);
      
      // Update previews with permanent URLs
      const tempPreviewCount = preview.filter(item => !item.isUploaded).length;
      
      setPreview(prev => {
        const newPreviews = [...prev];
        let urlIndex = 0;
        
        return newPreviews.map(item => {
          if (!item.isUploaded) {
            // Revoke the blob URL to prevent memory leaks
            if (item.url.startsWith('blob:')) {
              URL.revokeObjectURL(item.url);
            }
            
            const updatedItem = {
              url: uploadedUrls[urlIndex],
              isUploaded: true
            };
            
            urlIndex++;
            return updatedItem;
          }
          return item;
        });
      });
      
      toast.success(`${validFiles.length} archivo${validFiles.length > 1 ? 's' : ''} subido${validFiles.length > 1 ? 's' : ''} correctamente`);
    } catch (error) {
      console.error('Error de subida:', error);
      toast.error('Error al subir archivos. Intente nuevamente más tarde.');
      
      // Remove failed uploads from preview
      setPreview(prev => prev.filter(item => item.isUploaded));
      
      // Revoke any blob URLs to prevent memory leaks
      newPreviews.forEach(item => {
        if (!item.isUploaded && item.url.startsWith('blob:')) {
          URL.revokeObjectURL(item.url);
        }
      });
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleRemove = (index) => {
    // Revoke blob URL if it's a blob
    const item = preview[index];
    if (item && item.url.startsWith('blob:')) {
      URL.revokeObjectURL(item.url);
    }
    
    // Remove from previews
    const newPreviews = [...preview];
    newPreviews.splice(index, 1);
    setPreview(newPreviews);
    
    // Remove from files array
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  // Clean up any blob URLs when component unmounts
  useEffect(() => {
    return () => {
      preview.forEach(item => {
        if (item.url?.startsWith('blob:')) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, [preview]);

  // Calculate overall upload progress
  const overallProgress = Object.values(uploadProgress).length > 0
    ? Object.values(uploadProgress).reduce((sum, value) => sum + value, 0) / Object.values(uploadProgress).length
    : 0;

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
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-center mt-1">Subiendo: {Math.round(overallProgress)}%</p>
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
              {!item.isUploaded && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <FaSpinner className="animate-spin text-white" />
                </div>
              )}
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