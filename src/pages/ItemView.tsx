import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EntityCard } from '../components/EntityCard';
import { IdDisplay } from '../components/IdDisplay';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { OverflowMenu, type MenuItem } from '../components/OverflowMenu';
import { PhotoLightbox } from '../components/PhotoLightbox';
import { DetailSkeleton, CardListSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { StatsCard } from '../components/StatsCard';
import { useItem } from '../hooks/useItems';
import { useChildren } from '../hooks/useChildren';
import { useAncestors } from '../hooks/useAncestors';
import { useEntityStats } from '../hooks/useEntityStats';
import { deleteItem } from '../db/items';
import { useToast } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';
import { formatCurrency, formatDate as formatDateUtil } from '../utils/format';
import type { Item } from '../types';

/**
 * Get menu items for item overflow menu
 */
function getItemMenuItems(
  item: Item,
  navigate: ReturnType<typeof useNavigate>,
  setShowDeleteDialog: (show: boolean) => void,
  t: (key: string) => string
): MenuItem[] {
  return [
    {
      id: 'edit',
      label: t('common.edit'),
      icon: '✏️',
      onClick: () => navigate(`/edit/item/${item.id}`),
    },
    {
      id: 'duplicate',
      label: t('item.duplicate'),
      icon: '📋',
      onClick: () => navigate('/add/item', { state: { duplicateFrom: item } }),
    },
    {
      id: 'delete',
      label: t('common.delete'),
      icon: '🗑️',
      onClick: () => setShowDeleteDialog(true),
      destructive: true,
    },
  ];
}

/**
 * Item view - View item details
 * If item isContainer, also shows children and add buttons
 */
export function ItemView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { settings } = useSettings();
  const { t } = useTranslation();

  const { item, loading: itemLoading, error, refetch } = useItem(id);
  const { children, loading: childrenLoading } = useChildren(id, 'item');
  const { ancestors } = useAncestors(id, 'item');
  const stats = useEntityStats(id || '', 'item');

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [destinationId, setDestinationId] = useState<string>('');
  const [destinationType, setDestinationType] = useState<'location' | 'item' | undefined>(undefined);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  // Create object URLs for photos on mount, revoke on unmount
  useEffect(() => {
    if (!item?.photos || item.photos.length === 0) {
      setPhotoUrls([]);
      return;
    }

    const urls = item.photos.map((photo) => URL.createObjectURL(photo));
    setPhotoUrls(urls);

    return () => {
      // Cleanup: revoke all object URLs when component unmounts
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [item?.id]); // Depends on item ID, not photos array

  const loading = itemLoading || (item?.canHoldItems && childrenLoading);
  const hasChildren = children.length > 0;
  const isContainer = item?.canHoldItems === true;

  const handleDelete = async (choice?: string, dest?: { id: string; type?: 'location' | 'item' }) => {
    if (!item) return;

    setIsDeleting(true);
    try {
      // choice is 'cascade' or 'move' (or undefined for simple delete)
      const shouldCascade = choice === 'cascade';
      // Use the destination passed from dialog (which comes from locationPicker state)
      await deleteItem(item.id, shouldCascade, dest?.id, dest?.type);
      showToast('success', t('item.deleted', { name: item.name || t('common.unnamedItem') }));
      // Navigate to parent or home
      if (item.parentId && item.parentType) {
        navigate(`/${item.parentType}/${item.parentId}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
      showToast('error', 'Failed to delete item. Please try again.');
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDestinationChange = (parentId: string, parentType?: 'location' | 'item') => {
    setDestinationId(parentId);
    setDestinationType(parentType);
  };

  /**
   * Navigate to parent in hierarchy:
   * - If has parent item → Go to parent item
   * - If has parent location → Go to parent location
   * - If unassigned → Go to Home
   */
  const handleBack = () => {
    if (item?.parentId && item?.parentType) {
      navigate(`/${item.parentType}/${item.parentId}`);
    } else {
      navigate('/');
    }
  };

  // Format date using settings
  const formatDate = (date: Date) => {
    return formatDateUtil(date, settings.dateFormat, settings.language);
  };

  // Check if should show Additional Information section
  const hasAdditionalInfo = item && (
    (item.purchasePrice !== null && item.purchasePrice !== undefined && item.purchasePrice > 0) ||
    (item.currentValue !== null && item.currentValue !== undefined && item.currentValue > 0) ||
    (item.dateAcquired && new Date(item.dateAcquired).getTime() !== 0) ||
    !item.includeInTotal
  );

  return (
    <Layout title={item?.name || t('common.unnamedItem')} onBack={handleBack}>
      {/* Loading state */}
      {loading && <DetailSkeleton />}

       {/* Error state */}
       {error && (
         <ErrorState
           message={error.message || t('item.failedToLoad')}
           onRetry={refetch}
         />
       )}

       {/* Not found state */}
       {!loading && !error && !item && (
         <EmptyState
           icon="🔍"
           title={t('item.notFound')}
           description="This item may have been deleted or the link is invalid."
           action={{ label: t('errors.goHome'), to: '/' }}
         />
       )}

      {/* Item content */}
      {!loading && item && (
        <>
          {/* Breadcrumbs */}
          <Breadcrumbs ancestors={ancestors} />

          {/* Photo gallery */}
          {item.photos.length > 0 && (
            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
           {item.photos.map((_, index) => (
                   <img
                     key={index}
                     src={photoUrls[index]}
                     alt={`${item.name || t('common.unnamedItem')} photo ${index + 1}`}
                     className="w-48 h-48 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                     onClick={() => setLightboxIndex(index)}
                   />
                ))}
              </div>
            </div>
          )}

           {/* Item details */}
           <div className="bg-surface rounded-lg shadow-sm border border-border p-4 mb-6">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <h2 className="text-xl font-semibold text-content">{item.name || t('common.unnamedItem')}</h2>
                  {item.quantity > 1 && (
                    <span className="bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 text-sm font-medium px-2 py-1 rounded">
                      x{item.quantity}
                    </span>
                  )}
                </div>
                <OverflowMenu
                  items={getItemMenuItems(item, navigate, setShowDeleteDialog, t)}
                />
              </div>
             <IdDisplay id={item.id} size="sm" />

             {item.description && (
               <p className="text-content-secondary mt-2">{item.description}</p>
             )}
           </div>

           {/* Container Stats - Only shown for containers */}
           {isContainer && (
             <StatsCard
               itemCount={stats.itemCount}
               totalValue={stats.totalValue}
               isLoading={stats.isLoading}
             />
           )}

           {/* Tags */}
           {item.tags && item.tags.length > 0 && (
             <div className="mb-6">
               <div className="flex flex-wrap gap-2">
                 {item.tags.map((tag) => (
                   <Link
                     key={tag}
                      to={`/search?tags=${encodeURIComponent(tag)}`}
                     className="inline-block px-3 py-1 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-full text-sm font-medium hover:bg-accent-200 dark:hover:bg-accent-900/50 transition-colors"
                   >
                     {tag}
                   </Link>
                 ))}
               </div>
             </div>
           )}

            {/* Additional Information */}
            {hasAdditionalInfo && (
              <CollapsibleSection title={t('item.additionalInformation')} defaultOpen={false}>
                <div className="space-y-3">
                  {item.purchasePrice !== null && item.purchasePrice !== undefined && item.purchasePrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-content-secondary">{t('item.purchasePrice')}</span>
                      <span className="text-content font-medium">
                        {formatCurrency(item.purchasePrice, settings.currency, settings.language)}
                      </span>
                    </div>
                  )}
                  {item.currentValue !== null && item.currentValue !== undefined && item.currentValue > 0 && (
                    <div className="flex justify-between">
                      <span className="text-content-secondary">{t('item.currentValue')}</span>
                      <span className="text-content font-medium">
                        {formatCurrency(item.currentValue, settings.currency, settings.language)}
                      </span>
                    </div>
                  )}
                  {item.dateAcquired && new Date(item.dateAcquired).getTime() !== 0 && (
                    <div className="flex justify-between">
                      <span className="text-content-secondary">{t('item.dateAcquired')}</span>
                      <span className="text-content font-medium">{formatDate(item.dateAcquired)}</span>
                    </div>
                  )}
                  {!item.includeInTotal && (
                    <div className="flex justify-between">
                      <span className="text-content-secondary">{t('item.includeInTotals')}</span>
                      <span className="text-content font-medium">No</span>
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            )}

            {/* Container Contents - only shown for items with canHoldItems */}
            {item.canHoldItems && (
              <>
                 {/* Add button */}
                 <Link
                   to={`/add/item?parentId=${item.id}&parentType=item`}
                   className="block mb-4 text-center px-4 py-2 bg-accent-100 dark:bg-surface-tertiary text-accent-600 dark:text-accent-400 border border-accent-300 dark:border-accent-600/50 rounded-lg hover:bg-accent-200 dark:hover:bg-surface-secondary transition-colors font-medium min-h-[44px] flex items-center justify-center"
                 >
                   + {t('item.addItem')}
                 </Link>

                 {/* Contents list */}
                 {childrenLoading ? (
                   <CardListSkeleton count={2} />
                 ) : hasChildren ? (
                   <CollapsibleSection title={t('item.contents')} defaultOpen={true}>
                     <div className="space-y-3">
                       {children.map((child) => (
                         <EntityCard key={child.id} entity={child} entityType="item" />
                       ))}
                     </div>
                   </CollapsibleSection>
                 ) : (
                   <div className="text-center py-6 text-content-tertiary mb-6 bg-surface-tertiary/50 rounded-lg">
                     <p className="font-medium">{t('item.containerEmpty')}</p>
                     <p className="text-sm mt-1">{t('item.containerEmptyDesc')}</p>
                   </div>
                 )}
              </>
            )}

           {/* Metadata */}
           <div className="text-xs text-content-muted space-y-1">
             <p>{t('common.created')}: {formatDate(item.createdAt)}</p>
             <p>{t('common.updated')}: {formatDate(item.updatedAt)}</p>
           </div>
        </>
      )}

        {/* Delete confirmation dialog */}
        {item && (
          <ConfirmDialog
            isOpen={showDeleteDialog}
            title={isContainer && hasChildren ? t('item.deleteWithContents') : t('item.deleteConfirm')}
            message={
              isContainer && hasChildren
                ? t('item.deleteWithContentsMessage', { count: children.length })
                : t('item.deleteConfirmMsg', { name: item.name || t('common.unnamedItem') })
            }
            confirmLabel={isDeleting ? t('common.deleting') : t('common.delete')}
            onConfirm={handleDelete}
            onCancel={() => {
              setShowDeleteDialog(false);
              setDestinationId('');
              setDestinationType(undefined);
            }}
            isDestructive
            confirmDisabled={isDeleting}
            choices={
              isContainer && hasChildren
                ? [
                    {
                      value: 'move',
                      label: t('item.deleteChoice_move'),
                      description: t('item.deleteChoice_move_desc'),
                    },
                    {
                      value: 'cascade',
                      label: t('item.deleteChoice_cascade'),
                      description: t('item.deleteChoice_cascade_desc'),
                    },
                  ]
                : undefined
            }
            defaultChoice="move"
            locationPicker={
              isContainer && hasChildren
                ? {
                    value: destinationId,
                    parentType: destinationType,
                    onChange: handleDestinationChange,
                    excludeItemId: item.id,
                  }
                : undefined
            }
          />
        )}

      {/* Photo lightbox overlay */}
      {lightboxIndex !== null && item && (
        <PhotoLightbox
          photos={item.photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </Layout>
  );
}
