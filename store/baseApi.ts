import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";

import { getRefreshToken, getToken } from "@/utils/getToken";
import { refreshAuthTokens } from "@/utils/refreshAuthTokens";
import { logout, setToken } from "./reducers/authReducer";
import { getCookie } from "cookies-next";
import { isGuestSession } from "@/utils/isGuestSession";
import { i18n } from "@/i18n.config";

type AuthSliceState = {
  authReducer?: {
    token?: string;
    refreshToken?: string;
  };
};

/** Login/signup failures must not trigger refresh/logout redirects. */
const PUBLIC_AUTH_ENDPOINTS = new Set([
  "sendOtp",
  "verifyOtp",
  "verifyEmail",
  "signup",
  "signin",
  "forgotPassword",
  "resetPassword",
]);

/** Serialize refresh so parallel 401s do not spam /auth/refreshToken. */
const refreshMutex = new Mutex();

let isRedirectingToSignIn = false;

const resolveLanguage = () => {
  if (typeof window !== "undefined") {
    const firstSegment = window.location.pathname.split("/")[1];
    if (i18n.locales.includes(firstSegment as (typeof i18n.locales)[number])) {
      return firstSegment;
    }
  }
  return getCookie("lang")?.toString() || i18n.defaultLocale;
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: (headers, { endpoint, getState }) => {
    const lang = resolveLanguage();
    headers.set("accept-language", lang);
    const excludeToken = [...PUBLIC_AUTH_ENDPOINTS, "getLocations"];

    if (!excludeToken.includes(endpoint)) {
      const cookieToken = getToken();
      const stateToken = (getState() as AuthSliceState).authReducer?.token;
      const token =
        (typeof cookieToken === "string" && cookieToken) ||
        (typeof stateToken === "string" && stateToken) ||
        "";

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return headers;
  },
});

const redirectToSignIn = () => {
  if (typeof window === "undefined" || isRedirectingToSignIn) return;
  isRedirectingToSignIn = true;
  const locale = resolveLanguage();
  window.location.href = `/${locale}/signin`;
};

const resolveRefreshToken = (getState: () => unknown): string => {
  const fromCookie = getRefreshToken();
  if (fromCookie) return fromCookie;

  const fromState = (getState() as AuthSliceState).authReducer?.refreshToken;
  return typeof fromState === "string" ? fromState : "";
};

const isUsableRefreshToken = (value: string | null | undefined): value is string =>
  Boolean(value && value !== "undefined" && value !== "null");

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions: object) => {
  // Wait if another request is already refreshing the session.
  await refreshMutex.waitForUnlock();

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Wrong password / public auth errors: return to the form, do not redirect.
    if (PUBLIC_AUTH_ENDPOINTS.has(api.endpoint)) {
      return result;
    }
    // Guests have no token; do not clear guest session on public API 401s.
    if (isGuestSession()) {
      return result;
    }

    if (!refreshMutex.isLocked()) {
      const release = await refreshMutex.acquire();
      try {
        const refreshToken = resolveRefreshToken(api.getState);

        if (!isUsableRefreshToken(refreshToken)) {
          api.dispatch(logout());
          redirectToSignIn();
          return result;
        }

        const tokens = await refreshAuthTokens(refreshToken);

        if (tokens?.accessToken) {
          isRedirectingToSignIn = false;
          api.dispatch(
            setToken({
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken ?? refreshToken,
            }),
          );
          // Retry the original request with the new access token.
          result = await rawBaseQuery(args, api, extraOptions);
        } else {
          api.dispatch(logout());
          redirectToSignIn();
        }
      } finally {
        release();
      }
    } else {
      // Another request refreshed the session — retry once with new tokens.
      await refreshMutex.waitForUnlock();

      const stillHasSession =
        Boolean(getToken()) ||
        Boolean((api.getState() as AuthSliceState).authReducer?.token);

      if (stillHasSession) {
        result = await rawBaseQuery(args, api, extraOptions);
      }
    }
  }

  return result;
};

export const baseApi = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "profile",
    "PRODUCT",
    "NOTIFICATIONS",
    "SHOP_DETAIL",
    "SERVICES",
    "SERVICES_REQUESTS",
    "Chat",
    "REVIEW",
    "BROADCAST",
    "ORDERS",
    "CATEGORIES",
    "ADMIN_USERS",
    "ADMIN_CATEGORIES",
  ],
  endpoints: () => ({}),
});

export default baseApi;
