import { Router, Request, Response, NextFunction } from "express";
import { requireAuth } from "../libs/auth.js";
import * as svc from "../services/album.service.js";

export const albumsRouter = Router();

albumsRouter.get("/", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const list = await svc.listAlbums(userId);
  res.json(list);
});

albumsRouter.post("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const album = await svc.createAlbum(userId, req.body);
    res.status(201).json(album);
  } catch (e) { next(e); }
});

albumsRouter.get("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const album = await svc.getAlbum(req.params.id, userId);
    res.json(album);
  } catch (e) { next(e); }
});

albumsRouter.patch("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const updated = await svc.updateAlbum(req.params.id, userId, req.body);
    res.json(updated);
  } catch (e) { next(e); }
});

albumsRouter.delete("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    await svc.deleteAlbum(req.params.id, userId);
    res.status(204).end();
  } catch (e) { next(e); }
});