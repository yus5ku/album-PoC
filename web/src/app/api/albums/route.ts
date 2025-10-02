import { NextRequest } from "next/server";
import { requireAuth, createApiResponse, createErrorResponse } from "@/lib/auth-helpers";
import * as albumService from "@/lib/services/album.service";

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const albums = await albumService.listAlbums(userId);
    return createApiResponse(albums);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();
    const album = await albumService.createAlbum(userId, body);
    return createApiResponse(album, 201);
  } catch (error) {
    return createErrorResponse(error);
  }
}
