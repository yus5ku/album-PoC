import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextRequest } from "next/server";
import { ApiError } from "./services/album_service";

export async function requireAuth(request?: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new ApiError(401, "Unauthorized");
  }
  
  return {
    userId: session.user.id,
    user: session.user
  };
}

export function createApiResponse(data: any, status = 200) {
  return Response.json(data, { status });
}

export function createErrorResponse(error: unknown) {
  console.error('API Error:', error);
  
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  
  return Response.json({ error: 'Internal Server Error' }, { status: 500 });
}
