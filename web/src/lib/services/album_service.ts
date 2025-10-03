import { prisma } from "../db";

// Next.js用のカスタムエラークラス
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function listAlbums(userId: string) {
  const albums = await prisma.album.findMany({ 
    where: { ownerId: userId }, 
    orderBy: { createdAt: "desc" },
    include: {
      media: {
        orderBy: { createdAt: "desc" },
        take: 1, // カバー画像用に最新の1枚を取得
        select: {
          id: true,
          storageKey: true,
          mime: true
        }
      },
      _count: {
        select: {
          media: true
        }
      }
    }
  });

  // カバー画像URLとメディア数を追加
  return albums.map(album => ({
    ...album,
    mediaCount: album._count.media,
    coverImageUrl: album.media.length > 0 && album.media[0].mime.startsWith('image/') 
      ? `/api/media/file/${album.media[0].id}` 
      : null,
    media: undefined, // フロントエンドには送らない
    _count: undefined // フロントエンドには送らない
  }));
}

export async function createAlbum(userId: string, input: { title: string; description?: string; isPublic?: boolean }) {
  if (!input?.title) throw new ApiError(400, "title required");
  return prisma.album.create({
    data: { ownerId: userId, title: input.title, description: input.description ?? null, isPublic: !!input.isPublic }
  });
}

export async function getAlbum(albumId: string, userId: string) {
  const album = await prisma.album.findUnique({ where: { id: albumId }, include: { media: true } });
  if (!album) throw new ApiError(404, "not found");
  if (album.ownerId !== userId && !album.isPublic) throw new ApiError(403, "forbidden");
  return album;
}

export async function updateAlbum(albumId: string, userId: string, input: Partial<{ title: string; description: string; isPublic: boolean }>) {
  const album = await prisma.album.findUnique({ where: { id: albumId } });
  if (!album) throw new ApiError(404, "not found");
  if (album.ownerId !== userId) throw new ApiError(403, "forbidden");
  return prisma.album.update({ where: { id: albumId }, data: input });
}

export async function deleteAlbum(albumId: string, userId: string) {
  const album = await prisma.album.findUnique({ where: { id: albumId } });
  if (!album) throw new ApiError(404, "not found");
  if (album.ownerId !== userId) throw new ApiError(403, "forbidden");
  await prisma.media.deleteMany({ where: { albumId } });
  await prisma.album.delete({ where: { id: albumId } });
}
