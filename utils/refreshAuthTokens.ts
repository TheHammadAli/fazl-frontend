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
    const tokens = extractAuthTokens(json);
    if (!tokens?.accessToken) return null;

    // Backend rotates refresh tokens — must persist the NEW refreshToken.
    // Falling back to the old one only if API omits it.
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
