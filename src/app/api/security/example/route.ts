import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken, extractCsrfToken } from "@/utils/csrf";
import { rateLimiter } from "@/utils/rateLimiter";
import { sanitizeHtml, sanitizeQueryParam } from "@/utils/sanitize";
import { z } from "zod";

const RequestSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(5).max(1000),
});

export async function POST(request: NextRequest) {
  try {
    const csrfToken = extractCsrfToken(request);
    if (!csrfToken || !validateCsrfToken(csrfToken)) {
      return NextResponse.json(
        { error: "Invalid or missing CSRF token" },
        { status: 403 }
      );
    }

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const key = `api:security:example:${ip}`;

    if (rateLimiter.isRateLimited(key, 10, 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many requests, please try again later" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validationResult = RequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const response = NextResponse.json({
      success: true,
      message: "Request processed successfully",
      data: {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      },
    });

    response.headers.set(
      "Cache-Control",
      "no-store, max-age=0, must-revalidate"
    );
    response.headers.set("X-Content-Type-Options", "nosniff");

    return response;
  } catch (error) {
    console.error("Error processing request:", error);

    return NextResponse.json(
      { error: "An error occurred processing your request" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const key = `api:security:example:get:${ip}`;

    if (rateLimiter.isRateLimited(key, 30, 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many requests, please try again later" },
        { status: 429 }
      );
    }

    const name = sanitizeQueryParam(
      request.nextUrl.searchParams.get("name") || ""
    );

    const response = NextResponse.json({
      success: true,
      message: "Hello " + (name || "World"),
      timestamp: new Date().toISOString(),
    });

    response.headers.set(
      "Cache-Control",
      "no-store, max-age=0, must-revalidate"
    );
    response.headers.set("X-Content-Type-Options", "nosniff");

    return response;
  } catch (error) {
    console.error("Error processing GET request:", error);

    return NextResponse.json(
      { error: "An error occurred processing your request" },
      { status: 500 }
    );
  }
}
