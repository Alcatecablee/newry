/**
 * Rate limiting implementation for API endpoints
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export class RateLimiter {
  private static instances = new Map<string, RateLimiter>();
  private requests = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  static create(name: string, config: RateLimitConfig): RateLimiter {
    if (!this.instances.has(name)) {
      this.instances.set(name, new RateLimiter(config));
    }
    return this.instances.get(name)!;
  }

  checkLimit(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs,
        firstRequest: now,
      });

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
      };
    }

    entry.count++;

    if (entry.count > this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      };
    }

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.requests.entries());
    
    for (const [key, entry] of entries) {
      if (now > entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  reset(identifier?: string): void {
    if (identifier) {
      this.requests.delete(identifier);
    } else {
      this.requests.clear();
    }
  }
}

// Pre-configured rate limiters
export const rateLimiters = {
  // General API requests: 100 requests per 15 minutes
  api: RateLimiter.create("api", {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
  }),

  // File uploads: 10 uploads per hour
  upload: RateLimiter.create("upload", {
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
  }),

  // Transformations: 50 per hour for free users
  transform: RateLimiter.create("transform", {
    windowMs: 60 * 60 * 1000,
    maxRequests: 50,
  }),

  // Authentication: 5 attempts per 15 minutes
  auth: RateLimiter.create("auth", {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  }),

  // Admin operations: 20 per hour
  admin: RateLimiter.create("admin", {
    windowMs: 60 * 60 * 1000,
    maxRequests: 20,
  }),
};

export function getRateLimitMiddleware(limiterName: keyof typeof rateLimiters) {
  return (req: any, res: any, next: any) => {
    const limiter = rateLimiters[limiterName];
    const identifier = req.ip || req.connection?.remoteAddress || "unknown";

    const result = limiter.checkLimit(identifier);

    // Set rate limit headers
    res.set({
      "X-RateLimit-Limit": limiter["config"].maxRequests.toString(),
      "X-RateLimit-Remaining": result.remaining.toString(),
      "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
    });

    if (!result.allowed) {
      res.set("Retry-After", result.retryAfter?.toString() || "900");
      return res.status(429).json({
        error: "Too Many Requests",
        message: "Rate limit exceeded",
        retryAfter: result.retryAfter,
      });
    }

    next();
  };
}
