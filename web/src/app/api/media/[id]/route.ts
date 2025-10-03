import { NextRequest } from "next/server";
import { requireAuth, createApiResponse, createErrorResponse } from "@/lib/auth-helpers";
import * as mediaService from "@/lib/services/media_service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;
    const media = await mediaService.getMedia(id, userId);
    return createApiResponse(media);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;
    await mediaService.deleteMedia(id, userId);
    return new Response(null, { status: 204 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
