export function ActionBadge({ action }: { action: string }) {
  const colorMap: Record<string, string> = {
    'create-item': 'bg-green-100 text-green-800',
    'delete-item': 'bg-red-100 text-red-800',
    'view-item': 'bg-blue-100 text-blue-800',
    'move-item': 'bg-yellow-100 text-yellow-800',
  };

  const colors = colorMap[action] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors}`}>
      {action}
    </span>
  );
}
