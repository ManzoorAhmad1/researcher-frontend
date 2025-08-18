interface RateLimitRecord {
  count: number;
  resetAt: number;
  blocked: boolean;
}

export class RateLimiter {
  private limits: Map<string, RateLimitRecord>;

  constructor() {
    this.limits = new Map<string, RateLimitRecord>();
    if (typeof setInterval !== "undefined") {
      setInterval(() => this.cleanup(), 60 * 60 * 1000);
    }
  }

  /**
   * Check if a request should be rate limited
   *
   * @param key Unique identifier for the rate limit (e.g., IP + route)
   * @param maxRequests Maximum number of requests allowed in the time window
   * @param windowMs Time window in milliseconds
   * @param blockDurationMs How long to block after exceeding limit (defaults to windowMs)
   * @returns True if the request should be blocked, false otherwise
   */
  isRateLimited(
    key: string,
    maxRequests: number = 100,
    windowMs: number = 60 * 1000,
    blockDurationMs?: number
  ): boolean {
    const now = Date.now();

    // Get or create rate limit record
    const record = this.limits.get(key) || {
      count: 0,
      resetAt: now + windowMs,
      blocked: false,
    };

    if (record.blocked) {
      const blockResetTime = record.resetAt + (blockDurationMs || windowMs);
      if (now > blockResetTime) {
        // Block expired, reset
        record.blocked = false;
        record.count = 1;
        record.resetAt = now + windowMs;
        this.limits.set(key, record);
        return false;
      }
      return true; // Still blocked
    }

    if (now > record.resetAt) {
      // Window expired, reset counter
      record.count = 1;
      record.resetAt = now + windowMs;
      this.limits.set(key, record);
      return false;
    }

    record.count += 1;

    if (record.count > maxRequests) {
      record.blocked = true;
      this.limits.set(key, record);
      return true;
    }

    // Update record and continue
    this.limits.set(key, record);
    return false;
  }

  getRateLimitInfo(key: string): {
    remaining: number;
    resetAt: number;
    blocked: boolean;
  } | null {
    const record = this.limits.get(key);
    if (!record) return null;

    const maxRequests = 100; // Default max requests

    return {
      remaining: Math.max(0, maxRequests - record.count),
      resetAt: record.resetAt,
      blocked: record.blocked,
    };
  }

  resetLimit(key: string): void {
    this.limits.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();

    for (const [key, record] of this.limits.entries()) {
      if (record.blocked) {
        const blockExpiryTime = record.resetAt + 60 * 60 * 1000;
        if (now > blockExpiryTime) {
          this.limits.delete(key);
        }
        continue;
      }

      if (now > record.resetAt) {
        this.limits.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

export function rateLimitMiddleware(
  options: {
    windowMs?: number;
    maxRequests?: number;
    keyGenerator?: (req: any) => string;
    blockDuration?: number;
    message?: string;
  } = {}
) {
  const {
    windowMs = 60 * 1000, // 1 minute
    maxRequests = 100,
    blockDuration,
    message = "Too many requests, please try again later",
    keyGenerator = (req) => {
      // Default: IP + route
      const ip =
        req.headers["x-forwarded-for"] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        "unknown";
      return `${ip}:${req.method}:${req.url}`;
    },
  } = options;

  return (req: any, res: any, next: Function) => {
    const key = keyGenerator(req);

    // Check rate limit
    if (rateLimiter.isRateLimited(key, maxRequests, windowMs, blockDuration)) {
      const info = rateLimiter.getRateLimitInfo(key);

      if (info) {
        res.setHeader(
          "Retry-After",
          Math.ceil((info.resetAt - Date.now()) / 1000)
        );
        res.setHeader("X-RateLimit-Limit", maxRequests);
        res.setHeader("X-RateLimit-Remaining", info.remaining);
        res.setHeader("X-RateLimit-Reset", Math.ceil(info.resetAt / 1000));
      }

      // Send rate limit response
      return res.status(429).json({
        error: message,
      });
    }

    // Not rate limited, proceed
    next();
  };
}

export default {
  rateLimiter,
  rateLimitMiddleware,
};
