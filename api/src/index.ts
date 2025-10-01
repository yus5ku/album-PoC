import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.js";
import { albumsRouter } from "./routes/albums.js";
import { mediaRouter } from "./routes/media.js";
import { slideshowRouter } from "./routes/slideshow.js";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/health", healthRouter);
app.use("/albums", albumsRouter);
app.use("/media", mediaRouter);
app.use("/slideshow", slideshowRouter);

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error("[error]", status, message, err);
  res.status(status).json({ error: message });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

const port = process.env.PORT ?? 3001;
app.listen(port, () => console.log(`[api] listening on :${port}`));