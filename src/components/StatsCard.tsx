import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/format';
import { useSettings } from '../contexts/SettingsContext';

interface StatsCardProps {
  itemCount: number;
  totalValue: number;
  isLoading: boolean;
}

/**
 * Stats card for LocationView and ItemView
 * Shows item count and total value in a 2-column grid
 * Display-only (not clickable)
 */
export function StatsCard({ itemCount, totalValue, isLoading }: StatsCardProps) {
  const { t } = useTranslation();
  const { settings } = useSettings();

  if (isLoading) {
    return (
      <div className="bg-surface rounded-lg border border-border p-4 mb-4 animate-pulse">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="h-4 bg-surface-secondary rounded w-20 mb-2"></div>
            <div className="h-6 bg-surface-secondary rounded w-16"></div>
          </div>
          <div>
            <div className="h-4 bg-surface-secondary rounded w-20 mb-2"></div>
            <div className="h-6 bg-surface-secondary rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-border p-4 mb-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Item Count */}
        <div>
          <div className="text-sm text-content-secondary mb-1">
            {t('stats.totalItems')}
          </div>
          <div className="text-xl font-semibold text-content">
            {itemCount.toLocaleString()}
          </div>
        </div>

        {/* Total Value */}
        <div>
          <div className="text-sm text-content-secondary mb-1">
            {t('stats.totalValue')}
          </div>
          <div className="text-xl font-semibold text-content">
            {formatCurrency(totalValue, settings.currency, settings.language)}
          </div>
        </div>
      </div>
    </div>
  );
}
