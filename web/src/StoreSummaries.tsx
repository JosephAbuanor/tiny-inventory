import type { StoreSummary } from "./types";

interface Props {
  summaries: StoreSummary[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export default function StoreSummaries({ summaries, loading, error, onRetry }: Props) {
  if (loading) {
    return (
      <p className="text-slate-500 py-6 text-sm animate-pulse">Loading inventory summary…</p>
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
  if (summaries.length === 0) return null;

  return (
    <section className="mb-8" aria-label="Inventory summary by store">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
        Inventory summary
      </h3>
      <div className="card overflow-hidden rounded-xl max-w-xl">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-5 py-3.5 text-left bg-slate-50/90 font-semibold text-slate-700 text-sm border-b border-slate-200">
                Store
              </th>
              <th className="px-5 py-3.5 text-left bg-slate-50/90 font-semibold text-slate-700 text-sm border-b border-slate-200">
                Products
              </th>
              <th className="px-5 py-3.5 text-left bg-slate-50/90 font-semibold text-slate-700 text-sm border-b border-slate-200">
                Total value
              </th>
              <th className="px-5 py-3.5 text-left bg-slate-50/90 font-semibold text-slate-700 text-sm border-b border-slate-200">
                Low stock
              </th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((s, i) => (
              <tr
                key={s.storeId}
                className={`border-b border-slate-100 last:border-0 transition-colors ${
                  i % 2 === 1 ? "bg-slate-50/40" : "bg-white"
                }`}
              >
                <td className="px-5 py-3.5 font-medium text-slate-800">{s.storeName}</td>
                <td className="px-5 py-3.5 text-slate-600">{s.productCount}</td>
                <td className="px-5 py-3.5 text-slate-600 tabular-nums">
                  ${s.totalInventoryValue.toFixed(2)}
                </td>
                <td className="px-5 py-3.5 text-slate-600">{s.lowStockCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
