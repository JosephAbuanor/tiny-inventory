import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { rateLimit } from "express-rate-limit";
import { productsRouter } from "./routes/products.js";
import { storesRouter } from "./routes/stores.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

const PORT = process.env.PORT ?? 4000;

const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 6 * 1000; // 1 min default
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX) || 10;

const apiLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  limit: rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", apiLimiter);
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
