import { deleteCookie, setCookie } from "cookies-next";

const COOKIE_PATH = "/";

/** Keep access cookie until refresh expires so proxy does not kick users out. */
export const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

/** Keep users signed in across sessions until refresh token expires. */
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

export function setAdminRoleCookie(isAdmin: boolean) {
  setCookie("isAdmin", isAdmin ? "true" : "false", {
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

export function extractAuthTokens(data: unknown): {
  accessToken: string;
  refreshToken?: string;
} | null {
  if (!data || typeof data !== "object") return null;

  const root = data as Record<string, unknown>;
  const nested =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;

  const pickString = (...keys: string[]) => {
    for (const source of [nested, root]) {
      for (const key of keys) {
        const value = source[key];
        if (typeof value === "string" && value.trim()) return value.trim();
      }
    }
    return undefined;
  };

  const accessToken = pickString(
    "accessToken",
    "access_token",
    "token",
  );

  const refreshToken = pickString(
    "refreshToken",
    "refresh_token",
  );

  if (!accessToken) return null;

  // Avoid treating the refresh token itself as the access token when APIs
  // only return `{ token: <refresh> }`.
  if (refreshToken && accessToken === refreshToken && !nested.accessToken && !root.accessToken) {
    return null;
  }

  return refreshToken ? { accessToken, refreshToken } : { accessToken };
}
