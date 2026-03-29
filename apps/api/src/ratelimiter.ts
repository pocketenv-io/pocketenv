import type { RequestHandler } from "express";

interface RateLimiterOptions {
  windowMs?: number;
  max?: number;
  keyPrefix?: string;
}

export function createRateLimiter(
  options: RateLimiterOptions = {},
): RequestHandler {
  const windowMs = options.windowMs ?? 60_000; // 1 minute
  const max = options.max ?? 100;
  const keyPrefix = options.keyPrefix ?? "rl";

  return async (req, res, next) => {
    const ip =
      (req.headers["x-forwarded-for"] as string | undefined)
        ?.split(",")[0]
        ?.trim() ??
      req.socket.remoteAddress ??
      "unknown";

    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      const redis = req.ctx.redis;

      const [, , count] = (await redis
        .multi()
        .zRemRangeByScore(key, 0, windowStart)
        .zAdd(key, { score: now, value: `${now}:${Math.random()}` })
        .zCard(key)
        .pExpire(key, windowMs)
        .exec()) as [unknown, unknown, number, unknown];

      const remaining = Math.max(0, max - count);

      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", remaining);
      res.setHeader("X-RateLimit-Reset", Math.ceil((now + windowMs) / 1000));

      if (count > max) {
        res.setHeader("Retry-After", Math.ceil(windowMs / 1000));
        res
          .status(429)
          .json({ error: "Too many requests, please try again later." });
        return;
      }

      next();
    } catch {
      // Fail open — don't block traffic if Redis is unavailable
      next();
    }
  };
}
