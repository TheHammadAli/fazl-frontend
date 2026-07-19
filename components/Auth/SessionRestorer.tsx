"use client";

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { getRefreshToken, getToken } from "@/utils/getToken";
import { refreshAuthTokens } from "@/utils/refreshAuthTokens";
import { setToken } from "@/store/reducers/authReducer";

/**
 * When the access cookie is missing/expired but refreshToken remains,
 * renew the access token before protected queries fire.
 */
export default function SessionRestorer() {
  const dispatch = useDispatch();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    if (getToken() || !getRefreshToken()) return;

    let cancelled = false;

    refreshAuthTokens().then((tokens) => {
      if (cancelled || !tokens?.accessToken) return;
      dispatch(
        setToken({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),
      );
    });

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return null;
}
