import { useCallback, useEffect, useState } from "react";
import {
  createStore,
  deleteProduct,
  deleteStore,
  fetchCategories,
  fetchProducts,
  fetchStores,
  fetchStoreSummaries,
} from "./api";
import type { Product, Store, StoreSummary } from "./types";
import ProductForm from "./ProductForm";
import ProductList from "./ProductList";
import StoreList from "./StoreList";
import StoreSummaries from "./StoreSummaries";

type View = "stores" | "products" | "product-form";

export default function App() {
  const [view, setView] = useState<View>("stores");
  const [stores, setStores] = useState<Store[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [storesError, setStoresError] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<StoreSummary[]>([]);
  const [summariesLoading, setSummariesLoading] = useState(false);
  const [summariesError, setSummariesError] = useState<string | null>(null);

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsTotal, setProductsTotal] = useState(0);
  const [productsPage, setProductsPage] = useState(1);
  const [productsLimit] = useState(10);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  const [newStoreName, setNewStoreName] = useState("");
  const [storeFormError, setStoreFormError] = useState<string | null>(null);

  const loadStores = useCallback(async () => {
    setStoresLoading(true);
    setStoresError(null);
    try {
      const data = await fetchStores();
      setStores(data);
    } catch (e) {
      setStoresError(e instanceof Error ? e.message : "Failed to load stores");
    } finally {
      setStoresLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const loadSummaries = useCallback(async () => {
    setSummariesLoading(true);
    setSummariesError(null);
    try {
      const data = await fetchStoreSummaries();
      setSummaries(data);
    } catch (e) {
      setSummariesError(e instanceof Error ? e.message : "Failed to load summaries");
    } finally {
      setSummariesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === "stores") loadSummaries();
  }, [view, loadSummaries]);

  const loadCategories = useCallback(async (storeId: string) => {
    try {
      const data = await fetchCategories(storeId);
      setCategories(data);
    } catch {
      setCategories([]);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    if (!selectedStoreId) return;
    setProductsLoading(true);
    setProductsError(null);
    try {
      const res = await fetchProducts({
        storeId: selectedStoreId,
        category: categoryFilter || undefined,
        lowStock: lowStockOnly || undefined,
        page: productsPage,
        limit: productsLimit,
      });
      setProducts(res.data);
      setProductsTotal(res.total);
    } catch (e) {
      setProductsError(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setProductsLoading(false);
    }
  }, [selectedStoreId, categoryFilter, lowStockOnly, productsPage, productsLimit]);

  useEffect(() => {
    if (view === "products" && selectedStoreId) {
      loadCategories(selectedStoreId);
      loadProducts();
    }
  }, [view, selectedStoreId, loadCategories, loadProducts]);

  const handleSelectStore = (storeId: string) => {
    setSelectedStoreId(storeId);
    setProductsPage(1);
    setView("products");
  };

  const handleBackToStores = () => {
    setView("stores");
    setSelectedStoreId(null);
    setSelectedProductId(null);
  };

  const handleSelectProduct = (id: string) => {
    setSelectedProductId(id);
    setFormMode("edit");
    setView("product-form");
  };

  const handleAddProduct = () => {
    setSelectedProductId(null);
    setFormMode("create");
    setView("product-form");
  };

  const handleFormDone = () => {
    setView("products");
    setSelectedProductId(null);
    if (selectedStoreId) loadCategories(selectedStoreId);
    loadProducts();
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      if (selectedStoreId) loadCategories(selectedStoreId);
      loadProducts();
    } catch (e) {
      setProductsError(e instanceof Error ? e.message : "Failed to delete product");
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newStoreName.trim();
    if (!name) {
      setStoreFormError("Name is required");
      return;
    }
    setStoreFormError(null);
    try {
      await createStore({ name });
      setNewStoreName("");
      loadStores();
      if (view === "stores") loadSummaries();
    } catch (e) {
      setStoreFormError(e instanceof Error ? e.message : "Failed to create store");
    }
  };

  const handleDeleteStore = async (storeId: string, storeName: string) => {
    const confirmed = window.confirm(
      `Delete store "${storeName}"? This will permanently delete the store and all products in it.`
    );
    if (!confirmed) return;
    try {
      await deleteStore(storeId);
      if (selectedStoreId === storeId) {
        setView("stores");
        setSelectedStoreId(null);
        setSelectedProductId(null);
      }
      loadStores();
      loadSummaries();
    } catch (e) {
      setStoresError(e instanceof Error ? e.message : "Failed to delete store");
    }
  };

  const selectedStoreName = selectedStoreId
    ? stores.find((s) => s.id === selectedStoreId)?.name ?? "Store"
    : "";

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-slate-800 mb-1">Tiny Inventory</h1>

      {view === "stores" && (
        <>
          <p className="text-slate-600 mb-6">Select a store to view and manage products.</p>
          <StoreSummaries
            summaries={summaries}
            loading={summariesLoading}
            error={summariesError}
            onRetry={loadSummaries}
          />
          <section className="mb-6" aria-label="Add store">
            <form onSubmit={handleCreateStore} className="flex flex-wrap items-end gap-3">
              <label htmlFor="new-store-name" className="flex flex-col gap-1 font-medium text-slate-700">
                New store name
              </label>
              <input
                id="new-store-name"
                type="text"
                value={newStoreName}
                onChange={(e) => {
                  setNewStoreName(e.target.value);
                  setStoreFormError(null);
                }}
                placeholder="Store name"
                minLength={1}
                required
                aria-invalid={!!storeFormError}
                aria-describedby={storeFormError ? "store-form-error" : undefined}
                className="border border-slate-300 rounded-md px-3 py-2 min-w-[200px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <button
                type="submit"
                disabled={!newStoreName.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Add store
              </button>
            </form>
            {storeFormError && (
              <div className="flex flex-wrap items-center gap-3 mt-3" role="alert">
                <p id="store-form-error" className="text-red-700 bg-red-50 px-3 py-2 rounded-md text-sm">
                  {storeFormError}
                </p>
                <button
                  type="button"
                  onClick={() => setStoreFormError(null)}
                  className="border border-slate-300 rounded-md px-3 py-1.5 text-sm hover:bg-slate-50"
                >
                  Try again
                </button>
              </div>
            )}
          </section>
          <StoreList
            stores={stores}
            loading={storesLoading}
            error={storesError}
            onSelectStore={handleSelectStore}
            onDeleteStore={handleDeleteStore}
            onRetry={loadStores}
          />
        </>
      )}

      {view === "products" && selectedStoreId && (
        <ProductList
          products={products}
          total={productsTotal}
          page={productsPage}
          limit={productsLimit}
          loading={productsLoading}
          error={productsError}
          storeName={selectedStoreName}
          categories={categories}
          categoryFilter={categoryFilter}
          lowStockOnly={lowStockOnly}
          onCategoryChange={(v) => {
            setCategoryFilter(v);
            setProductsPage(1);
          }}
          onLowStockChange={(v) => {
            setLowStockOnly(v);
            setProductsPage(1);
          }}
          onPageChange={setProductsPage}
          onBack={handleBackToStores}
          onSelectProduct={handleSelectProduct}
          onDeleteProduct={handleDeleteProduct}
          onAddProduct={handleAddProduct}
        />
      )}

      {view === "product-form" && selectedStoreId && (
        <ProductForm
          storeId={selectedStoreId}
          productId={selectedProductId}
          mode={formMode}
          onDone={handleFormDone}
          onBack={() => setView("products")}
        />
      )}
    </div>
  );
}

