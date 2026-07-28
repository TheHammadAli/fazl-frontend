"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import tickIcon from "@/assets/icons/tick-circle.svg";
import Image from "next/image";
import { useGetUserWithProvidedTokenQuery } from "@/store/services/authService";
import { useAppDispatch } from "@/store/store";
import {
  logout,
  setProfileCompleted,
  setToken,
  setUserId,
} from "@/store/reducers/authReducer";
import { useLazyGetUserDetailQuery } from "@/store/services/profileService";
import { getCookie } from "cookies-next";
import { i18n } from "@/i18n.config";
import { isAdminOnlyAccount } from "@/utils/userRoles";
import toast from "react-hot-toast";
import { useDictionary } from "@/dictionaries/DictionaryProvider";

function getLocalePrefix() {
  const lang = getCookie("lang");
  const locale =
    typeof lang === "string" &&
    i18n.locales.includes(lang as (typeof i18n.locales)[number])
      ? lang
      : i18n.defaultLocale;
  return `/${locale}`;
}

function handledStorageKey(token: string) {
  return `google-oauth-handled:${token}`;
}

export default function GoogleCallback() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { error_messages } = useDictionary();
  const [profileError, setProfileError] = useState(false);
  const [stopQueries, setStopQueries] = useState(false);

  const token = searchParams.get("token");
  const refreshToken = searchParams.get("refreshToken");

  const {
    data: user,
    isLoading,
    isFetching,
    isSuccess,
    isError,
  } = useGetUserWithProvidedTokenQuery(
    { token },
    { skip: !token || stopQueries },
  );

  const [getUserDetail, { isLoading: detailLoading }] =
    useLazyGetUserDetailQuery();

  const loading =
    Boolean(token) && !stopQueries && (isLoading || isFetching || detailLoading);

  useEffect(() => {
    if (!token) return;

    // Remount / back-navigation guard — leave this page once per token.
    if (sessionStorage.getItem(handledStorageKey(token)) === "1") {
      setStopQueries(true);
      window.location.replace(`${getLocalePrefix()}/welcome`);
    }
  }, [token]);

  useEffect(() => {
    if (!token || !isSuccess || stopQueries) return;
    if (sessionStorage.getItem(handledStorageKey(token)) === "1") return;

    const userId = user?.data?.sub;
    if (!userId) return;

    // Persist before async work so remounts cannot start another loop.
    sessionStorage.setItem(handledStorageKey(token), "1");
    setStopQueries(true);
    setProfileError(false);

    dispatch(
      setToken({
        accessToken: token,
        ...(refreshToken ? { refreshToken } : {}),
      }),
    );
    dispatch(setUserId(userId));

    void getUserDetail(userId)
      .unwrap()
      .then((detailRes) => {
        const profile = detailRes?.data;
        if (!profile) {
          sessionStorage.removeItem(handledStorageKey(token));
          setStopQueries(false);
          setProfileError(true);
          return;
        }

        if (isAdminOnlyAccount(profile)) {
          sessionStorage.removeItem(handledStorageKey(token));
          dispatch(logout());
          toast.error(error_messages.admin_login_not_allowed);
          window.location.replace(`${getLocalePrefix()}/signin`);
          return;
        }

        try {
          localStorage.setItem("user", JSON.stringify({ user: profile }));
        } catch {
          // Ignore storage failures; auth cookies already set.
        }

        if (!profile.phone) {
          dispatch(setProfileCompleted(false));
          window.location.replace(`${getLocalePrefix()}/complete-info`);
          return;
        }

        dispatch(setProfileCompleted(true));
        window.location.replace(`${getLocalePrefix()}/welcome`);
      })
      .catch(() => {
        sessionStorage.removeItem(handledStorageKey(token));
        setStopQueries(false);
        setProfileError(true);
      });
    // getUserDetail omitted on purpose (unstable identity caused repeat runs).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, user?.data?.sub, token, refreshToken, dispatch, stopQueries]);

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white shadow-md rounded-2xl p-8 flex flex-col items-center w-96">
          <div className="flex items-center justify-center h-12 w-12 bg-red-100 rounded-full">
            ❌
          </div>
          <p className="mt-4 text-red-600 font-medium text-center">
            Missing login token. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white shadow-md rounded-2xl p-8 flex flex-col items-center w-96">
        {(loading || stopQueries) && !profileError && !isError && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-1 border-t-transparent" />
            <p className="mt-4 text-gray-8 text-center">
              Signing you in with Google...
            </p>
          </>
        )}

        {(isError || profileError) && (
          <>
            <div className="flex items-center justify-center h-12 w-12 bg-red-100 rounded-full">
              ❌
            </div>
            <p className="mt-4 text-red-600 font-medium text-center">
              Something went wrong. Please try again.
            </p>
          </>
        )}

        {!loading && !stopQueries && isSuccess && !isError && !profileError && (
          <>
            <div className="flex items-center justify-center h-12 w-12 bg-green-4 rounded-full">
              <Image src={tickIcon} alt="tick-icon" />
            </div>
            <p className="mt-4 text-green-1 font-medium text-center">
              Login successful! Redirecting...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
