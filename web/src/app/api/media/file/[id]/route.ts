import { NextRequest } from "next/server";
import { requireAuth, createErrorResponse } from "@/lib/auth-helpers";
import * as mediaService from "@/lib/services/media_service";
import { promises as fs } from "node:fs";
import path from "node:path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;
    const media = await mediaService.getMedia(id, userId);
    
    // ローカルストレージからファイルを読み取り
    if (media.storageKey.startsWith("local:")) {
      const localDir = process.env.LOCAL_STORAGE_DIR ?? "./.storage";
      const key = media.storageKey.slice(6); // "local:" を除去
      const filePath = path.join(localDir, key);
      
      try {
        const fileBuffer = await fs.readFile(filePath);
        
        return new Response(new Uint8Array(fileBuffer), {
          headers: {
            'Content-Type': media.mime,
            'Cache-Control': 'public, max-age=31536000', // 1年間キャッシュ
          },
        });
      } catch (error) {
        console.error('File not found:', filePath, error);
        return new Response('File not found', { status: 404 });
      }
    }
    
    // S3の場合は別途実装が必要
    if (media.storageKey.startsWith("s3:")) {
      // TODO: S3からファイルを取得する実装
      return new Response('S3 not implemented yet', { status: 501 });
    }
    
    return new Response('Unsupported storage type', { status: 400 });
    
  } catch (error) {
    return createErrorResponse(error);
  }
}
