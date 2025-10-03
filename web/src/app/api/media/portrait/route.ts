import { NextRequest } from "next/server";
import { requireAuth, createApiResponse, createErrorResponse } from "@/lib/auth-helpers";
import * as mediaService from "@/lib/services/media_service";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const photos = await mediaService.getPortraitPhotos(userId, limit, offset);
    return createApiResponse(photos);
  } catch (error) {
    return createErrorResponse(error);
  }
}
