import { NextRequest } from "next/server";
import { requireAuth, createApiResponse, createErrorResponse } from "@/lib/auth-helpers";
import * as mediaService from "@/lib/services/media.service";

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const stats = await mediaService.getCategoryStats(userId);
    return createApiResponse(stats);
  } catch (error) {
    return createErrorResponse(error);
  }
}
