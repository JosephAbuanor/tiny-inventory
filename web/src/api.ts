import type { Product, ProductListResponse, Store, StoreSummary } from "./types";

const API = "/api";

interface ErrorBody {
  error?: { message?: string; details?: unknown } | string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as ErrorBody;
    const err = body.error;
    const message =
      typeof err === "object" && err?.message ? err.message : typeof err === "string" ? err : res.statusText;
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function fetchStores(): Promise<Store[]> {
  const res = await fetch(`${API}/stores`);
  return handleResponse<Store[]>(res);
}

export async function fetchStoreSummaries(): Promise<StoreSummary[]> {
  const res = await fetch(`${API}/stores/summaries`);
  return handleResponse<StoreSummary[]>(res);
}

export interface ProductListParams {
  storeId?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export async function fetchCategories(storeId?: string): Promise<string[]> {
  const q = new URLSearchParams();
  if (storeId) q.set("storeId", storeId);
  const res = await fetch(`${API}/products/categories?${q}`);
  return handleResponse<string[]>(res);
}

export async function fetchProducts(params: ProductListParams = {}): Promise<ProductListResponse> {
  const q = new URLSearchParams();
  if (params.storeId) q.set("storeId", params.storeId);
  if (params.category) q.set("category", params.category);
  if (params.minPrice != null) q.set("minPrice", String(params.minPrice));
  if (params.maxPrice != null) q.set("maxPrice", String(params.maxPrice));
  if (params.lowStock) q.set("lowStock", "true");
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  const res = await fetch(`${API}/products?${q}`);
  return handleResponse<ProductListResponse>(res);
}

export async function fetchProduct(id: string): Promise<Product> {
  const res = await fetch(`${API}/products/${id}`);
  return handleResponse<Product>(res);
}

export async function createProduct(body: CreateProductBody): Promise<Product> {
  const res = await fetch(`${API}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<Product>(res);
}

export async function updateProduct(id: string, body: Partial<CreateProductBody>): Promise<Product> {
  const res = await fetch(`${API}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<Product>(res);
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API}/products/${id}`, { method: "DELETE" });
  return handleResponse<void>(res);
}

export interface CreateProductBody {
  storeId: string;
  name: string;
  category: string;
  price: number;
  quantityInStock: number;
}
