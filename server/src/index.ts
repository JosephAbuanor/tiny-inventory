import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { productsRouter } from "./routes/products.js";
import { storesRouter } from "./routes/stores.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface RateLimitMessage {
  error: string;
}

interface HealthResponse {
  ok: boolean;
}

const app = express();
app.use(helmet());
app.use(express.json());

const PORT = process.env.PORT ?? 4000;

const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000; // 1 min default
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX) || 100;

const rateLimitMessage: RateLimitMessage = {
  error: "Too many requests, please try again later.",
};

const apiLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  limit: rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage,
});

app.get("/health", (_req, res) => {
  const body: HealthResponse = { ok: true };
  res.json(body);
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
