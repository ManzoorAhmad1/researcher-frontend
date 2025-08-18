import { z } from "zod";

let DOMPurify: any;
try {
  DOMPurify = require("dompurify");
} catch (error) {
  console.warn("DOMPurify import failed, will use fallback sanitization");
}

declare global {
  interface Window {
    DOMPurify: any;
  }
  namespace NodeJS {
    interface Global {
      DOMPurify: any;
    }
  }
}

if (
  typeof window === "undefined" &&
  typeof global !== "undefined" &&
  DOMPurify
) {
  try {
    const { JSDOM } = require("jsdom");
    const window = new JSDOM("").window;
    const purify = DOMPurify(window);
    (global as any).DOMPurify = purify;
  } catch (error) {
    console.warn(
      "Failed to initialize DOMPurify for server-side rendering:",
      error
    );
  }
}

/**
 * Sanitize HTML content to prevent XSS
 * Works on both client and server
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  try {
    if (DOMPurify) {
      const purifyInstance =
        typeof window !== "undefined" ? DOMPurify : (global as any).DOMPurify;

      if (purifyInstance) {
        return purifyInstance.sanitize(html, {
          ALLOWED_TAGS: [
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "p",
            "a",
            "ul",
            "ol",
            "li",
            "b",
            "i",
            "strong",
            "em",
            "code",
            "pre",
            "br",
            "span",
            "div",
            "table",
            "thead",
            "tbody",
            "tr",
            "th",
            "td",
            "hr",
          ],
          ALLOWED_ATTR: [
            "href",
            "target",
            "rel",
            "id",
            "class",
            "src",
            "alt",
            "title",
            "width",
            "height",
          ],
          FORBID_TAGS: ["script", "style", "iframe", "form", "input"],
          FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
          ALLOW_DATA_ATTR: false,
        });
      }
    }

    console.warn("Using fallback HTML sanitization method");
    return serverSideHtmlSanitize(html);
  } catch (error) {
    console.error("HTML sanitization failed:", error);
    return serverSideHtmlSanitize(html);
  }
}

function serverSideHtmlSanitize(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/g, "")
    .replace(/on\w+='[^']*'/g, "")
    .replace(/on\w+=\w+/g, "")
    .replace(/javascript:/gi, "blocked:")
    .replace(/data:(?!image\/)/gi, "blocked:")
    .replace(/eval\(/g, "blocked(")
    .replace(/expression\(/g, "blocked(");
}

export function SafeHtml({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const sanitized = sanitizeHtml(html);

  return {
    dangerouslySetInnerHTML: { __html: sanitized },
  };
}

export function sanitizeUrl(url: string): string {
  if (!url) return "";

  if (url.startsWith("/") && !url.startsWith("//")) {
    return url;
  }

  const allowedProtocols = ["http:", "https:"];

  try {
    const urlObj = new URL(url);

    if (!allowedProtocols.includes(urlObj.protocol)) {
      return "#";
    }

    const allowedDomains = ["researchcollab.com", "localhost"];

    if (allowedDomains.length > 0) {
      const isDomainAllowed = allowedDomains.some(
        (domain) =>
          urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
      );

      if (!isDomainAllowed) {
        return `${url}`;
      }
    }

    return url;
  } catch (e) {
    return "#";
  }
}

export function sanitizeQueryParam(param: string): string {
  if (!param) return "";

  return param.replace(/[<>"'%;()&+]/g, "").trim();
}

const emailSchema = z.string().email();
const passwordSchema = z.string().min(8);
const usernameSchema = z
  .string()
  .min(3)
  .max(50)
  .regex(/^[a-zA-Z0-9_-]+$/);
const nameSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9 ._-]+$/);

export function validateEmail(email: string): boolean {
  const result = emailSchema.safeParse(email);
  return result.success;
}

export function validatePassword(password: string): boolean {
  const result = passwordSchema.safeParse(password);
  return result.success;
}

export function validateUsername(username: string): boolean {
  const result = usernameSchema.safeParse(username);
  return result.success;
}

export default {
  sanitizeHtml,
  sanitizeUrl,
  sanitizeQueryParam,
  validateEmail,
  validatePassword,
  validateUsername,
  SafeHtml,
};
