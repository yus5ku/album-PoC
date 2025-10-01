import createError from "http-errors";
import { prisma } from "../libs/db.js";
import { putObject, getObjectUrl } from "../libs/storage.js";
import path from "node:path";
import { randomUUID } from "node:crypto";

interface UploadInput {
  albumId: string;
  caption?: string;
  tags?: string | string[];
  file: {
    originalname: string;
    mimetype: string;
    buffer: Buffer;
  };
}

export async function uploadMedia(userId: string, input: UploadInput) {
  if (!input.albumId) throw createError(400, "albumId required");
  const album = await prisma.album.findUnique({ where: { id: input.albumId } });
  if (!album) throw createError(404, "album not found");
  if (album.ownerId !== userId) throw createError(403, "forbidden");

  const ext = path.extname(input.file.originalname) || ".bin";
  const key = `${album.id}/${randomUUID()}${ext}`;
  const storageKey = await putObject(input.file.buffer, key);

  const tags = Array.isArray(input.tags)
    ? input.tags
    : typeof input.tags === "string" && input.tags.length
    ? input.tags.split(",").map(s => s.trim())
    : [];

  const media = await prisma.media.create({
    data: {
      albumId: album.id,
      ownerId: userId,
      storageKey,
      mime: input.file.mimetype,
      caption: input.caption ?? null,
      tags
    }
  });

  return { ...media, url: getObjectUrl(storageKey) };
}

export async function getMedia(mediaId: string, userId: string) {
  const m = await prisma.media.findUnique({ where: { id: mediaId }, include: { album: true } });
  if (!m) throw createError(404, "not found");
  if (m.ownerId !== userId && !m.album.isPublic) throw createError(403, "forbidden");
  return { ...m, url: getObjectUrl(m.storageKey) };
}

export async function deleteMedia(mediaId: string, userId: string) {
  const m = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!m) throw createError(404, "not found");
  if (m.ownerId !== userId) throw createError(403, "forbidden");
  await prisma.media.delete({ where: { id: mediaId } });
}