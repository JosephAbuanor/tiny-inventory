import { Router } from "express";
import { z as zod } from "zod";
import { prisma } from "../lib/db.js";
import { NotFoundError, sendError } from "../lib/errors.js";
import type { CategoriesQuery, IdParams, PaginatedResponse, ProductListQuery } from "../types/api.js";

/**
 * Narrow query shape for product list filtering.
 * Intentionally avoids Prisma-generated types to keep
 * HTTP layer decoupled from the ORM.
 */

type ProductWhereInput = {
  storeId?: string;
  category?: { equals: string };
  price?: { gte?: number; lte?: number };
  quantityInStock?: { lt: number };
};

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

function normalizeCategory(value: string): string {
  return value.trim().toLowerCase();
}

productsRouter.get("/categories", async (req, res) => {
  try {
    const query = req.query as CategoriesQuery;
    const storeId = query.storeId;
    const where: ProductWhereInput = storeId ? { storeId } : {};
    const rows = await prisma.product.findMany({
      where,
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });
    const categories: string[] = rows.map((r) => r.category);
    res.json(categories);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "Failed to list categories");
  }
});

productsRouter.get("/", async (req, res) => {
  try {
    const query = req.query as ProductListQuery;
    const storeId = query.storeId;
    const categoryRaw = query.category;
    const category = categoryRaw ? normalizeCategory(categoryRaw) : undefined;
    const minPrice = query.minPrice != null ? Number(query.minPrice) : undefined;
    const maxPrice = query.maxPrice != null ? Number(query.maxPrice) : undefined;
    const lowStock = query.lowStock === "true";
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: ProductWhereInput = {};
    if (storeId) where.storeId = storeId;
    if (category) where.category = { equals: category };
    if (minPrice != null && !Number.isNaN(minPrice) || maxPrice != null && !Number.isNaN(maxPrice)) {
      where.price = {};
      if (minPrice != null && !Number.isNaN(minPrice)) where.price.gte = minPrice;
      if (maxPrice != null && !Number.isNaN(maxPrice)) where.price.lte = maxPrice;
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

    const body: PaginatedResponse<typeof data[0]> = { data, total, page, limit };
    res.json(body);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "Failed to list products");
  }
});

productsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params as IdParams;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { store: true },
    });
    if (!product) return sendError(res, 404, "Product not found");
    res.json(product);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "Failed to get product");
  }
});

productsRouter.post("/", async (req, res) => {
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Validation failed", parsed.error.flatten().fieldErrors);
  }
  try {
    const data = {
      ...parsed.data,
      category: normalizeCategory(parsed.data.category),
    };
    const product = await prisma.product.create({
      data,
      include: { store: { select: { id: true, name: true } } },
    });
    res.status(201).json(product);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "Failed to create product");
  }
});

productsRouter.put("/:id", async (req, res) => {
  const parsed = updateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Validation failed", parsed.error.flatten().fieldErrors);
  }
  try {
    const { id } = req.params as IdParams;
    const data =
      typeof parsed.data.category === "string"
        ? { ...parsed.data, category: normalizeCategory(parsed.data.category) }
        : parsed.data;
    const product = await prisma.product.update({
      where: { id },
      data,
      include: { store: { select: { id: true, name: true } } },
    });
    res.json(product);
  } catch (e: unknown) {
    if (NotFoundError(e)) return sendError(res, 404, "Product not found");
    console.error(e);
    sendError(res, 500, "Failed to update product");
  }
});

productsRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params as IdParams;
    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (e: unknown) {
    if (NotFoundError(e)) return sendError(res, 404, "Product not found");
    console.error(e);
    sendError(res, 500, "Failed to delete product");
  }
});
