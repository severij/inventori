import { useState, useEffect } from 'react';

interface UseOfflineResult {
  isOffline: boolean;
}

/**
 * Hook to track online/offline status.
 * Uses navigator.onLine and listens to online/offline events.
 */
export function useOffline(): UseOfflineResult {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOffline };
}
