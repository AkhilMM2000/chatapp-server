export const AUTH = {
  REFRESH_TOKEN_COOKIE: "refreshToken",
   STRICT_MODE: "strict",
  LAX_MODE: "lax",
  NONE_MODE: "none",
  PRODUCTION: "production",
} as const
export type SameSiteMode = typeof AUTH[keyof typeof AUTH];