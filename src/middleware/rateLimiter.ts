import rateLimit from "express-rate-limit";


export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, 
  message: {
    success: false,
    message: "Rate limit exceeded! Please wait 15 minutes. 🕒",
  },
  standardHeaders: true,
  legacyHeaders: false,
});


export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: {
    success: false,
    message: "Too many login attempts, please try again after 15 minutes. 🕒",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
