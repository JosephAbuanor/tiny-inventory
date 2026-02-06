import type { Store } from "./types";

interface Props {
  stores: Store[];
  loading: boolean;
  error: string | null;
  onSelectStore: (storeId: string) => void;
  onDeleteStore: (storeId: string, storeName: string) => void;
  onRetry?: () => void;
}

export default function StoreList({ stores, loading, error, onSelectStore, onDeleteStore, onRetry }: Props) {
  if (loading) return <p className="text-slate-600 py-4">Loading stores…</p>;
  if (error)
    return (
      <div className="flex flex-wrap items-center gap-3 my-4">
        <p className="text-red-700 bg-red-50 px-3 py-2 rounded-md text-sm">Error: {error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="border border-slate-300 rounded-md px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Reload
          </button>
        )}
      </div>
    );
  if (stores.length === 0) return <p className="text-slate-600 py-4">No stores.</p>;

  return (
    <ul className="list-none p-0 m-0 space-y-2">
      {stores.map((s) => (
        <li key={s.id} className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition">
          <button
            type="button"
            onClick={() => onSelectStore(s.id)}
            className="flex-1 text-left py-3 px-4 font-medium text-slate-800"
          >
            {s.name}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteStore(s.id, s.name);
            }}
            title="Delete store"
            aria-label={`Delete ${s.name}`}
            className="text-red-600 border border-red-300 rounded-md px-3 py-1.5 text-sm hover:bg-red-50 mx-2 mb-2 mt-2"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
