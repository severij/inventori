import { useParams } from 'react-router-dom';

/**
 * Location view - View location contents
 * TODO: Implement in Phase 5.3
 */
export function LocationView() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Location View</h1>
      <p className="text-gray-600">Location ID: {id}</p>
    </div>
  );
}
