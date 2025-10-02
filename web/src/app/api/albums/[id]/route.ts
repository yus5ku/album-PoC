import { NextRequest } from "next/server";
import { requireAuth, createApiResponse, createErrorResponse } from "@/lib/auth-helpers";
import * as albumService from "@/lib/services/album.service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth();
    const album = await albumService.getAlbum(params.id, userId);
    return createApiResponse(album);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();
    const album = await albumService.updateAlbum(params.id, userId, body);
    return createApiResponse(album);
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
    await albumService.deleteAlbum(params.id, userId);
    return new Response(null, { status: 204 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
