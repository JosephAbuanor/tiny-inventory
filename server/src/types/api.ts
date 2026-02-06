export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ErrorResponse {
  error: {
    message: string;
    details?: unknown;
  };
}

export interface ProductListQuery {
  storeId?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  lowStock?: "true" | "false";
  page?: string;
  limit?: string;
}

export interface CategoriesQuery {
  storeId?: string;
}

/** Route params for resource-by-id routes (GET/PUT/DELETE /:id). */
export interface IdParams {
  id: string;
}

/** Raw row shape from store summaries SQL. */
export interface StoreSummaryRow {
  storeId: string;
  storeName: string;
  productCount: bigint;
  totalValue: number;
  lowStockCount: bigint;
}

/** Public API shape for a store inventory summary. */
export interface StoreSummary {
  storeId: string;
  storeName: string;
  productCount: number;
  totalInventoryValue: number;
  lowStockCount: number;
}
