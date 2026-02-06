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
  if (loading) return <p className="loading">Loading stores…</p>;
  if (error)
    return (
      <div className="error-block">
        <p className="error">Error: {error}</p>
        {onRetry && (
          <button type="button" onClick={onRetry}>
            Reload
          </button>
        )}
      </div>
    );
  if (stores.length === 0) return <p className="empty">No stores.</p>;

  return (
    <ul className="store-list">
      {stores.map((s) => (
        <li key={s.id} className="store-list-item">
          <button type="button" onClick={() => onSelectStore(s.id)}>
            {s.name}
          </button>
          <button
            type="button"
            className="store-delete"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteStore(s.id, s.name);
            }}
            title="Delete store"
            aria-label={`Delete ${s.name}`}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
