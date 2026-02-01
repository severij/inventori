import { useRef, useState } from 'react';

interface PhotoCaptureProps {
  photos: Blob[];
  onChange: (photos: Blob[]) => void;
  maxPhotos?: number;
  label?: string;
}

/**
 * Component for capturing photos via camera or file upload.
 * Displays preview thumbnails with delete functionality.
 */
export function PhotoCapture({
  photos,
  onChange,
  maxPhotos = 10,
  label = 'Photos',
}: PhotoCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: Blob[] = [];
    for (let i = 0; i < files.length; i++) {
      if (photos.length + newPhotos.length >= maxPhotos) break;
      newPhotos.push(files[i]);
    }

    if (newPhotos.length > 0) {
      onChange([...photos, ...newPhotos]);
    }

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCameraCapture = async () => {
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      await video.play();

      // Wait a moment for camera to adjust
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Capture frame to canvas
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
      }

      // Stop camera
      stream.getTracks().forEach((track) => track.stop());

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob && photos.length < maxPhotos) {
            onChange([...photos, blob]);
          }
        },
        'image/jpeg',
        0.8
      );
    } catch (err) {
      setCameraError('Camera access denied or not available');
      console.error('Camera error:', err);
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
          {photos.map((photo, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(photo)}
                alt={`Photo ${index + 1}`}
                className="w-20 h-20 object-cover rounded-md border border-border"
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
          {/* Camera button */}
          <button
            type="button"
            onClick={handleCameraCapture}
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

      {/* Error message */}
      {cameraError && <p className="text-sm text-red-500">{cameraError}</p>}

      {/* Photo count */}
      <p className="text-xs text-content-muted">
        {photos.length} / {maxPhotos} photos
      </p>
    </div>
  );
}
