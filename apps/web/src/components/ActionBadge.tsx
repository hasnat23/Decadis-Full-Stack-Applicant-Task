const config: Record<string, { bg: string; icon: string }> = {
  'create-item': { bg: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', icon: '＋' },
  'delete-item': { bg: 'bg-red-50 text-red-700 ring-red-600/20', icon: '✕' },
  'view-item': { bg: 'bg-sky-50 text-sky-700 ring-sky-600/20', icon: '👁' },
  'move-item': { bg: 'bg-amber-50 text-amber-700 ring-amber-600/20', icon: '↗' },
};

export function ActionBadge({ action }: { action: string }) {
  const { bg, icon } = config[action] ?? {
    bg: 'bg-gray-50 text-gray-700 ring-gray-600/20',
    icon: '•',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${bg}`}
    >
      <span className="text-[10px]">{icon}</span>
      {formatAction(action)}
    </span>
  );
}

function formatAction(action: string): string {
  return action
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
