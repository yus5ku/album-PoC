import { Router, Request, Response, NextFunction } from "express";
import { requireAuth } from "../libs/auth.js";
import * as svc from "../services/slideshow.service.js";

export const slideshowRouter = Router();

slideshowRouter.post("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const job = await svc.createJob(userId, req.body);
    res.status(201).json(job);
  } catch (e) { next(e); }
});

slideshowRouter.get("/:jobId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const job = await svc.getJob(req.params.jobId, userId);
    res.json(job);
  } catch (e) { next(e); }
});