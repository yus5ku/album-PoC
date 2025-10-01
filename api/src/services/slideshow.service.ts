import createError from "http-errors";
import { prisma } from "../libs/db.js";
import { registerRunner, runJob } from "../libs/slideshow.js";
import { putObject } from "../libs/storage.js";

// 実際には FFmpeg を呼ぶ。ここでは疑似的に画像を束ねてmp4化した体で実装
export async function createJob(userId: string, input: { albumId: string; transition?: string; fps?: number }) {
  if (!input.albumId) throw createError(400, "albumId required");
  const album = await prisma.album.findUnique({ where: { id: input.albumId }, include: { media: true } });
  if (!album) throw createError(404, "album not found");
  if (album.ownerId !== userId) throw createError(403, "forbidden");

  const job = await prisma.slideshowJob.create({
    data: {
      albumId: album.id,
      params: JSON.stringify({ transition: input.transition ?? "crossfade", fps: input.fps ?? 30 })
    }
  });

  // 疑似ランナー登録
  registerRunner(job.id, async (jobId) => {
    await prisma.slideshowJob.update({ where: { id: jobId }, data: { status: "processing", progress: 10 } });

    // ここで FFmpeg を実行する想定。今回はダミーのバイナリを書き込み
    const fakeMp4 = Buffer.from("000000"); // 実運用: spawn('ffmpeg', [...])
    const outKey = `slideshows/${job.albumId}/${job.id}.mp4`;
    const storageKey = await putObject(fakeMp4, outKey);

    await prisma.slideshowJob.update({
      where: { id: jobId },
      data: { status: "done", progress: 100, resultKey: storageKey }
    });
  });

  // 非同期で実行
  runJob(job.id).catch(async (err) => {
    await prisma.slideshowJob.update({
      where: { id: job.id },
      data: { status: "failed", errorMsg: String(err) }
    });
  });

  return job;
}

export async function getJob(jobId: string, userId: string) {
  const job = await prisma.slideshowJob.findUnique({
    where: { id: jobId },
    include: { album: true }
  });
  if (!job) throw createError(404, "not found");
  if (job.album.ownerId !== userId && !job.album.isPublic) throw createError(403, "forbidden");
  return job;
}