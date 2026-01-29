import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { productsRouter } from "./routes/products.js";
import { storesRouter } from "./routes/stores.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

const PORT = process.env.PORT ?? 4000;

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/stores", storesRouter);
app.use("/api/products", productsRouter);

const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));
app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
