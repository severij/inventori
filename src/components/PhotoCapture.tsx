import { useState, useRef, useEffect } from 'react';
import { PhotoLightbox } from './PhotoLightbox';
import { compressImage } from '../utils/imageCompression';

interface PhotoCaptureProps {
  photos: Blob[];
  onChange: (photos: Blob[]) => void;
  maxPhotos?: number;
  label?: string;
}

/**
 * Component for capturing photos via native camera or file upload.
 * Displays preview thumbnails with delete functionality.
 * On mobile, the Camera button opens the native camera app.
 * On desktop, it opens a file picker (with camera if available).
 *
 * **Image Compression:**
 * Photos are automatically compressed before being added:
 * - Max 1920px longest side
 * - 80% JPEG quality
 * - ~95% reduction for typical camera photos
 */
export function PhotoCapture({
  photos,
  onChange,
  maxPhotos = 10,
  label = 'Photos',
}: PhotoCaptureProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [objectUrls, setObjectUrls] = useState<{ [key: number]: string }>({});

  // Create object URLs for photos on mount, revoke on unmount
  useEffect(() => {
    const urls: { [key: number]: string } = {};
    photos.forEach((photo, index) => {
      urls[index] = URL.createObjectURL(photo);
    });
    setObjectUrls(urls);

    return () => {
      // Cleanup: revoke all object URLs when component unmounts
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const addPhotos = async (files: FileList) => {
    const newPhotos: Blob[] = [];
    for (let i = 0; i < files.length; i++) {
      if (photos.length + newPhotos.length >= maxPhotos) break;

      // Compress image before adding
      try {
        const compressed = await compressImage(files[i]);
        newPhotos.push(compressed);
      } catch (error) {
        console.error('Error compressing image:', error);
        // Fallback: add original if compression fails
        newPhotos.push(files[i]);
      }
    }

    if (newPhotos.length > 0) {
      onChange([...photos, ...newPhotos]);
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addPhotos(e.target.files);
    }
    // Reset input so same file can be selected again
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addPhotos(e.target.files);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onChange(newPhotos);
  };

  const canAddMore = photos.length < maxPhotos;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-content-secondary">{label}</label>

      {/* Photo previews */}
       {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((_, index) => (
            <div key={index} className="relative group">
              <img
                src={objectUrls[index]}
                alt={`Photo ${index + 1}`}
                className="w-20 h-20 object-cover rounded-md border border-border cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setLightboxIndex(index)}
              />
              <button
                type="button"
                onClick={() => handleDelete(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                aria-label={`Delete photo ${index + 1}`}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      {canAddMore && (
        <div className="flex gap-2">
          {/* Camera button — opens native camera on mobile */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 bg-surface-tertiary text-content-secondary rounded-md hover:bg-border transition-colors text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
              />
            </svg>
            Camera
          </button>

          {/* Hidden camera input — capture="environment" triggers native camera on mobile */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            className="hidden"
          />

          {/* File upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 bg-surface-tertiary text-content-secondary rounded-md hover:bg-border transition-colors text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            Upload
          </button>

          {/* Hidden file input — no capture attribute, opens file picker / gallery */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Photo count */}
      <p className="text-xs text-content-muted">
        {photos.length} / {maxPhotos} photos
      </p>

      {/* Photo lightbox overlay */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
