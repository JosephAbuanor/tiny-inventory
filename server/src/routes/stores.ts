import { Router } from "express";
import { z as zod } from "zod";
import { prisma } from "../lib/db.js";
import { sendError } from "../lib/errors.js";

export const storesRouter = Router();

const createStoreSchema = zod.object({ name: zod.string().min(1, "Name is required") });
const updateStoreSchema = createStoreSchema.partial();

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
    const rows = await prisma.$queryRaw<
      { storeId: string; storeName: string; productCount: bigint; totalValue: number; lowStockCount: bigint }[]
    >`
      SELECT s.id AS storeId, s.name AS storeName,
        COUNT(p.id) AS productCount,
        COALESCE(SUM(p.price * p.quantityInStock), 0) AS totalValue,
        SUM(CASE WHEN p.quantityInStock < ${LOW_STOCK_THRESHOLD} THEN 1 ELSE 0 END) AS lowStockCount
      FROM Store s
      LEFT JOIN Product p ON p.storeId = s.id
      GROUP BY s.id, s.name
      ORDER BY s.name
    `;
    const summaries = rows.map((r) => ({
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

storesRouter.get("/:id", async (req, res) => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: req.params.id },
      include: { products: true },
    });
    if (!store) return sendError(res, 404, "Store not found");
    res.json(store);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "Failed to get store");
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

storesRouter.put("/:id", async (req, res) => {
  const parsed = updateStoreSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Validation failed", parsed.error.flatten().fieldErrors);
  }
  try {
    const store = await prisma.store.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json(store);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") {
      return sendError(res, 404, "Store not found");
    }
    console.error(e);
    sendError(res, 500, "Failed to update store");
  }
});

storesRouter.delete("/:id", async (req, res) => {
  try {
    await prisma.store.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") {
      return sendError(res, 404, "Store not found");
    }
    console.error(e);
    sendError(res, 500, "Failed to delete store");
  }
});
