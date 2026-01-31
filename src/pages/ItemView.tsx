import { useParams } from 'react-router-dom';

/**
 * Item view - View item details
 * TODO: Implement in Phase 5.3
 */
export function ItemView() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Item View</h1>
      <p className="text-gray-600">Item ID: {id}</p>
    </div>
  );
}
