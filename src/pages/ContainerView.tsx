import { useParams } from 'react-router-dom';

/**
 * Container view - View container contents
 * TODO: Implement in Phase 5.3
 */
export function ContainerView() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Container View</h1>
      <p className="text-gray-600">Container ID: {id}</p>
    </div>
  );
}
