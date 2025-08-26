import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "@/assets/content/constants";
import { getToken } from "@/utils/getToken";
// import { getToken } from "../utils/getToken";

const excludeToken = [
  "sendOtp",
  "verifyOtp",
  "verifyEmail",
  "signup",
  "forgotPassword",
  "resetPassword",
  "getLocations",
];

export const baseApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { endpoint }) => {
      const token = getToken();
      if (!excludeToken.includes(endpoint) && token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["profile"],
  endpoints: (builder) => ({}),
});

// Needed code for refresh token in near future //
// import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import { BASE_URL } from '@/constants/Constants';
// import { getToken, setToken } from '../utils/tokenUtils';
// import { logout } from '../features/auth/authSlice';
// const baseQuery = fetchBaseQuery({
//   baseUrl: BASE_URL,
//   prepareHeaders: (headers, { endpoint }) => {
//     const token = getToken();
//     if (token && !excludeToken.includes(endpoint)) {
//       headers.set('Authorization', `Bearer ${token}`);
//     }
//     return headers;
//   },
// });

// const baseQueryWithReauth = async (args, api, extraOptions) => {
//   let result = await baseQuery(args, api, extraOptions);

//   if (result.error && result.error.status === 401) {
//     // Attempt to refresh the token
//     const refreshResult = await baseQuery(
//       {
//         url: '/auth/refresh-token',
//         method: 'POST',
//         body: { token: getToken() }, // Adjust according to your refresh token structure
//       },
//       api,
//       extraOptions
//     );

//     if (refreshResult.data) {
//       // Store the new token
//       setToken(refreshResult.data.token);
//       // Retry the original query with the new token
//       result = await baseQuery(args, api, extraOptions);
//     } else {
//       // Handle token refresh failure (e.g., redirect to login)
//       api.dispatch(logout());
//     }
//   }

//   return result;
// };

// export default baseQueryWithReauth;
