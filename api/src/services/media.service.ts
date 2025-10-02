import createError from "http-errors";
import { prisma } from "../libs/db.js";
import { putObject, getObjectUrl } from "../libs/storage.js";
import { analyzeImage } from "../libs/image-analysis.js";
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

  // 既存のタグを処理
  const userTags = Array.isArray(input.tags)
    ? input.tags
    : typeof input.tags === "string" && input.tags.length
    ? input.tags.split(",").map(s => s.trim())
    : [];

  // 画像分析を実行（画像ファイルの場合のみ）
  let analysisResult = null;
  let finalTags = userTags;
  let category = null;
  let confidence = null;
  let colors: string[] = [];
  let width = null;
  let height = null;

  if (input.file.mimetype.startsWith('image/')) {
    try {
      console.log(`[画像分析] 開始: ${input.file.originalname}`);
      analysisResult = await analyzeImage(input.file.buffer, input.file.originalname);
      
      // 分析結果をログ出力
      console.log(`[画像分析] 結果:`, {
        category: analysisResult.category,
        confidence: analysisResult.confidence,
        suggestedTags: analysisResult.suggestedTags,
        colors: analysisResult.colors
      });

      // 分析結果から情報を取得
      category = analysisResult.category;
      confidence = analysisResult.confidence;
      colors = analysisResult.colors;
      width = analysisResult.dimensions.width;
      height = analysisResult.dimensions.height;

      // 推奨タグをユーザータグに追加（重複除去）
      const suggestedTags = analysisResult.suggestedTags;
      finalTags = [...new Set([...userTags, ...suggestedTags])];

      console.log(`[画像分析] 最終タグ:`, finalTags);
    } catch (error) {
      console.warn(`[画像分析] エラー:`, error);
      // 分析に失敗してもアップロードは続行
    }
  }

  const media = await prisma.media.create({
    data: {
      albumId: album.id,
      ownerId: userId,
      storageKey,
      mime: input.file.mimetype,
      width,
      height,
      caption: input.caption ?? null,
      tags: finalTags,
      // 画像分析結果
      category,
      confidence,
      colors,
      analyzed: analysisResult !== null
    }
  });

  return { 
    ...media, 
    url: getObjectUrl(storageKey),
    // 分析結果も返す
    analysis: analysisResult ? {
      category: analysisResult.category,
      confidence: analysisResult.confidence,
      suggestedTags: analysisResult.suggestedTags
    } : null
  };
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

/**
 * カテゴリ別に画像を取得
 */
export async function getMediaByCategory(userId: string, category: string, limit = 20, offset = 0) {
  const media = await prisma.media.findMany({
    where: {
      ownerId: userId,
      category: category,
      analyzed: true
    },
    include: {
      album: {
        select: {
          id: true,
          title: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit,
    skip: offset
  });

  return media.map((m: any) => ({
    ...m,
    url: getObjectUrl(m.storageKey)
  }));
}

/**
 * ユーザーの画像カテゴリ統計を取得
 */
export async function getCategoryStats(userId: string) {
  const stats = await prisma.media.groupBy({
    by: ['category'],
    where: {
      ownerId: userId,
      analyzed: true,
      category: {
        not: null
      }
    },
    _count: {
      category: true
    },
    orderBy: {
      _count: {
        category: 'desc'
      }
    }
  });

  return stats.map((stat: any) => ({
    category: stat.category,
    count: stat._count.category
  }));
}

/**
 * 風景写真のみを取得
 */
export async function getLandscapePhotos(userId: string, limit = 20, offset = 0) {
  return getMediaByCategory(userId, 'landscape', limit, offset);
}

/**
 * 人物写真のみを取得
 */
export async function getPortraitPhotos(userId: string, limit = 20, offset = 0) {
  return getMediaByCategory(userId, 'portrait', limit, offset);
}

/**
 * 食べ物写真のみを取得
 */
export async function getFoodPhotos(userId: string, limit = 20, offset = 0) {
  return getMediaByCategory(userId, 'food', limit, offset);
}