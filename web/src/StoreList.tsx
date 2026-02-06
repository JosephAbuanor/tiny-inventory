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
  if (loading) {
    return (
      <p className="text-slate-500 py-6 text-sm animate-pulse">Loading stores…</p>
    );
  }
  if (error)
    return (
      <div className="flex flex-wrap items-center gap-3 my-4 p-4 card rounded-xl">
        <p className="text-red-700 bg-red-50/90 px-3 py-2 rounded-lg text-sm border border-red-100">
          Error: {error}
        </p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-secondary text-sm py-1.5 px-3">
            Reload
          </button>
        )}
      </div>
    );
  if (stores.length === 0) {
    return (
      <p className="text-slate-500 py-8 text-center text-sm">No stores yet. Add one above.</p>
    );
  }

  return (
    <ul className="list-none p-0 m-0 space-y-3">
      {stores.map((s) => (
        <li
          key={s.id}
          className="flex items-center gap-2 card rounded-xl border-l-4 border-l-indigo-500 card-hover"
        >
          <button
            type="button"
            onClick={() => onSelectStore(s.id)}
            className="flex-1 text-left py-3.5 px-5 font-medium text-slate-800 hover:text-indigo-700 transition-colors"
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
            className="btn-danger mr-3 my-2"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
