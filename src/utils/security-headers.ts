import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function setSecurityHeaders(req: NextRequest) {
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");

  return response;
}
