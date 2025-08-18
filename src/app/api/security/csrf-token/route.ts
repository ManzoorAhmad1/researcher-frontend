import { NextRequest, NextResponse } from "next/server";
import { generateCsrfToken } from "@/utils/csrf";

export async function GET(request: NextRequest) {
  const csrfToken = generateCsrfToken();

  const response = NextResponse.json({
    csrfToken,
    status: "success",
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: 60 * 60 * 2,
  };

  response.cookies.set("XSRF-TOKEN", csrfToken, cookieOptions);

  return response;
}
