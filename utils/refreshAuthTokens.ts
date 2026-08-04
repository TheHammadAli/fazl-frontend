import { BASE_URL } from "@/assets/content/constants";
import { extractAuthTokens, setAuthTokens } from "@/utils/authCookies";
import { getRefreshToken } from "@/utils/getToken";

export type RefreshedTokens = {
  accessToken: string;
  refreshToken: string;
};

/** One in-flight refresh shared by parallel 401s. */
let inFlight: Promise<RefreshedTokens | null> | null = null;

/**
 * POST /auth/refreshToken with `{ token: refreshToken }`.
 * Saves BOTH new accessToken and refreshToken cookies immediately
 * (backend rotates refresh token — old one becomes invalid after first use).
 *
 * Response shape: `{ data: { accessToken, refreshToken, user } }`
 * Persist `data.refreshToken` — not `data.user.refreshToken`.
 */
export function refreshAuthTokens(
  refreshTokenOverride?: string,
): Promise<RefreshedTokens | null> {
  if (inFlight) return inFlight;

  const promise = (async (): Promise<RefreshedTokens | null> => {
    const currentRefresh = (
      refreshTokenOverride ||
      getRefreshToken() ||
      ""
    ).trim();
    if (!currentRefresh) return null;

    const response = await fetch(`${BASE_URL}/auth/refreshToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: currentRefresh }),
    });

    if (!response.ok) return null;

    const json = await response.json();
    const payload =
      json?.data && typeof json.data === "object"
        ? (json.data as Record<string, unknown>)
        : null;

    const accessToken =
      typeof payload?.accessToken === "string"
        ? payload.accessToken.trim()
        : "";
    // Must come from data.refreshToken, never data.user.refreshToken
    const apiRefresh =
      typeof payload?.refreshToken === "string"
        ? payload.refreshToken.trim()
        : "";

    if (accessToken) {
      const nextRefresh = apiRefresh || currentRefresh;
      setAuthTokens({
        accessToken,
        refreshToken: nextRefresh,
      });
      return { accessToken, refreshToken: nextRefresh };
    }

    // Fallback for alternate response shapes
    const tokens = extractAuthTokens(json);
    if (!tokens?.accessToken) return null;

    const nextRefresh = tokens.refreshToken?.trim() || currentRefresh;
    setAuthTokens({
      accessToken: tokens.accessToken,
      refreshToken: nextRefresh,
    });
    return {
      accessToken: tokens.accessToken,
      refreshToken: nextRefresh,
    };
  })().catch(() => null);

  inFlight = promise;
  void promise.finally(() => {
    if (inFlight === promise) inFlight = null;
  });

  return promise;
}
