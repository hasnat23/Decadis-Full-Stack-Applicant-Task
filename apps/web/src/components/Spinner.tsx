export function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-gray-200 border-t-indigo-600" />
      <p className="mt-3 text-sm text-gray-400">Loading…</p>
    </div>
  );
}
