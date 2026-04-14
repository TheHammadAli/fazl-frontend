import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
} from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "@/assets/content/constants";
import { getRefreshToken, getToken } from "@/utils/getToken";
import { logout, setToken } from "./reducers/authReducer";
interface BaseQueryArgs {
  url: string;
  method: string;
  // Add other properties as needed
}
const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { endpoint }) => {
    const token = getToken();
    const excludeToken = [
      "sendOtp",
      "verifyOtp",
      "verifyEmail",
      "signup",
      "forgotPassword",
      "resetPassword",
      "getLocations",
    ];

    if (token && !excludeToken.includes(endpoint)) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions: object) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = getRefreshToken();
    if (!refreshToken || refreshToken === "" || refreshToken === "undefined") {
      api.dispatch(logout());
      window.location.href = "/";
      return result;
    }
    const refreshResult = (await rawBaseQuery(
      {
        url: "/auth/refreshToken",
        method: "POST",
        body: {
          token: refreshToken,
        },
      },
      api,
      extraOptions,
    )) as { data: { data: { accessToken: string; refreshToken: string } } };
    if (refreshResult?.data) {
      api.dispatch(
        setToken({
          accessToken: refreshResult?.data?.data?.accessToken,
          refreshToken: refreshResult?.data?.data?.refreshToken,
        }),
      );
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
      window.location.href = "/";
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
  ],
  endpoints: (builder) => ({}),
});

export default baseApi;
