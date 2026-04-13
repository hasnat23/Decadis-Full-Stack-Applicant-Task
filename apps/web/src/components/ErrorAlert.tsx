export function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs text-red-600">
        !
      </span>
      <div>
        <p className="text-sm font-medium text-red-800">Something went wrong</p>
        <p className="mt-0.5 text-sm text-red-600">{message}</p>
      </div>
    </div>
  );
}
