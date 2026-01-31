import { useParams } from 'react-router-dom';

/**
 * Edit Location page
 * TODO: Implement in Phase 5.3
 */
export function EditLocation() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Edit Location</h1>
      <p className="text-gray-600">Editing location: {id}</p>
    </div>
  );
}
