import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/db.js";

export const storesRouter = Router();

const createStoreSchema = z.object({ name: z.string().min(1, "Name is required") });
const updateStoreSchema = createStoreSchema.partial();

storesRouter.get("/", async (_req, res) => {
  try {
    const stores = await prisma.store.findMany({ orderBy: { name: "asc" } });
    res.json(stores);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list stores" });
  }
});

storesRouter.get("/:id", async (req, res) => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: req.params.id },
      include: { products: true },
    });
    if (!store) return res.status(404).json({ error: "Store not found" });
    res.json(store);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get store" });
  }
});

storesRouter.post("/", async (req, res) => {
  const parsed = createStoreSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }
  try {
    const store = await prisma.store.create({ data: parsed.data });
    res.status(201).json(store);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create store" });
  }
});

storesRouter.put("/:id", async (req, res) => {
  const parsed = updateStoreSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }
  try {
    const store = await prisma.store.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json(store);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") {
      return res.status(404).json({ error: "Store not found" });
    }
    console.error(e);
    res.status(500).json({ error: "Failed to update store" });
  }
});

storesRouter.delete("/:id", async (req, res) => {
  try {
    await prisma.store.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") {
      return res.status(404).json({ error: "Store not found" });
    }
    console.error(e);
    res.status(500).json({ error: "Failed to delete store" });
  }
});
