export interface Store {
  id: string;
  name: string;
  createdAt: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  category: string;
  price: number;
  quantityInStock: number;
  createdAt: string;
  store?: { id: string; name: string };
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface StoreSummary {
  storeId: string;
  storeName: string;
  productCount: number;
  totalInventoryValue: number;
  lowStockCount: number;
}
