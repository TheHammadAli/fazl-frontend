import { baseApi } from "../baseApi";

// Define or import these interfaces from the correct location

export const authService = baseApi.injectEndpoints({
  endpoints: (build) => ({
    sendOtp: build.mutation({
      query: (body) => ({
        url: "/auth/send-otp",
        method: "POST",
        body,
      }),
    }),
    verifyOtp: build.mutation({
      query: (body) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body,
      }),
    }),
    // this is for resed
    verifyEmail: build.mutation({
      query: (body) => ({
        url: "/auth/verify-email",
        method: "POST",
        body,
      }),
    }),
    signup: build.mutation({
      query: (body) => ({
        url: "/users/createUser",
        method: "POST",
        body,
      }),
    }),
    signin: build.mutation({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),
    forgotPassword: build.mutation({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    resetPassword: build.mutation({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "PUT",
        body,
      }),
    }),
    getLocations: build.query({
      query: (params) => ({
        url: `/search/autocomplete-locations?q=${new URLSearchParams(params)}`,
        method: "GET",
      }),
    }),
  }),
});
export const {
  useGetLocationsQuery,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useSignupMutation,
  useSigninMutation,
} = authService;
