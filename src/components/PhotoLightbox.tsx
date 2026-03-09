import { useEffect, useRef, useState, useCallback } from 'react';

interface PhotoLightboxProps {
  photos: Blob[];
  initialIndex: number;
  onClose: () => void;
}

interface Offset {
  x: number;
  y: number;
}

// Clamp a value between min and max
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

interface TouchPoint {
  clientX: number;
  clientY: number;
}

// Distance between two touch points
function touchDistance(t1: TouchPoint, t2: TouchPoint): number {
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// Midpoint between two touch points
function touchMidpoint(t1: TouchPoint, t2: TouchPoint): { x: number; y: number } {
  return {
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  };
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const DOUBLE_TAP_MS = 300;
const SWIPE_THRESHOLD_PX = 50;
const ZOOM_TOGGLE_SCALE = 2.5;

export function PhotoLightbox({ photos, initialIndex, onClose }: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [objectUrls, setObjectUrls] = useState<string[]>([]);

  // Zoom / pan state
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  // Refs for gesture tracking (no re-render needed)
  const gestureRef = useRef<{
    // Pinch
    isPinching: boolean;
    initialDist: number;
    baseScale: number;
    pinchMidpoint: { x: number; y: number };
    // Pan
    isPanning: boolean;
    panStart: { x: number; y: number };
    baseOffset: Offset;
    // Swipe (single touch at scale=1)
    swipeStartX: number;
    // Double-tap
    lastTapTime: number;
    lastTapX: number;
    lastTapY: number;
  }>({
    isPinching: false,
    initialDist: 0,
    baseScale: 1,
    pinchMidpoint: { x: 0, y: 0 },
    isPanning: false,
    panStart: { x: 0, y: 0 },
    baseOffset: { x: 0, y: 0 },
    swipeStartX: 0,
    lastTapTime: 0,
    lastTapX: 0,
    lastTapY: 0,
  });

  // We also track the "committed" scale/offset via refs so gesture handlers
  // always have the latest value without stale closures.
  const scaleRef = useRef(1);
  const offsetRef = useRef<Offset>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Create object URLs once on mount, revoke on unmount
  useEffect(() => {
    const urls = photos.map((photo) => URL.createObjectURL(photo));
    setObjectUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // Reset zoom and pan when photo changes
  useEffect(() => {
    scaleRef.current = 1;
    offsetRef.current = { x: 0, y: 0 };
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setIsAnimating(false);
  }, [currentIndex]);

  // Compute the max allowed pan offset so the image never slides fully off screen.
  // This is approximate: we allow panning up to half the "extra" size the image gained.
  const getMaxOffset = useCallback((s: number): Offset => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return { x: 0, y: 0 };

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    // Natural rendered image size (before scale transform)
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const aspectImg = iw / ih;
    const aspectCont = cw / ch;
    let renderedW: number;
    let renderedH: number;
    if (aspectImg > aspectCont) {
      renderedW = cw;
      renderedH = cw / aspectImg;
    } else {
      renderedH = ch;
      renderedW = ch * aspectImg;
    }
    const maxX = Math.max(0, (renderedW * s - cw) / 2);
    const maxY = Math.max(0, (renderedH * s - ch) / 2);
    return { x: maxX, y: maxY };
  }, []);

  const applyZoom = useCallback(
    (newScale: number, newOffset: Offset, animate = false) => {
      const s = clamp(newScale, MIN_SCALE, MAX_SCALE);
      const maxOff = getMaxOffset(s);
      const o = {
        x: clamp(newOffset.x, -maxOff.x, maxOff.x),
        y: clamp(newOffset.y, -maxOff.y, maxOff.y),
      };
      scaleRef.current = s;
      offsetRef.current = o;
      setIsAnimating(animate);
      setScale(s);
      setOffset(o);
    },
    [getMaxOffset],
  );

  // Navigate photos (with guard)
  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : prev));
  }, [photos.length]);

  // ─── Keyboard navigation ───────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (scaleRef.current > 1) {
          // First Escape resets zoom
          applyZoom(1, { x: 0, y: 0 }, true);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        goPrev();
      } else if (e.key === 'ArrowRight') {
        goNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, goPrev, goNext, applyZoom]);

  // Focus trap on mount
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // ─── Mouse wheel zoom ──────────────────────────────────────────────────────
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      const newScale = clamp(scaleRef.current + delta * scaleRef.current, MIN_SCALE, MAX_SCALE);

      // Zoom toward cursor position
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const cx = e.clientX - rect.left - rect.width / 2;
        const cy = e.clientY - rect.top - rect.height / 2;
        const scaleDiff = newScale / scaleRef.current;
        const newOffsetX = offsetRef.current.x * scaleDiff + cx * (1 - scaleDiff);
        const newOffsetY = offsetRef.current.y * scaleDiff + cy * (1 - scaleDiff);
        applyZoom(newScale, { x: newOffsetX, y: newOffsetY }, false);
      } else {
        applyZoom(newScale, offsetRef.current, false);
      }
    },
    [applyZoom],
  );

  // ─── Double-click zoom ─────────────────────────────────────────────────────
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (scaleRef.current > 1) {
        applyZoom(1, { x: 0, y: 0 }, true);
      } else {
        // Zoom toward click point
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const cx = e.clientX - rect.left - rect.width / 2;
          const cy = e.clientY - rect.top - rect.height / 2;
          const s = ZOOM_TOGGLE_SCALE;
          const newOffsetX = cx * (1 - s);
          const newOffsetY = cy * (1 - s);
          applyZoom(s, { x: newOffsetX, y: newOffsetY }, true);
        } else {
          applyZoom(ZOOM_TOGGLE_SCALE, { x: 0, y: 0 }, true);
        }
      }
    },
    [applyZoom],
  );

  // ─── Mouse drag (pan) ──────────────────────────────────────────────────────
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (scaleRef.current <= 1) return;
      e.preventDefault();
      e.stopPropagation();
      gestureRef.current.isPanning = true;
      gestureRef.current.panStart = { x: e.clientX, y: e.clientY };
      gestureRef.current.baseOffset = { ...offsetRef.current };
      setIsAnimating(false);
    },
    [],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!gestureRef.current.isPanning) return;
      const dx = e.clientX - gestureRef.current.panStart.x;
      const dy = e.clientY - gestureRef.current.panStart.y;
      applyZoom(scaleRef.current, {
        x: gestureRef.current.baseOffset.x + dx,
        y: gestureRef.current.baseOffset.y + dy,
      });
    },
    [applyZoom],
  );

  const handleMouseUp = useCallback(() => {
    gestureRef.current.isPanning = false;
  }, []);

  // ─── Touch events ──────────────────────────────────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const g = gestureRef.current;

    if (e.touches.length === 2) {
      // Pinch start
      e.preventDefault();
      g.isPinching = true;
      g.isPanning = false;
      g.initialDist = touchDistance(e.touches[0], e.touches[1]);
      g.baseScale = scaleRef.current;
      g.pinchMidpoint = touchMidpoint(e.touches[0], e.touches[1]);
      g.baseOffset = { ...offsetRef.current };
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      const now = Date.now();

      // Double-tap detection
      const timeSinceLast = now - g.lastTapTime;
      const dx = touch.clientX - g.lastTapX;
      const dy = touch.clientY - g.lastTapY;
      const distSinceLast = Math.sqrt(dx * dx + dy * dy);

      if (timeSinceLast < DOUBLE_TAP_MS && distSinceLast < 30) {
        // Double tap — handled in touchEnd to avoid conflict with pan start
        g.lastTapTime = 0; // reset so triple-tap doesn't count as another double
        return;
      }
      g.lastTapTime = now;
      g.lastTapX = touch.clientX;
      g.lastTapY = touch.clientY;

      // Pan / swipe start
      g.isPanning = true;
      g.isPinching = false;
      g.panStart = { x: touch.clientX, y: touch.clientY };
      g.baseOffset = { ...offsetRef.current };
      g.swipeStartX = touch.clientX;
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault(); // prevent browser scroll/zoom
      const g = gestureRef.current;

      if (g.isPinching && e.touches.length === 2) {
        const currentDist = touchDistance(e.touches[0], e.touches[1]);
        const newScale = clamp(
          g.baseScale * (currentDist / g.initialDist),
          MIN_SCALE,
          MAX_SCALE,
        );

        // Zoom toward pinch midpoint
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const mid = touchMidpoint(e.touches[0], e.touches[1]);
          const cx = mid.x - rect.left - rect.width / 2;
          const cy = mid.y - rect.top - rect.height / 2;
          const scaleDiff = newScale / g.baseScale;
          const newOffsetX = g.baseOffset.x * scaleDiff + cx * (1 - scaleDiff);
          const newOffsetY = g.baseOffset.y * scaleDiff + cy * (1 - scaleDiff);
          applyZoom(newScale, { x: newOffsetX, y: newOffsetY }, false);
        } else {
          applyZoom(newScale, g.baseOffset, false);
        }
      } else if (g.isPanning && !g.isPinching && e.touches.length === 1) {
        const touch = e.touches[0];
        const dx = touch.clientX - g.panStart.x;
        const dy = touch.clientY - g.panStart.y;

        if (scaleRef.current > 1) {
          // Pan the image
          applyZoom(scaleRef.current, {
            x: g.baseOffset.x + dx,
            y: g.baseOffset.y + dy,
          });
        }
        // When scale === 1, swipe is handled in touchEnd
      }
    },
    [applyZoom],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const g = gestureRef.current;

      if (e.changedTouches.length === 1 && e.touches.length === 0) {
        const touch = e.changedTouches[0];
        const now = Date.now();
        const timeSinceLast = now - g.lastTapTime;
        const dx = touch.clientX - g.lastTapX;
        const dy = touch.clientY - g.lastTapY;
        const distSinceLast = Math.sqrt(dx * dx + dy * dy);

        // Double-tap: second tap landed close and quickly after the first
        if (timeSinceLast < DOUBLE_TAP_MS && distSinceLast < 30 && g.lastTapTime > 0) {
          g.lastTapTime = 0;
          if (scaleRef.current > 1) {
            applyZoom(1, { x: 0, y: 0 }, true);
          } else {
            // Zoom toward tap point
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
              const cx = touch.clientX - rect.left - rect.width / 2;
              const cy = touch.clientY - rect.top - rect.height / 2;
              const s = ZOOM_TOGGLE_SCALE;
              applyZoom(s, { x: cx * (1 - s), y: cy * (1 - s) }, true);
            } else {
              applyZoom(ZOOM_TOGGLE_SCALE, { x: 0, y: 0 }, true);
            }
          }
          g.isPanning = false;
          g.isPinching = false;
          return;
        }

        // Swipe navigation when not zoomed
        if (scaleRef.current <= 1 && g.isPanning) {
          const swipeDx = touch.clientX - g.swipeStartX;
          if (swipeDx < -SWIPE_THRESHOLD_PX) {
            goNext();
          } else if (swipeDx > SWIPE_THRESHOLD_PX) {
            goPrev();
          }
        }
      }

      g.isPinching = false;
      g.isPanning = false;
    },
    [applyZoom, goNext, goPrev],
  );

  // ─── Backdrop click ────────────────────────────────────────────────────────
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (gestureRef.current.isPanning) return;
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < photos.length - 1;
  const hasMultiple = photos.length > 1;

  const imgTransform = `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${currentIndex + 1} of ${photos.length}`}
      tabIndex={-1}
      onClick={handleBackdropClick}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        aria-label="Close photo preview"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      {/* Main image container — touch events live here */}
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        style={{ touchAction: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        {objectUrls[currentIndex] && (
          <img
            ref={imgRef}
            src={objectUrls[currentIndex]}
            alt={`Photo ${currentIndex + 1} of ${photos.length}`}
            className="max-w-full max-h-full object-contain select-none"
            draggable={false}
            style={{
              transform: imgTransform,
              transition: isAnimating ? 'transform 0.2s ease-out' : 'none',
              cursor: scale > 1 ? 'grab' : 'default',
            }}
          />
        )}
      </div>

      {/* Prev button */}
      {canGoPrev && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          aria-label="Previous photo"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
      )}

      {/* Next button */}
      {canGoNext && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          aria-label="Next photo"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      )}

      {/* Dot indicators */}
      {hasMultiple && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {photos.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to photo ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
