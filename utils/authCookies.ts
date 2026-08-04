import { deleteCookie, setCookie } from "cookies-next";

const COOKIE_PATH = "/";

export const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

const baseOptions = {
  path: COOKIE_PATH,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export function setAccessTokenCookie(token: string) {
  setCookie("token", token, {
    ...baseOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
}

export function setRefreshTokenCookie(token: string) {
  setCookie("refreshToken", token, {
    ...baseOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export function setAuthTokens(tokens: {
  accessToken: string;
  refreshToken?: string;
}) {
  setAccessTokenCookie(tokens.accessToken);
  // Always keep refresh cookie in sync when access is updated.
  if (tokens.refreshToken) {
    setRefreshTokenCookie(tokens.refreshToken);
  }
}

export function setUserIdCookie(userId: string) {
  setCookie("userId", userId, {
    ...baseOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export function setProfileCompletedCookie(completed: boolean) {
  setCookie("profileCompleted", completed ? "true" : "false", {
    ...baseOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export function clearAuthCookies() {
  const opts = { path: COOKIE_PATH };
  deleteCookie("token", opts);
  deleteCookie("refreshToken", opts);
  deleteCookie("userId", opts);
  deleteCookie("profileCompleted", opts);
  deleteCookie("isGuest", opts);
  deleteCookie("isAdmin", opts);
}

/** Reads accessToken + refreshToken from refresh/login response.
 * Prefer `data.accessToken` / `data.refreshToken` — not `data.user.refreshToken`
 * (user may still hold a rotated/stale refresh token).
 */
export function extractAuthTokens(data: unknown): {
  accessToken: string;
  refreshToken?: string;
} | null {
  if (!data || typeof data !== "object") return null;

  const root = data as Record<string, unknown>;
  const nested =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : null;

  const readString = (
    source: Record<string, unknown> | null,
    ...keys: string[]
  ) => {
    if (!source) return undefined;
    for (const key of keys) {
      const value = source[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
    return undefined;
  };

  const accessToken =
    readString(nested, "accessToken", "access_token") ||
    readString(root, "accessToken", "access_token");

  // Only from data / root — never from data.user
  const refreshToken =
    readString(nested, "refreshToken", "refresh_token") ||
    readString(root, "refreshToken", "refresh_token");

  if (!accessToken) return null;
  return refreshToken ? { accessToken, refreshToken } : { accessToken };
}
