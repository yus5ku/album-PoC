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

// カテゴリ別の画像取得エンドポイント
mediaRouter.get("/category/:category", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { category } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const media = await svc.getMediaByCategory(userId, category, limit, offset);
    res.json(media);
  } catch (e) { next(e); }
});

// カテゴリ統計取得
mediaRouter.get("/stats/categories", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const stats = await svc.getCategoryStats(userId);
    res.json(stats);
  } catch (e) { next(e); }
});

// 風景写真専用エンドポイント
mediaRouter.get("/landscape", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const photos = await svc.getLandscapePhotos(userId, limit, offset);
    res.json(photos);
  } catch (e) { next(e); }
});

// 人物写真専用エンドポイント
mediaRouter.get("/portrait", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const photos = await svc.getPortraitPhotos(userId, limit, offset);
    res.json(photos);
  } catch (e) { next(e); }
});

// 食べ物写真専用エンドポイント
mediaRouter.get("/food", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const photos = await svc.getFoodPhotos(userId, limit, offset);
    res.json(photos);
  } catch (e) { next(e); }
});