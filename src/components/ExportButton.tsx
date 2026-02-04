import { useState } from 'react';
import { downloadExport } from '../utils/export';

/**
 * Button that triggers export of all inventory data to a JSON file.
 * Shows loading state during export and error state if export fails.
 */
export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      await downloadExport();
    } catch (err) {
      console.error('Export failed:', err);
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

   return (
     <div>
       <button
         onClick={handleExport}
         disabled={isExporting}
         className="flex items-center gap-2 w-full px-4 py-3 bg-surface border border-border rounded-lg shadow-sm hover:bg-surface-tertiary dark:hover:bg-surface-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
         aria-label="Export data"
       >
         {isExporting ? (
           // Loading spinner
           <svg
             className="w-5 h-5 text-content-secondary animate-spin"
             xmlns="http://www.w3.org/2000/svg"
             fill="none"
             viewBox="0 0 24 24"
           >
             <circle
               className="opacity-25"
               cx="12"
               cy="12"
               r="10"
               stroke="currentColor"
               strokeWidth="4"
             />
             <path
               className="opacity-75"
               fill="currentColor"
               d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
             />
           </svg>
         ) : (
           // Download icon
           <svg
             xmlns="http://www.w3.org/2000/svg"
             fill="none"
             viewBox="0 0 24 24"
             strokeWidth={2}
             stroke="currentColor"
             className="w-5 h-5 text-content-secondary"
           >
             <path
               strokeLinecap="round"
               strokeLinejoin="round"
               d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
             />
           </svg>
         )}
         <span className="text-content font-medium">
           {isExporting ? 'Exporting...' : 'Export Data'}
         </span>
       </button>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
