import { NextRequest } from "next/server";
import { requireAuth, createApiResponse, createErrorResponse } from "@/lib/auth-helpers";
import * as mediaService from "@/lib/services/media.service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth();
    const media = await mediaService.getMedia(params.id, userId);
    return createApiResponse(media);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth();
    await mediaService.deleteMedia(params.id, userId);
    return new Response(null, { status: 204 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
