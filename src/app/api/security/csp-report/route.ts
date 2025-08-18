import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let reportData;
    if (contentType.includes("application/json")) {
      reportData = await request.json();
    } else if (contentType.includes("application/csp-report")) {
      const text = await request.text();
      try {
        reportData = JSON.parse(text);
      } catch (e) {
        reportData = { rawText: text };
      }
    } else {
      reportData = { error: "Unsupported content type", contentType };
    }

    if (process.env.NODE_ENV === "development") {
      console.warn("CSP Violation:", JSON.stringify(reportData, null, 2));
    } else {
      console.warn("CSP Violation detected");
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error processing CSP report:", error);
    return NextResponse.json(
      { error: "Failed to process CSP report" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
