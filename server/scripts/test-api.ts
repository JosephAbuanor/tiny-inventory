/**
 * Script to hit all API endpoints. Run with: pnpm test:api (server must be running).
 * BASE_URL defaults to http://localhost:4000
 */
const BASE = process.env.BASE_URL ?? "http://localhost:4000";

async function request(
  method: string,
  path: string,
  body?: unknown
): Promise<{ status: number; data: unknown }> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

async function test(
  name: string,
  fn: () => Promise<void>
): Promise<boolean> {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (e) {
    console.log(`  ✗ ${name}`);
    console.error("   ", e instanceof Error ? e.message : e);
    return false;
  }
}

async function main() {
  console.log("Testing API at", BASE, "\n");

  let passed = 0;
  let failed = 0;

  // --- Health ---
  const healthOk = await test("GET /health → 200, { ok: true }", async () => {
    const { status, data } = await request("GET", "/health");
    if (status !== 200) throw new Error(`status ${status}`);
    if (typeof data === "object" && data !== null && "ok" in data && (data as { ok: unknown }).ok !== true)
      throw new Error("missing ok: true");
  });
  healthOk ? passed++ : failed++;

  // --- Stores list ---
  const storesListOk = await test("GET /api/stores → 200, array", async () => {
    const { status, data } = await request("GET", "/api/stores");
    if (status !== 200) throw new Error(`status ${status}`);
    if (!Array.isArray(data)) throw new Error("response not array");
  });
  storesListOk ? passed++ : failed++;

  let storeId: string | null = null;
  if (storesListOk) {
    const { data } = await request("GET", "/api/stores");
    const stores = data as { id: string }[];
    if (stores.length > 0) storeId = stores[0].id;
  }

  // --- Store summaries ---
  const summariesOk = await test("GET /api/stores/summaries → 200, array", async () => {
    const { status, data } = await request("GET", "/api/stores/summaries");
    if (status !== 200) throw new Error(`status ${status}`);
    if (!Array.isArray(data)) throw new Error("response not array");
  });
  summariesOk ? passed++ : failed++;

  // --- Store by id (existing) ---
  if (storeId) {
    const getStoreOk = await test(`GET /api/stores/:id → 200 (id=${storeId.slice(0, 8)}…)`, async () => {
      const { status, data } = await request("GET", `/api/stores/${storeId}`);
      if (status !== 200) throw new Error(`status ${status}`);
      const s = data as { id?: string; name?: string; products?: unknown[] };
      if (s.id !== storeId) throw new Error("wrong store");
      if (!Array.isArray(s.products)) throw new Error("missing products");
    });
    getStoreOk ? passed++ : failed++;
  }

  // --- Store 404 ---
  const store404Ok = await test("GET /api/stores/:badId → 404", async () => {
    const { status } = await request("GET", "/api/stores/nonexistent-id-12345");
    if (status !== 404) throw new Error(`status ${status}, expected 404`);
  });
  store404Ok ? passed++ : failed++;

  // --- Create store ---
  let createdStoreId: string | null = null;
  const createStoreOk = await test("POST /api/stores → 201", async () => {
    const { status, data } = await request("POST", "/api/stores", { name: "API Test Store" });
    if (status !== 201) throw new Error(`status ${status}`);
    const s = data as { id: string };
    if (!s.id) throw new Error("no id");
    createdStoreId = s.id;
  });
  createStoreOk ? passed++ : failed++;

  // --- Update store ---
  if (createdStoreId) {
    const updateStoreOk = await test("PUT /api/stores/:id → 200", async () => {
      const { status, data } = await request("PUT", `/api/stores/${createdStoreId}`, {
        name: "API Test Store Updated",
      });
      if (status !== 200) throw new Error(`status ${status}`);
      const s = data as { name: string };
      if (s.name !== "API Test Store Updated") throw new Error("name not updated");
    });
    updateStoreOk ? passed++ : failed++;
  }

  // --- Products list ---
  const productsListOk = await test("GET /api/products → 200, { data, total, page, limit }", async () => {
    const { status, data } = await request("GET", "/api/products");
    if (status !== 200) throw new Error(`status ${status}`);
    const p = data as { data?: unknown[]; total?: number; page?: number; limit?: number };
    if (!Array.isArray(p.data)) throw new Error("missing data array");
    if (typeof p.total !== "number") throw new Error("missing total");
  });
  productsListOk ? passed++ : failed++;

  // --- Products with query ---
  const productsQueryOk = await test("GET /api/products?page=1&limit=2 → 200", async () => {
    const { status, data } = await request("GET", "/api/products?page=1&limit=2");
    if (status !== 200) throw new Error(`status ${status}`);
    const p = data as { data?: unknown[]; limit?: number };
    if (!Array.isArray(p.data)) throw new Error("missing data");
    if (p.limit !== 2) throw new Error("limit not 2");
  });
  productsQueryOk ? passed++ : failed++;

  let productId: string | null = null;
  const { data: productsResp } = await request("GET", "/api/products?limit=1");
  const productsPayload = productsResp as { data?: { id: string }[] };
  if (Array.isArray(productsPayload.data) && productsPayload.data.length > 0) {
    productId = productsPayload.data[0].id;
  }

  // --- Product by id ---
  if (productId) {
    const getProductOk = await test(`GET /api/products/:id → 200`, async () => {
      const { status, data } = await request("GET", `/api/products/${productId}`);
      if (status !== 200) throw new Error(`status ${status}`);
      const p = data as { id: string; store?: unknown };
      if (p.id !== productId) throw new Error("wrong product");
    });
    getProductOk ? passed++ : failed++;
  }

  // --- Product 404 ---
  const product404Ok = await test("GET /api/products/:badId → 404", async () => {
    const { status } = await request("GET", "/api/products/nonexistent-product-id-12345");
    if (status !== 404) throw new Error(`status ${status}, expected 404`);
  });
  product404Ok ? passed++ : failed++;

  // --- Create product (use created store or first store) ---
  const storeForProduct = createdStoreId ?? storeId;
  let createdProductId: string | null = null;
  if (storeForProduct) {
    const createProductOk = await test("POST /api/products → 201", async () => {
      const { status, data } = await request("POST", "/api/products", {
        storeId: storeForProduct,
        name: "API Test Product",
        category: "Test",
        price: 9.99,
        quantityInStock: 10,
      });
      if (status !== 201) throw new Error(`status ${status}`);
      const p = data as { id: string };
      if (!p.id) throw new Error("no id");
      createdProductId = p.id;
    });
    createProductOk ? passed++ : failed++;
  }

  // --- Update product ---
  if (createdProductId) {
    const updateProductOk = await test("PUT /api/products/:id → 200", async () => {
      const { status, data } = await request("PUT", `/api/products/${createdProductId}`, {
        name: "API Test Product Updated",
        quantityInStock: 5,
      });
      if (status !== 200) throw new Error(`status ${status}`);
      const p = data as { name: string; quantityInStock: number };
      if (p.name !== "API Test Product Updated") throw new Error("name not updated");
      if (p.quantityInStock !== 5) throw new Error("quantity not updated");
    });
    updateProductOk ? passed++ : failed++;
  }

  // --- Validation: POST store without name → 400 ---
  const storeValidationOk = await test("POST /api/stores (invalid) → 400", async () => {
    const { status } = await request("POST", "/api/stores", {});
    if (status !== 400) throw new Error(`status ${status}, expected 400`);
  });
  storeValidationOk ? passed++ : failed++;

  // --- Delete product (cleanup created product) ---
  if (createdProductId) {
    const deleteProductOk = await test("DELETE /api/products/:id → 204", async () => {
      const { status } = await request("DELETE", `/api/products/${createdProductId}`);
      if (status !== 204) throw new Error(`status ${status}`);
    });
    deleteProductOk ? passed++ : failed++;
  }

  // --- Delete store (cleanup created store) ---
  if (createdStoreId) {
    const deleteStoreOk = await test("DELETE /api/stores/:id → 204", async () => {
      const { status } = await request("DELETE", `/api/stores/${createdStoreId}`);
      if (status !== 204) throw new Error(`status ${status}`);
    });
    deleteStoreOk ? passed++ : failed++;
  }

  console.log("\n---");
  console.log(`Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
