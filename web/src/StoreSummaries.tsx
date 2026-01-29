import type { StoreSummary } from "./types";

interface Props {
  summaries: StoreSummary[];
  loading: boolean;
  error: string | null;
}

export default function StoreSummaries({ summaries, loading, error }: Props) {
  if (loading) return <p className="loading">Loading inventory summary…</p>;
  if (error) return <p className="error">Error: {error}</p>;
  if (summaries.length === 0) return null;

  return (
    <section className="store-summaries" aria-label="Inventory summary by store">
      <h3>Inventory summary</h3>
      <table className="summary-table">
        <thead>
          <tr>
            <th>Store</th>
            <th>Products</th>
            <th>Total value</th>
            <th>Low stock item count</th>
          </tr>
        </thead>
        <tbody>
          {summaries.map((s) => (
            <tr key={s.storeId}>
              <td>{s.storeName}</td>
              <td>{s.productCount}</td>
              <td>${s.totalInventoryValue.toFixed(2)}</td>
              <td>{s.lowStockCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
