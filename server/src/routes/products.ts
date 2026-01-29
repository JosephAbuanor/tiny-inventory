import { Router } from "express";
import { z as zod } from "zod";
import { prisma } from "../lib/db.js";

export const productsRouter = Router();

const createProductSchema = zod.object({
  storeId: zod.string().min(1, "Store ID is required"),
  name: zod.string().min(1, "Name is required"),
  category: zod.string().min(1, "Category is required"),
  price: zod.coerce.number().positive("Price must be positive"),
  quantityInStock: zod.coerce.number().int().min(0, "Quantity must be non-negative"),
});
const updateProductSchema = createProductSchema.partial();

const LOW_STOCK_THRESHOLD = 5;

productsRouter.get("/", async (req, res) => {
  try {
    const storeId = req.query.storeId as string | undefined;
    const category = req.query.category as string | undefined;
    const minPrice = req.query.minPrice != null ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice != null ? Number(req.query.maxPrice) : undefined;
    const lowStock = req.query.lowStock === "true";
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Parameters<typeof prisma.product.findMany>[0]["where"] = {};
    if (storeId) where.storeId = storeId;
    if (category) where.category = category;
    if (minPrice != null && !Number.isNaN(minPrice) || maxPrice != null && !Number.isNaN(maxPrice)) {
      where.price = {};
      if (minPrice != null && !Number.isNaN(minPrice)) (where.price as { gte?: number }).gte = minPrice;
      if (maxPrice != null && !Number.isNaN(maxPrice)) (where.price as { lte?: number }).lte = maxPrice;
    }
    if (lowStock) where.quantityInStock = { lt: LOW_STOCK_THRESHOLD };

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take: limit,
        include: { store: { select: { id: true, name: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({ data, total, page, limit });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list products" });
  }
});

productsRouter.get("/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { store: true },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get product" });
  }
});

productsRouter.post("/", async (req, res) => {
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }
  try {
    const product = await prisma.product.create({
      data: parsed.data,
      include: { store: { select: { id: true, name: true } } },
    });
    res.status(201).json(product);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create product" });
  }
});

productsRouter.put("/:id", async (req, res) => {
  const parsed = updateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: parsed.data,
      include: { store: { select: { id: true, name: true } } },
    });
    res.json(product);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    console.error(e);
    res.status(500).json({ error: "Failed to update product" });
  }
});

productsRouter.delete("/:id", async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    console.error(e);
    res.status(500).json({ error: "Failed to delete product" });
  }
});
