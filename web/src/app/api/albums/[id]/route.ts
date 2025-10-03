import { NextRequest } from "next/server";
import { requireAuth, createApiResponse, createErrorResponse } from "@/lib/auth-helpers";
import * as albumService from "@/lib/services/album_service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;
    const album = await albumService.getAlbum(id, userId);
    return createApiResponse(album);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();
    const { id } = await params;
    const album = await albumService.updateAlbum(id, userId, body);
    return createApiResponse(album);
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
    await albumService.deleteAlbum(id, userId);
    return new Response(null, { status: 204 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
