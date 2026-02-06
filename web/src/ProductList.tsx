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

  if (loading) return <p className="text-slate-600 py-4">Loading products…</p>;
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

  const inputSelectClass =
    "border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none";

  return (
    <div>
      <div className="mb-4">
        <button
          type="button"
          onClick={onBack}
          className="text-indigo-600 hover:text-indigo-700 font-medium mb-2"
        >
          ← Back to stores
        </button>
        <h2 className="text-xl font-semibold text-slate-800 mt-2 mb-3">{storeName}</h2>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <label className="flex items-center gap-2 text-slate-700">
            Category
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              aria-label="Filter by category"
              className={inputSelectClass}
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => onLowStockChange(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            Low stock only
          </label>
        </div>
        <button
          type="button"
          onClick={onAddProduct}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium"
        >
          Add product
        </button>
      </div>
      {products.length === 0 ? (
        <p className="text-slate-600 py-4">No products.</p>
      ) : (
        <>
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200 my-4">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left bg-slate-50 font-semibold text-slate-700 border-b border-slate-200">Name</th>
                <th className="px-4 py-3 text-left bg-slate-50 font-semibold text-slate-700 border-b border-slate-200">Category</th>
                <th className="px-4 py-3 text-left bg-slate-50 font-semibold text-slate-700 border-b border-slate-200">Price</th>
                <th className="px-4 py-3 text-left bg-slate-50 font-semibold text-slate-700 border-b border-slate-200">Stock</th>
                <th className="px-4 py-3 text-left bg-slate-50 font-semibold text-slate-700 border-b border-slate-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-800">{p.name}</td>
                  <td className="px-4 py-3 text-slate-700">{p.category}</td>
                  <td className="px-4 py-3 text-slate-700">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-700">{p.quantityInStock}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectProduct(p.id)}
                        className="border border-slate-300 rounded px-2 py-1 text-sm hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete "${p.name}"?`)) onDeleteProduct(p.id);
                        }}
                        className="text-red-600 border border-red-300 rounded px-2 py-1 text-sm hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center gap-4 my-4">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="border border-slate-300 rounded-md px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-slate-600 text-sm">
              Page {page} of {totalPages} ({total} total)
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="border border-slate-300 rounded-md px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back to stores
          </button>
        </>
      )}
    </div>
  );
}
