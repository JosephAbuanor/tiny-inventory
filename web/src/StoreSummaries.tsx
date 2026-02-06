import type { StoreSummary } from "./types";

interface Props {
  summaries: StoreSummary[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export default function StoreSummaries({ summaries, loading, error, onRetry }: Props) {
  if (loading) return <p className="text-slate-600 py-4">Loading inventory summary…</p>;
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
  if (summaries.length === 0) return null;

  return (
    <section className="mb-6" aria-label="Inventory summary by store">
      <h3 className="text-lg font-semibold text-slate-800 mb-3">Inventory summary</h3>
      <table className="w-full max-w-xl border-collapse bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left bg-slate-50 font-semibold text-slate-700 border-b border-slate-200">Store</th>
            <th className="px-4 py-3 text-left bg-slate-50 font-semibold text-slate-700 border-b border-slate-200">Products</th>
            <th className="px-4 py-3 text-left bg-slate-50 font-semibold text-slate-700 border-b border-slate-200">Total value</th>
            <th className="px-4 py-3 text-left bg-slate-50 font-semibold text-slate-700 border-b border-slate-200">Low stock item count</th>
          </tr>
        </thead>
        <tbody>
          {summaries.map((s) => (
            <tr key={s.storeId} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-3 text-slate-800">{s.storeName}</td>
              <td className="px-4 py-3 text-slate-700">{s.productCount}</td>
              <td className="px-4 py-3 text-slate-700">${s.totalInventoryValue.toFixed(2)}</td>
              <td className="px-4 py-3 text-slate-700">{s.lowStockCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
