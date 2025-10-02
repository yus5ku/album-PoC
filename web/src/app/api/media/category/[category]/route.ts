import { NextRequest } from "next/server";
import { requireAuth, createApiResponse, createErrorResponse } from "@/lib/auth-helpers";
import * as mediaService from "@/lib/services/media.service";

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const { userId } = await requireAuth();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const media = await mediaService.getMediaByCategory(userId, params.category, limit, offset);
    return createApiResponse(media);
  } catch (error) {
    return createErrorResponse(error);
  }
}
