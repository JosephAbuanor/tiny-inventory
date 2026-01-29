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
  onAddProduct: () => void;
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
  onAddProduct,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (loading) return <p className="loading">Loading products…</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="product-list">
      <div className="toolbar">
        <button type="button" onClick={onBack}>← Back to stores</button>
        <h2>{storeName}</h2>
        <div className="filters">
          <label>
            Category
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => onLowStockChange(e.target.checked)}
            />
            Low stock only
          </label>
        </div>
        <button type="button" onClick={onAddProduct}>Add product</button>
      </div>
      {products.length === 0 ? (
        <p className="empty">No products.</p>
      ) : (
        <>
          <table className="product-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>{p.quantityInStock}</td>
                  <td>
                    <button type="button" onClick={() => onSelectProduct(p.id)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </button>
            <span>Page {page} of {totalPages} ({total} total)</span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
