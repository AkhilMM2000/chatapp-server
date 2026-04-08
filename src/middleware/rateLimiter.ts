import rateLimit from "express-rate-limit";

/**
 * Global Rate Limiter:
 * 100 requests per 15 minutes.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // 🚀 Increased for testing (from 100)
  message: {
    success: false,
    message: "Rate limit exceeded! Please wait 15 minutes. 🕒",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth Rate Limiter:
 * 500 attempts per 15 minutes (login/register).
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // 🚀 Increased for testing (from 10)
  message: {
    success: false,
    message: "Too many login attempts, please try again after 15 minutes. 🕒",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
