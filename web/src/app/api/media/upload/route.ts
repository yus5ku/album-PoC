import { NextRequest } from "next/server";
import { requireAuth, createApiResponse, createErrorResponse } from "@/lib/auth-helpers";
import * as mediaService from "@/lib/services/media_service";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const albumId = formData.get('albumId') as string;
    const caption = formData.get('caption') as string;
    const tags = formData.get('tags') as string;

    if (!file) {
      return createErrorResponse(new Error('No file provided'));
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    const media = await mediaService.uploadMedia(userId, {
      albumId,
      caption,
      tags,
      file: {
        originalname: file.name,
        mimetype: file.type,
        buffer
      }
    });

    return createApiResponse(media, 201);
  } catch (error) {
    return createErrorResponse(error);
  }
}
