import express from "express";
import { storesRouter } from "./routes/stores.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT ?? 4000;

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/stores", storesRouter);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
