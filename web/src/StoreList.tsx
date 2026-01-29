import type { Store } from "./types";

interface Props {
  stores: Store[];
  loading: boolean;
  error: string | null;
  onSelectStore: (storeId: string) => void;
  onDeleteStore: (storeId: string, storeName: string) => void;
}

export default function StoreList({ stores, loading, error, onSelectStore, onDeleteStore }: Props) {
  if (loading) return <p className="loading">Loading stores…</p>;
  if (error) return <p className="error">Error: {error}</p>;
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
