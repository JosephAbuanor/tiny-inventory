import { Router } from "express";
import { z as zod } from "zod";
import { prisma } from "../lib/db.js";
import { NotFoundError, sendError } from "../lib/errors.js";
import type { IdParams, StoreSummary, StoreSummaryRow } from "../types/api.js";

export const storesRouter = Router();

const createStoreSchema = zod.object({ name: zod.string().min(1, "Name is required") });

const LOW_STOCK_THRESHOLD = 5;

storesRouter.get("/", async (_req, res) => {
  try {
    const stores = await prisma.store.findMany({ orderBy: { name: "asc" } });
    res.json(stores);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "Failed to list stores");
  }
});

/** Non-trivial: inventory summary by store (aggregation in DB). */
storesRouter.get("/summaries", async (_req, res) => {
  try {
    const rows = await prisma.$queryRaw<StoreSummaryRow[]>`
      SELECT s.id AS storeId, s.name AS storeName,
        COUNT(p.id) AS productCount,
        CAST(COALESCE(SUM(p.price * p.quantityInStock), 0) AS REAL) AS totalValue,
        SUM(CASE WHEN p.quantityInStock < ${LOW_STOCK_THRESHOLD} THEN 1 ELSE 0 END) AS lowStockCount
      FROM Store s
      LEFT JOIN Product p ON p.storeId = s.id
      GROUP BY s.id, s.name
      ORDER BY s.name
    `;
    const summaries: StoreSummary[] = rows.map((r) => ({
      storeId: r.storeId,
      storeName: r.storeName,
      productCount: Number(r.productCount),
      totalInventoryValue: Math.round(r.totalValue * 100) / 100,
      lowStockCount: Number(r.lowStockCount),
    }));
    res.json(summaries);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "Failed to get store summaries");
  }
});

storesRouter.post("/", async (req, res) => {
  const parsed = createStoreSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Validation failed", parsed.error.flatten().fieldErrors);
  }
  try {
    const store = await prisma.store.create({ data: parsed.data });
    res.status(201).json(store);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "Failed to create store");
  }
});

storesRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params as IdParams;
    await prisma.store.delete({ where: { id } });
    res.status(204).send();
  } catch (e: unknown) {
    if (NotFoundError(e)) return sendError(res, 404, "Store not found");
    console.error(e);
    sendError(res, 500, "Failed to delete store");
  }
});

