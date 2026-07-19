import { BASE_URL } from "@/assets/content/constants";
import { extractAuthTokens } from "@/utils/authCookies";
import { getRefreshToken, getToken } from "@/utils/getToken";
import { getCookie } from "cookies-next";
import { i18n } from "@/i18n.config";

export type RefreshedTokens = {
  accessToken: string;
  refreshToken?: string;
};

let inFlightRefresh: Promise<RefreshedTokens | null> | null = null;

function resolveLanguage(): string {
  if (typeof window !== "undefined") {
    const firstSegment = window.location.pathname.split("/")[1];
    if (i18n.locales.includes(firstSegment as (typeof i18n.locales)[number])) {
      return firstSegment;
    }
  }
  return getCookie("lang")?.toString() || i18n.defaultLocale;
}

/**
 * Single-flight refresh: concurrent callers share one /auth/refreshToken request.
 */
export function refreshAuthTokens(
  refreshTokenOverride?: string,
): Promise<RefreshedTokens | null> {
  if (inFlightRefresh) return inFlightRefresh;

  inFlightRefresh = (async () => {
    const refreshToken = refreshTokenOverride || getRefreshToken();
    if (!refreshToken) return null;

    // Another caller may have already restored the access token.
    const existing = getToken();
    if (existing && !refreshTokenOverride) {
      return { accessToken: existing, refreshToken };
    }

    const response = await fetch(`${BASE_URL}/auth/refreshToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept-language": resolveLanguage(),
      },
      body: JSON.stringify({
        token: refreshToken,
        refreshToken,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const tokens = extractAuthTokens(data);
    if (!tokens?.accessToken) return null;

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken ?? refreshToken,
    };
  })()
    .catch(() => null)
    .finally(() => {
      inFlightRefresh = null;
    });

  return inFlightRefresh;
}
