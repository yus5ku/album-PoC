import createError from "http-errors";
import { prisma } from "../libs/db.js";

export async function listAlbums(userId: string) {
  return prisma.album.findMany({ where: { ownerId: userId }, orderBy: { createdAt: "desc" } });
}

export async function createAlbum(userId: string, input: { title: string; description?: string; isPublic?: boolean }) {
  if (!input?.title) throw createError(400, "title required");
  return prisma.album.create({
    data: { ownerId: userId, title: input.title, description: input.description ?? null, isPublic: !!input.isPublic }
  });
}

export async function getAlbum(albumId: string, userId: string) {
  const album = await prisma.album.findUnique({ where: { id: albumId }, include: { media: true } });
  if (!album) throw createError(404, "not found");
  if (album.ownerId !== userId && !album.isPublic) throw createError(403, "forbidden");
  return album;
}

export async function updateAlbum(albumId: string, userId: string, input: Partial<{ title: string; description: string; isPublic: boolean }>) {
  const album = await prisma.album.findUnique({ where: { id: albumId } });
  if (!album) throw createError(404, "not found");
  if (album.ownerId !== userId) throw createError(403, "forbidden");
  return prisma.album.update({ where: { id: albumId }, data: input });
}

export async function deleteAlbum(albumId: string, userId: string) {
  const album = await prisma.album.findUnique({ where: { id: albumId } });
  if (!album) throw createError(404, "not found");
  if (album.ownerId !== userId) throw createError(403, "forbidden");
  await prisma.media.deleteMany({ where: { albumId } });
  await prisma.album.delete({ where: { id: albumId } });
}