import { useRef, useState, useEffect, useCallback } from 'react';

interface PhotoCaptureProps {
  photos: Blob[];
  onChange: (photos: Blob[]) => void;
  maxPhotos?: number;
  label?: string;
}

type CameraState = 'idle' | 'preview' | 'captured' | 'error';

interface ZoomRange {
  min: number;
  max: number;
}

/**
 * Component for capturing photos via camera or file upload.
 * Displays preview thumbnails with delete functionality.
 * Camera mode shows fullscreen overlay with live preview.
 * Supports pinch-to-zoom and tap-to-focus.
 */
export function PhotoCapture({
  photos,
  onChange,
  maxPhotos = 10,
  label = 'Photos',
}: PhotoCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const capturedImageUrlRef = useRef<string | null>(null);

  // Camera state
  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [capturedImage, setCapturedImage] = useState<Blob | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Zoom state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomRange, setZoomRange] = useState<ZoomRange | null>(null);
  const [supportsNativeZoom, setSupportsNativeZoom] = useState(false);
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  const lastPinchDistanceRef = useRef<number | null>(null);
  const zoomIndicatorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus state
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);
  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup blob URL when captured image changes or component unmounts
  useEffect(() => {
    return () => {
      if (capturedImageUrlRef.current) {
        URL.revokeObjectURL(capturedImageUrlRef.current);
        capturedImageUrlRef.current = null;
      }
      if (zoomIndicatorTimeoutRef.current) {
        clearTimeout(zoomIndicatorTimeoutRef.current);
      }
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  // Get URL for captured image (with cleanup tracking)
  const getCapturedImageUrl = useCallback(() => {
    if (capturedImageUrlRef.current) {
      URL.revokeObjectURL(capturedImageUrlRef.current);
    }
    if (capturedImage) {
      capturedImageUrlRef.current = URL.createObjectURL(capturedImage);
      return capturedImageUrlRef.current;
    }
    return null;
  }, [capturedImage]);

  // Check zoom capabilities of the camera
  const checkZoomCapabilities = useCallback((stream: MediaStream) => {
    const track = stream.getVideoTracks()[0];
    if (!track) return;

    try {
      const capabilities = track.getCapabilities() as MediaTrackCapabilities & {
        zoom?: { min: number; max: number; step: number };
      };

      if (capabilities.zoom) {
        setSupportsNativeZoom(true);
        setZoomRange({
          min: capabilities.zoom.min,
          max: capabilities.zoom.max,
        });
      } else {
        // CSS fallback zoom
        setSupportsNativeZoom(false);
        setZoomRange({ min: 1, max: 3 });
      }
    } catch {
      // Fallback if getCapabilities not supported
      setSupportsNativeZoom(false);
      setZoomRange({ min: 1, max: 3 });
    }
  }, []);

  // Apply native zoom to camera
  const applyNativeZoom = useCallback(async (zoom: number) => {
    if (!streamRef.current || !supportsNativeZoom) return;

    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      await track.applyConstraints({
        advanced: [{ zoom } as MediaTrackConstraintSet],
      });
    } catch (err) {
      console.warn('Failed to apply zoom:', err);
    }
  }, [supportsNativeZoom]);

  // Show zoom indicator and auto-hide after delay
  const showZoomIndicatorWithTimeout = useCallback(() => {
    setShowZoomIndicator(true);

    if (zoomIndicatorTimeoutRef.current) {
      clearTimeout(zoomIndicatorTimeoutRef.current);
    }

    zoomIndicatorTimeoutRef.current = setTimeout(() => {
      setShowZoomIndicator(false);
    }, 2000);
  }, []);

  // Calculate distance between two touch points
  const getDistance = (touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Handle pinch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      lastPinchDistanceRef.current = getDistance(e.touches[0], e.touches[1]);
    }
  };

  // Handle pinch move (zoom)
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastPinchDistanceRef.current !== null && zoomRange) {
      e.preventDefault();
      
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / lastPinchDistanceRef.current;

      const newZoom = Math.min(
        zoomRange.max,
        Math.max(zoomRange.min, zoomLevel * scale)
      );

      setZoomLevel(newZoom);
      lastPinchDistanceRef.current = currentDistance;
      showZoomIndicatorWithTimeout();

      if (supportsNativeZoom) {
        applyNativeZoom(newZoom);
      }
    }
  }, [zoomLevel, zoomRange, supportsNativeZoom, applyNativeZoom, showZoomIndicatorWithTimeout]);

  // Handle pinch end
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // If it was a single tap (not a pinch), handle focus
    if (e.changedTouches.length === 1 && lastPinchDistanceRef.current === null) {
      handleTapToFocus(e.changedTouches[0]);
    }
    lastPinchDistanceRef.current = null;
  }, []);

  // Handle tap to focus
  const handleTapToFocus = async (touch: React.Touch) => {
    const video = videoRef.current;
    const container = videoContainerRef.current;
    if (!video || !container) return;

    const rect = video.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width;
    const y = (touch.clientY - rect.top) / rect.height;

    // Only process if tap is within video bounds
    if (x < 0 || x > 1 || y < 0 || y > 1) return;

    // Show focus indicator
    setFocusPoint({ x, y });

    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
    }
    focusTimeoutRef.current = setTimeout(() => {
      setFocusPoint(null);
    }, 800);

    // Try to apply focus point (graceful fail if not supported)
    try {
      const track = streamRef.current?.getVideoTracks()[0];
      if (track) {
        const capabilities = track.getCapabilities() as MediaTrackCapabilities & {
          focusMode?: string[];
        };
        
        if (capabilities.focusMode?.includes('manual') || capabilities.focusMode?.includes('single-shot')) {
          await track.applyConstraints({
            advanced: [{ 
              focusMode: 'manual',
              pointsOfInterest: [{ x, y }],
            } as MediaTrackConstraintSet],
          });
        }
      }
    } catch {
      // Focus not supported, but we still showed the indicator
    }
  };

  // Handle click for focus (mouse)
  const handleClick = (e: React.MouseEvent) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = video.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    if (x < 0 || x > 1 || y < 0 || y > 1) return;

    setFocusPoint({ x, y });

    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
    }
    focusTimeoutRef.current = setTimeout(() => {
      setFocusPoint(null);
    }, 800);
  };

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

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const resetZoomState = useCallback(() => {
    setZoomLevel(1);
    setZoomRange(null);
    setSupportsNativeZoom(false);
    setShowZoomIndicator(false);
    if (zoomIndicatorTimeoutRef.current) {
      clearTimeout(zoomIndicatorTimeoutRef.current);
    }
  }, []);

  const openCamera = async () => {
    setErrorMessage(null);
    setCameraState('preview');
    resetZoomState();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });

      streamRef.current = stream;
      checkZoomCapabilities(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera error:', err);
      
      let message = 'Could not access camera. Please try again.';
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          message = 'Camera access was denied. Please allow camera access in your browser settings.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          message = 'No camera found on this device.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          message = 'Camera is already in use by another application.';
        }
      }
      
      setErrorMessage(message);
      setCameraState('error');
    }
  };

  const flipCamera = async () => {
    stopStream();
    resetZoomState();
    
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacingMode);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: false,
      });

      streamRef.current = stream;
      checkZoomCapabilities(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera flip error:', err);
      // If flip fails, try to go back to original camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        streamRef.current = stream;
        checkZoomCapabilities(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setFacingMode(facingMode); // Revert state
      } catch {
        setErrorMessage('Could not switch camera.');
        setCameraState('error');
      }
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    
    // If using CSS zoom, we need to crop the zoomed area
    if (!supportsNativeZoom && zoomLevel > 1) {
      // Calculate the visible area when zoomed
      const scale = zoomLevel;
      const cropWidth = video.videoWidth / scale;
      const cropHeight = video.videoHeight / scale;
      const cropX = (video.videoWidth - cropWidth) / 2;
      const cropY = (video.videoHeight - cropHeight) / 2;
      
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          video,
          cropX, cropY, cropWidth, cropHeight,  // Source rectangle
          0, 0, cropWidth, cropHeight           // Destination rectangle
        );
      }
    } else {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
      }
    }

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedImage(blob);
          setCameraState('captured');
          // Pause video but keep stream alive for potential retake
          video.pause();
        }
      },
      'image/jpeg',
      0.9
    );
  };

  const keepPhoto = () => {
    if (capturedImage && photos.length < maxPhotos) {
      onChange([...photos, capturedImage]);
    }
    closeCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    if (capturedImageUrlRef.current) {
      URL.revokeObjectURL(capturedImageUrlRef.current);
      capturedImageUrlRef.current = null;
    }
    setCameraState('preview');
    
    // Resume video
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const closeCamera = () => {
    stopStream();
    setCapturedImage(null);
    setErrorMessage(null);
    setCameraState('idle');
    resetZoomState();
    setFocusPoint(null);
    if (capturedImageUrlRef.current) {
      URL.revokeObjectURL(capturedImageUrlRef.current);
      capturedImageUrlRef.current = null;
    }
  };

  const handleDelete = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onChange(newPhotos);
  };

  const canAddMore = photos.length < maxPhotos;

  // Calculate zoom percentage for the indicator
  const zoomPercent = zoomRange
    ? ((zoomLevel - zoomRange.min) / (zoomRange.max - zoomRange.min)) * 100
    : 0;

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
            onClick={openCamera}
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

      {/* Photo count */}
      <p className="text-xs text-content-muted">
        {photos.length} / {maxPhotos} photos
      </p>

      {/* Camera Overlay */}
      {cameraState !== 'idle' && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col h-[100dvh]">
          {/* Header */}
          <div className="flex justify-between items-center p-4">
            {/* Cancel button */}
            <button
              type="button"
              onClick={closeCamera}
              className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Cancel"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Flip camera button - only in preview mode */}
            {cameraState === 'preview' && (
              <button
                type="button"
                onClick={flipCamera}
                className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Flip camera"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </button>
            )}

            {/* Spacer when flip button is hidden */}
            {cameraState !== 'preview' && <div className="w-10" />}
          </div>

          {/* Main content area */}
          <div 
            ref={videoContainerRef}
            className="flex-1 flex items-center justify-center overflow-hidden px-4 relative"
          >
            {/* Live video preview */}
            {cameraState === 'preview' && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleClick}
                className={`max-h-full max-w-full object-contain rounded-lg touch-none ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
                style={{
                  // CSS fallback zoom (only when native zoom not supported)
                  transform: `${facingMode === 'user' ? 'scaleX(-1)' : ''} ${
                    !supportsNativeZoom && zoomLevel > 1 ? `scale(${zoomLevel})` : ''
                  }`,
                }}
              />
            )}

            {/* Focus indicator - circle (positioned relative to video) */}
            {focusPoint && cameraState === 'preview' && videoRef.current && (() => {
              const video = videoRef.current;
              const container = videoContainerRef.current;
              if (!container) return null;
              
              const videoRect = video.getBoundingClientRect();
              const containerRect = container.getBoundingClientRect();
              
              // Calculate position relative to container
              const left = (videoRect.left - containerRect.left) + (focusPoint.x * videoRect.width);
              const top = (videoRect.top - containerRect.top) + (focusPoint.y * videoRect.height);
              
              return (
                <div
                  className="absolute w-16 h-16 border-2 border-yellow-400 rounded-full pointer-events-none animate-focus-pulse"
                  style={{
                    left: `${left}px`,
                    top: `${top}px`,
                  }}
                />
              );
            })()}

            {/* Zoom indicator pill */}
            {zoomLevel > 1 && showZoomIndicator && cameraState === 'preview' && zoomRange && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
                {/* Progress bar */}
                <div className="w-16 h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-75"
                    style={{ width: `${zoomPercent}%` }}
                  />
                </div>
                {/* Zoom value */}
                <span className="text-white text-sm font-medium min-w-[3rem] text-right">
                  {zoomLevel.toFixed(1)}x
                </span>
              </div>
            )}

            {/* Captured image preview */}
            {cameraState === 'captured' && capturedImage && (
              <img
                src={getCapturedImageUrl() || ''}
                alt="Captured photo"
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            )}

            {/* Error state */}
            {cameraState === 'error' && (
              <div className="text-center text-white p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-16 h-16 mx-auto mb-4 text-red-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
                <p className="text-red-400 mb-6">{errorMessage}</p>
                <button
                  type="button"
                  onClick={closeCamera}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* Footer with action buttons */}
          <div className="p-6 flex justify-center items-center min-h-[120px]">
            {/* Capture button - large circular */}
            {cameraState === 'preview' && (
              <button
                type="button"
                onClick={capturePhoto}
                className="w-[72px] h-[72px] rounded-full border-4 border-white flex items-center justify-center
                           bg-transparent hover:bg-white/10 active:scale-95 transition-transform"
                aria-label="Take photo"
              >
                <div className="w-[56px] h-[56px] rounded-full bg-white" />
              </button>
            )}

            {/* Review buttons */}
            {cameraState === 'captured' && (
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
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
                      d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                    />
                  </svg>
                  Retake
                </button>
                <button
                  type="button"
                  onClick={keepPhoto}
                  className="flex items-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-lg transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Keep
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
