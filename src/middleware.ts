import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";

  const isCSPReportEndpoint =
    request.nextUrl.pathname === "/api/security/csp-report";

  const requestHeaders = new Headers(request.headers);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const url = request.nextUrl.pathname;
  const isStaticResource =
    url.match(/\.(css|js|woff2?|ttf|eot|png|jpe?g|gif|ico|webp|svg)$/i) ||
    url.startsWith("/_next/static/") ||
    url.startsWith("/_next/image/");

  if (isStaticResource && !isDev) {
    let maxAge = 60 * 60 * 24;
    let staleWhileRevalidate = 60 * 60;

    if (
      url.includes("/_next/static/chunks/") ||
      (url.includes("/_next/static/") && url.includes("."))
    ) {
      maxAge = 60 * 60 * 24 * 365; // 1 year
      staleWhileRevalidate = 60 * 60 * 24 * 30; // 30 days
      response.headers.set(
        "Cache-Control",
        `public, max-age=${maxAge}, immutable, stale-while-revalidate=${staleWhileRevalidate}`
      );
    } else if (url.match(/\.(woff2?|ttf|eot|otf)$/i)) {
      maxAge = 60 * 60 * 24 * 30; // 30 days
      staleWhileRevalidate = 60 * 60 * 24 * 7; // 7 days
      response.headers.set(
        "Cache-Control",
        `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
      );
    } else if (
      url.match(/\.(png|jpe?g|gif|ico|webp|svg)$/i) ||
      url.startsWith("/_next/image/")
    ) {
      maxAge = 60 * 60 * 24 * 7; // 7 days
      staleWhileRevalidate = 60 * 60 * 24; // 1 day
      response.headers.set(
        "Cache-Control",
        `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
      );
    } else if (url.match(/\.(css|js)$/i)) {
      maxAge = 60 * 60 * 24;
      staleWhileRevalidate = 60 * 60;
      response.headers.set(
        "Cache-Control",
        `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
      );
    } else {
      response.headers.set(
        "Cache-Control",
        `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
      );
    }
  }

  if (!isDev) {
    if (!isCSPReportEndpoint) {
      response.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' " +
          "https://*.jsdelivr.net https://cdn.jsdelivr.net " +
          "https://*.unpkg.com https://unpkg.com " +
          "https://*.google-analytics.com https://www.google-analytics.com " +
          "https://*.posthog.com https://us-assets.i.posthog.com " +
          "https://*.board.support https://cloud.board.support https://cloud.board.support/account/js/init.js " +
          "https://*.pusher.com https://js.pusher.com " +
          "https://*.sitebehaviour.com https://event-store.sitebehaviour.com " +
          "https://sitebehaviour-cdn.fra1.cdn.digitaloceanspaces.com; " +
          "style-src 'self' 'unsafe-inline' " +
          "https://*.jsdelivr.net https://cdn.jsdelivr.net " +
          "https://*.googleapis.com https://fonts.googleapis.com " +
          "https://*.board.support https://cloud.board.support; " +
          "img-src 'self' data: blob: https: " +
          "https://*.supabase.co https://shyulpexykcgruhbjihk.supabase.co https://boumbfvrlrdiibcuppjj.supabase.co https://ihgjcrfmdpdjvnoqknoh.supabase.co " +
          "https://*.googleusercontent.com https://lh3.googleusercontent.com " +
          "https://*.imagekit.io https://ik.imagekit.io; " +
          "worker-src 'self' blob: data:; " +
          "connect-src 'self' https: wss: data: blob: " +
          "https://*.researchcollab.ai https://app.researchcollab.ai " +
          "https://*.onrender.com https://research-collab-frontend.onrender.com https://research-collab-xfbh.onrender.com https://research-collab.onrender.com " +
          "https://research-collab-backend-oszc.onrender.com https://research-collab-backend.onrender.com https://research-collab-backend-agep.onrender.com https://research-collab-backend-djqf.onrender.com " +
          "wss://research-collab-backend-oszc.onrender.com wss://research-collab-backend.onrender.com wss://research-collab-backend-agep.onrender.com wss://research-collab-backend-djqf.onrender.com " +
          "https://*.supabase.co https://shyulpexykcgruhbjihk.supabase.co https://boumbfvrlrdiibcuppjj.supabase.co https://ihgjcrfmdpdjvnoqknoh.supabase.co " +
          "wss://*.supabase.co wss://shyulpexykcgruhbjihk.supabase.co wss://boumbfvrlrdiibcuppjj.supabase.co wss://ihgjcrfmdpdjvnoqknoh.supabase.co " +
          "https://*.straico.com https://api.straico.com " +
          "http://localhost:* wss://localhost:* http://localhost:5000 " +
          "https://*.posthog.com " +
          "https://*.sitebehaviour.com https://event-store.sitebehaviour.com " +
          "https://*.zotero.org https://api.zotero.org " +
          "https://*.mendeley.com https://api.mendeley.com; " +
          "font-src 'self' data: " +
          "https://*.gstatic.com https://fonts.gstatic.com " +
          "https://*.board.support https://cloud.board.support; " +
          "media-src 'self' blob: data: https: " +
          "*.mp4 *.webm *.ogg " +
          "https://*.supabase.co https://shyulpexykcgruhbjihk.supabase.co/storage/ https://shyulpexykcgruhbjihk.supabase.co " +
          "https://boumbfvrlrdiibcuppjj.supabase.co https://ihgjcrfmdpdjvnoqknoh.supabase.co https://ihgjcrfmdpdjvnoqknoh.supabase.co/storage/v1/object/public; " +
          "object-src 'none'; " +
          "frame-src 'self' https:; " +
          "frame-ancestors 'none'; " +
          "report-uri /api/security/csp-report; " +
          "report-to csp-endpoint;"
      );
    }

    response.headers.set("X-XSS-Protection", "1; mode=block");

    response.headers.set("X-Content-Type-Options", "nosniff");

    response.headers.set("X-Frame-Options", "DENY");

    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );

    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(self), interest-cohort=()"
    );

    if (!isCSPReportEndpoint) {
      response.headers.set(
        "Report-To",
        '{"group":"csp-endpoint","max_age":10886400,"endpoints":[{"url":"/api/security/csp-report"}]}'
      );
    }
  } else {
    response.headers.set("X-Content-Type-Options", "nosniff");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api/security/csp-report|_next/static|_next/image|favicon.ico).*)",
    "/_next/static/:path*",
    "/_next/image/:path*",
    "/favicon.ico",
    "/:path*.(jpg|jpeg|gif|png|svg|ico|css|js|woff|woff2|ttf|eot)",
  ],
};
