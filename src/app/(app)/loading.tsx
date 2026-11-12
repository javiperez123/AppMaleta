export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse">
      <span className="sr-only">Cargando…</span>
      <div className="mb-3 h-4 w-24 rounded bg-paper-2" />
      <div className="mb-8 h-9 w-64 max-w-full rounded bg-paper-2" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] rounded-2xl bg-paper-2" />
        ))}
      </div>
    </div>
  );
}
