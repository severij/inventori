import { useParams } from 'react-router-dom';

/**
 * Edit Item page
 * TODO: Implement in Phase 5.3
 */
export function EditItem() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Edit Item</h1>
      <p className="text-gray-600">Editing item: {id}</p>
    </div>
  );
}
