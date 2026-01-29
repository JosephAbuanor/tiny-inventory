import type { Store } from "./types";

interface Props {
  stores: Store[];
  loading: boolean;
  error: string | null;
  onSelectStore: (storeId: string) => void;
}

export default function StoreList({ stores, loading, error, onSelectStore }: Props) {
  if (loading) return <p className="loading">Loading stores…</p>;
  if (error) return <p className="error">Error: {error}</p>;
  if (stores.length === 0) return <p className="empty">No stores.</p>;

  return (
    <ul className="store-list">
      {stores.map((s) => (
        <li key={s.id}>
          <button type="button" onClick={() => onSelectStore(s.id)}>
            {s.name}
          </button>
        </li>
      ))}
    </ul>
  );
}
