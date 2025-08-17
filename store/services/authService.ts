import { sign, verify } from "crypto";
import { baseApi } from "../baseApi";
import VerifyOtp from "@/components/Auth/VerifyOtp";
import { register } from "module";

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
  }),
});
export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useSignupMutation,
  useSigninMutation,
} = authService;
