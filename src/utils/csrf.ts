import crypto from "crypto";

const CSRF_SECRET =
  process.env.CSRF_SECRET || "9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p3q2r1";
const CSRF_HEADER = "X-CSRF-Token";
const CSRF_COOKIE = "XSRF-TOKEN";
const CSRF_FORM_FIELD = "csrfToken";

function generateRandomToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**

 * @returns The CSRF token with signature
 */
export function generateCsrfToken(): string {
  const token = generateRandomToken();
  const signature = crypto
    .createHmac("sha256", CSRF_SECRET)
    .update(token)
    .digest("hex");

  return `${token}|${signature}`;
}

/**
 * Validate a CSRF token against its signature
 * @param token The token to validate
 */
export function validateCsrfToken(token: string): boolean {
  if (!token || !token.includes("|")) {
    return false;
  }

  try {
    const [value, signature] = token.split("|");

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac("sha256", CSRF_SECRET)
      .update(value)
      .digest("hex");

    // Compare signatures using timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (error) {
    console.error("CSRF token validation error:", error);
    return false;
  }
}

export function setCsrfCookie(res: any, token: string): void {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: 60 * 60 * 2, // 2 hours
  };

  res.setHeader(
    "Set-Cookie",
    `${CSRF_COOKIE}=${token}; ${cookieOptionsToString(cookieOptions)}`
  );
}

/**
 * Helper to convert cookie options to string
 */
function cookieOptionsToString(options: Record<string, any>): string {
  return Object.entries(options)
    .map(([key, value]) => {
      if (typeof value === "boolean") {
        return value ? key : "";
      }
      return `${key}=${value}`;
    })
    .filter(Boolean)
    .join("; ");
}

/**
 * Client-side function to fetch a CSRF token
 */
export async function fetchCsrfToken(): Promise<string> {
  try {
    // Use the API route we'll create
    const response = await fetch("/api/security/csrf-token");
    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error("Failed to fetch CSRF token:", error);
    throw error;
  }
}

/**
 * Extract CSRF token from various sources
 */
export function extractCsrfToken(req: any): string | null {
  // Try the header first
  const headerToken = req.headers[CSRF_HEADER.toLowerCase()];
  if (headerToken) return headerToken;

  // Try cookies
  const cookies = parseCookies(req);
  const cookieToken = cookies[CSRF_COOKIE];
  if (cookieToken) return cookieToken;

  // Try body for form submissions
  if (req.body && req.body[CSRF_FORM_FIELD]) {
    return req.body[CSRF_FORM_FIELD];
  }

  return null;
}

/**
 * Helper to parse cookies from request
 */
function parseCookies(req: any): Record<string, string> {
  const cookies: Record<string, string> = {};
  const cookieHeader = req.headers.cookie;

  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie: string) => {
      const [name, value] = cookie.trim().split("=");
      cookies[name] = value;
    });
  }

  return cookies;
}

/**
 * CSRF middleware for API routes
 */
export function csrfProtection(handler: (req: any, res: any) => Promise<any>) {
  return async (req: any, res: any) => {
    // Skip CSRF check for safe methods
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      return handler(req, res);
    }

    // For unsafe methods, validate CSRF token
    const token = extractCsrfToken(req);

    if (!token || !validateCsrfToken(token)) {
      return res.status(403).json({ error: "Invalid CSRF token" });
    }

    // Token is valid, proceed to handler
    return handler(req, res);
  };
}

export default {
  generateCsrfToken,
  validateCsrfToken,
  setCsrfCookie,
  fetchCsrfToken,
  csrfProtection,
  CSRF_HEADER,
  CSRF_COOKIE,
  CSRF_FORM_FIELD,
};
