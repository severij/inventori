/**
 * Image compression utility for reducing file sizes before storage.
 * Resizes images to max 1920px and re-encodes at 80% JPEG quality.
 */

/**
 * Compress an image by resizing and re-encoding.
 *
 * @param blob - The image blob to compress
 * @returns A promise that resolves to the compressed blob
 *
 * **Specifications:**
 * - Max dimensions: 1920px × 1920px (longest side)
 * - JPEG quality: 0.8 (80%)
 * - Aspect ratio: Always preserved
 * - EXIF orientation: Handled by createImageBitmap
 *
 * **Example reduction:** 6 MB camera photo → ~200-300 KB
 *
 * **Error handling:** If compression fails, returns original blob
 */
export async function compressImage(blob: Blob): Promise<Blob> {
  try {
    // Validate input
    if (!blob || blob.size === 0) {
      return blob;
    }

    // Only compress image types
    if (!blob.type.startsWith('image/')) {
      return blob;
    }

    // Create image bitmap from blob (handles EXIF orientation automatically)
    const imageBitmap = await createImageBitmap(blob);

    // Calculate new dimensions (max 1920px longest side, preserve aspect ratio)
    const maxSize = 1920;
    let width = imageBitmap.width;
    let height = imageBitmap.height;

    if (width > height) {
      if (width > maxSize) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      }
    } else {
      if (height > maxSize) {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }
    }

    // Draw to canvas at new size
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      // Fallback: return original if canvas context not available
      imageBitmap.close();
      return blob;
    }

    ctx.drawImage(imageBitmap, 0, 0, width, height);
    imageBitmap.close();

    // Re-encode as JPEG at 80% quality
    return new Promise((resolve) => {
      canvas.toBlob(
        (compressedBlob) => {
          if (compressedBlob) {
            resolve(compressedBlob);
          } else {
            // Fallback: return original if toBlob fails
            resolve(blob);
          }
        },
        'image/jpeg',
        0.8 // 80% quality
      );
    });
  } catch (error) {
    // Log error and return original blob as fallback
    console.error('Failed to compress image:', error);
    return blob;
  }
}
