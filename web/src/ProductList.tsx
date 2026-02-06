import type { Product } from "./types";

interface Props {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
  storeName: string;
  categories: string[];
  categoryFilter: string;
  lowStockOnly: boolean;
  onCategoryChange: (v: string) => void;
  onLowStockChange: (v: boolean) => void;
  onPageChange: (page: number) => void;
  onBack: () => void;
  onSelectProduct: (id: string) => void;
  onDeleteProduct: (id: string) => void;
  onAddProduct: () => void;
  onRetry?: () => void;
}

export default function ProductList({
  products,
  total,
  page,
  limit,
  loading,
  error,
  storeName,
  categories,
  categoryFilter,
  lowStockOnly,
  onCategoryChange,
  onLowStockChange,
  onPageChange,
  onBack,
  onSelectProduct,
  onDeleteProduct,
  onAddProduct,
  onRetry,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (loading) {
    return (
      <p className="text-slate-500 py-6 text-sm animate-pulse">Loading products…</p>
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

  return (
    <div>
      <div className="mb-6">
        <button
          type="button"
          onClick={onBack}
          className="text-indigo-600 hover:text-indigo-700 font-medium mb-3 text-sm transition-colors"
        >
          ← Back to stores
        </button>
        <h2 className="font-display text-2xl font-semibold text-slate-900 tracking-tight mb-4">
          {storeName}
        </h2>
        <div className="flex flex-wrap items-center gap-4 mb-4 p-4 card rounded-xl">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            Category
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              aria-label="Filter by category"
              className="input-premium min-w-[140px] py-2"
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => onLowStockChange(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Low stock only
          </label>
        </div>
        <button type="button" onClick={onAddProduct} className="btn-primary">
          Add product
        </button>
      </div>
      {products.length === 0 ? (
        <p className="text-slate-500 py-10 text-center text-sm card rounded-xl">No products yet.</p>
      ) : (
        <>
          <div className="card overflow-hidden rounded-xl my-6">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-5 py-3.5 text-left bg-slate-50/90 font-semibold text-slate-700 text-sm border-b border-slate-200">
                    Name
                  </th>
                  <th className="px-5 py-3.5 text-left bg-slate-50/90 font-semibold text-slate-700 text-sm border-b border-slate-200">
                    Category
                  </th>
                  <th className="px-5 py-3.5 text-left bg-slate-50/90 font-semibold text-slate-700 text-sm border-b border-slate-200">
                    Price
                  </th>
                  <th className="px-5 py-3.5 text-left bg-slate-50/90 font-semibold text-slate-700 text-sm border-b border-slate-200">
                    Stock
                  </th>
                  <th className="px-5 py-3.5 text-left bg-slate-50/90 font-semibold text-slate-700 text-sm border-b border-slate-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors ${
                      i % 2 === 1 ? "bg-slate-50/30" : "bg-white"
                    }`}
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-800">{p.name}</td>
                    <td className="px-5 py-3.5 text-slate-600">{p.category}</td>
                    <td className="px-5 py-3.5 text-slate-600 tabular-nums">${p.price.toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-slate-600">{p.quantityInStock}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectProduct(p.id)}
                          className="btn-secondary text-sm py-1.5 px-2.5"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete "${p.name}"?`)) onDeleteProduct(p.id);
                          }}
                          className="btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center gap-4 my-6 p-3 rounded-xl bg-white/60 border border-slate-200/80">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              Previous
            </button>
            <span className="text-slate-600 text-sm">
              Page {page} of {totalPages} <span className="text-slate-400">({total} total)</span>
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              Next
            </button>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors"
          >
            ← Back to stores
          </button>
        </>
      )}
    </div>
  );
}
