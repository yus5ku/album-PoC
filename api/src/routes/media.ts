import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { requireAuth } from "../libs/auth.js";
import * as svc from "../services/media.service.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
export const mediaRouter = Router();

mediaRouter.post("/upload", requireAuth, upload.single("file"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { albumId, caption, tags } = req.body;
    const file = req.file!;
    const media = await svc.uploadMedia(userId, { albumId, caption, tags, file });
    res.status(201).json(media);
  } catch (e) { next(e); }
});

mediaRouter.get("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const detail = await svc.getMedia(req.params.id, userId);
    res.json(detail);
  } catch (e) { next(e); }
});

mediaRouter.delete("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    await svc.deleteMedia(req.params.id, userId);
    res.status(204).end();
  } catch (e) { next(e); }
});