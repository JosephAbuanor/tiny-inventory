import { useCallback, useEffect, useState } from "react";
import { fetchCategories, fetchProducts, fetchStores } from "./api";
import type { Product, Store } from "./types";
import ProductForm from "./ProductForm";
import ProductList from "./ProductList";
import StoreList from "./StoreList";

type View = "stores" | "products" | "product-form";

export default function App() {
  const [view, setView] = useState<View>("stores");
  const [stores, setStores] = useState<Store[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [storesError, setStoresError] = useState<string | null>(null);

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

  const selectedStoreName = selectedStoreId
    ? stores.find((s) => s.id === selectedStoreId)?.name ?? "Store"
    : "";

  return (
    <div className="app">
      <h1>Tiny Inventory</h1>

      {view === "stores" && (
        <>
          <p>Select a store to view and manage products.</p>
          <StoreList
            stores={stores}
            loading={storesLoading}
            error={storesError}
            onSelectStore={handleSelectStore}
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

