import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/format';
import { useSettings } from '../contexts/SettingsContext';

interface StatsBarProps {
  itemCount: number;
  totalValue: number;
  isLoading: boolean;
}

/**
 * Compact horizontal stats bar for Home page
 * Shows total item count and total value side-by-side
 * Display-only (not clickable)
 */
export function StatsBar({ itemCount, totalValue, isLoading }: StatsBarProps) {
  const { t } = useTranslation();
  const { settings } = useSettings();

  if (isLoading) {
    return (
      <div className="bg-surface rounded-lg border border-border p-3 mb-4 animate-pulse">
        <div className="flex items-center justify-around gap-4">
          <div className="flex-1 text-center">
            <div className="h-4 bg-surface-secondary rounded w-16 mx-auto mb-1"></div>
            <div className="h-5 bg-surface-secondary rounded w-20 mx-auto"></div>
          </div>
          <div className="w-px h-10 bg-border"></div>
          <div className="flex-1 text-center">
            <div className="h-4 bg-surface-secondary rounded w-16 mx-auto mb-1"></div>
            <div className="h-5 bg-surface-secondary rounded w-24 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-border p-3 mb-4">
      <div className="flex items-center justify-around gap-4">
        {/* Item Count */}
        <div className="flex-1 text-center">
          <div className="text-xs text-content-secondary mb-0.5">
            {t('stats.totalItems')}
          </div>
          <div className="text-lg font-semibold text-content">
            {itemCount.toLocaleString()}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-border"></div>

        {/* Total Value */}
        <div className="flex-1 text-center">
          <div className="text-xs text-content-secondary mb-0.5">
            {t('stats.totalValue')}
          </div>
          <div className="text-lg font-semibold text-content">
            {formatCurrency(totalValue, settings.currency, settings.language)}
          </div>
        </div>
      </div>
    </div>
  );
}
