import { createApiResponse } from "@/lib/auth-helpers";

export async function GET() {
  return createApiResponse({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'album-web-api'
  });
}
